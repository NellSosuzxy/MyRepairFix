// ===============================================
// ADMIN ROUTES - Dashboard and Management
// ===============================================

// --- DEPENDENCIES ---
const express = require('express');

// --- CONFIG & DATABASE ---
const db = require('../config/db');

// --- MIDDLEWARE ---
const { checkAuth, checkOwner } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { bookingIdValidation, statusUpdateValidation } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { auditLog } = require('../middleware/security'); // Import Audit Log

// --- INITIALIZATION ---
const router = express.Router();

// ===============================================
// DASHBOARD ENDPOINTS
// ===============================================

// Get Stats (Counts)
router.get('/stats', checkAuth, asyncHandler(async (req, res) => {
    // Parallel queries for efficiency
    const queries = {
        pending: "SELECT COUNT(*) as count FROM bookings WHERE status = 'Pending'",
        repairing: "SELECT COUNT(*) as count FROM bookings WHERE status = 'In-Progress'",
        completed: "SELECT COUNT(*) as count FROM bookings WHERE status = 'Completed'",
        online: "SELECT COUNT(*) as count FROM admins WHERE last_seen > NOW() - INTERVAL 5 MINUTE"
    };

    const stats = {};
    
    // Run queries
    // Note: In production with promises, Promise.all is cleaner. 
    // Here we nest callbacks or use promise wrapper if available. SetupRoutes used promise().
    try {
        const [pending] = await db.promise().query(queries.pending);
        const [repairing] = await db.promise().query(queries.repairing);
        const [completed] = await db.promise().query(queries.completed);
        const [online] = await db.promise().query(queries.online);

        stats.pending = pending[0].count;
        stats.repairing = repairing[0].count;
        stats.completed = completed[0].count;
        stats.online_staff = online[0].count;

        res.json({ success: true, stats });
    } catch (err) {
        console.error("Stats Error", err);
        res.status(500).json({ success: false, message: 'Stats error' });
    }
}));

// Get Online Staff
router.get('/users/online', checkAuth, asyncHandler(async (req, res) => {
    const sql = "SELECT id, username, role, last_seen FROM admins WHERE last_seen > NOW() - INTERVAL 5 MINUTE";
    const [users] = await db.promise().query(sql);
    res.json({ success: true, users });
}));

// Get Audit Logs (Owner Only)
router.get('/logs', checkAuth, checkOwner, asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const sql = "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?";
    const [logs] = await db.promise().query(sql, [limit]);
    res.json({ success: true, logs });
}));

// ===============================================
// BOOKING MANAGEMENT
// ===============================================

// Get All Bookings
// GET /api/admin/bookings
router.get('/', checkAuth, asyncHandler(async (req, res) => {
    db.query("SELECT * FROM bookings ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, bookings: results });
    });
}));

// Update Status
// PATCH /api/admin/bookings/:id/status
router.patch('/:id/status', checkAuth, statusUpdateValidation, asyncHandler(async (req, res) => {
    let newStatus = req.body.status;
    
    // Normalize status to match Database ENUM values
    if (newStatus === 'In Progress') newStatus = 'In-Progress';
    if (newStatus === 'Cancelled') newStatus = 'Canceled';

    db.query("UPDATE bookings SET status = ? WHERE id = ?", [newStatus, req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        
        // LOG ACTION
        auditLog('UPDATE_STATUS', req.session.userId, req.session.username, `Booking ${req.params.id} -> ${newStatus}`, req.ip);
        
        res.json({ success: true, message: 'Status updated' });
    });
}));

// Delete Booking (Owner)
// DELETE /api/admin/bookings/:id
router.delete('/:id', checkAuth, checkOwner, bookingIdValidation, asyncHandler(async (req, res) => {
    db.query("DELETE FROM bookings WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        
        // LOG ACTION
        auditLog('DELETE_BOOKING', req.session.userId, req.session.username, `Deleted Booking ${req.params.id}`, req.ip);

        res.json({ success: true, message: 'Booking deleted' });
    });
}));

// Upload Admin Images
// POST /api/admin/bookings/:id/images
router.post('/:id/images', checkAuth, upload.array('admin_images', 10), asyncHandler(async (req, res) => {
    try {
        const stage = req.body.stage;
        const bookingId = req.params.id;
        console.log(`[Admin] Uploading images. Booking: ${bookingId}, Stage: ${stage}`);
        console.log(`[Admin] Files received: ${req.files ? req.files.length : 0}`);

        // Validate stage to prevent SQL injection
        if (!['received-condition', 'after-service'].includes(stage)) {
            console.warn(`[Admin] Invalid stage: ${stage}`);
            return res.status(400).json({ success: false, message: 'Invalid stage value' });
        }
        
        // Logic from server.js
        const imageFiles = req.files || [];
        if (imageFiles.length === 0) {
             console.warn('[Admin] No files uploaded');
             // return res.status(400).json({ success: false, message: 'No files uploaded' });
             // Allow updating with empty if just clearing? No, this is append logic usually or replace.
        }

        const imagePaths = imageFiles.map(file => `/uploads/${stage}/${file.filename}`);
        const imagesJson = JSON.stringify(imagePaths);
        
        const columnName = stage === 'received-condition' ? 'received_condition_images' : 'after_service_images';
        
        const sql = `UPDATE bookings SET ${columnName} = ? WHERE id = ?`;
        
        // Use promise wrapper if available or standard callback
        db.query(sql, [imagesJson, bookingId], (err, result) => {
            if (err) {
                console.error('[Admin] Database update failed:', err);
                return res.status(500).json({ success: false, message: 'Database error: ' + err.message });
            }
            
            // LOG ACTION
            auditLog('UPLOAD_PHOTO', req.session.userId, req.session.username, `Uploaded ${imagePaths.length} photos to Booking ${bookingId} (${stage})`, req.ip);
    
            res.json({ success: true, uploaded_images: imagePaths });
        });
    } catch (error) {
        console.error('[Admin] Upload Route Error:', error);
        res.status(500).json({ success: false, message: 'Server error during upload: ' + error.message });
    }
}));

// Get Booking Images (Admin Use)
// GET /api/admin/bookings/:id/images
router.get('/:id/images', checkAuth, asyncHandler(async (req, res) => {
     const bookingId = req.params.id;
     
     const sql = "SELECT before_service_images, received_condition_images, after_service_images FROM bookings WHERE id = ?";
     db.query(sql, [bookingId], (err, results) => {
         if (err) {
             console.error('❌ Database error:', err);
             return res.status(500).json({ success: false, message: 'Database error' });
         }
         
         if (results.length > 0) {
             const booking = results[0];
             const safeParse = (data) => {
                 if (Array.isArray(data)) return data;
                 try {
                     return JSON.parse(data || '[]');
                 } catch (error) {
                     return data ? [data] : [];
                 }
             };

             res.json({
                 success: true,
                 images: {
                     before: safeParse(booking.before_service_images),
                     received: safeParse(booking.received_condition_images),
                     after: safeParse(booking.after_service_images)
                 }
             });
         } else {
             res.status(404).json({ success: false, message: 'Booking not found' });
         }
     });
}));

module.exports = router;
