// ===============================================
// 📅 BOOKING ROUTES
// ===============================================
// This file handles:
// 1. Creating new bookings (POST /)
// 2. Checking booking status (GET /:ref)

// --- DEPENDENCIES ---
const express = require('express');
const { body, validationResult } = require('express-validator'); // Tools for checking forms

// --- DATABASE CONNECTION ---
const db = require('../config/db');

// --- MIDDLEWARE (Safety Checks) ---
const upload = require('../middleware/uploadMiddleware'); // Handles file uploads
const { bookingLimiter, statusCheckLimiter } = require('../middleware/rateLimiter'); // Prevents spam
const { statusCheckValidation } = require('../middleware/validation'); // Checks if data is correct

// --- INITIALIZATION ---
// Create a "router" to handle these specific paths
const router = express.Router();

// ===============================================
// 1. CREATE NEW BOOKING
// Path: POST /api/bookings/
// ===============================================
router.post('/', 
    // Step 1: Check for spam (Rate Limit)
    bookingLimiter,
    
    // Step 2: Handle up to 5 image uploads
    upload.array('before_service_images', 5),
    
    // Step 3: Validate the text fields
    [
        body('customer_name').trim().notEmpty().withMessage('Name is required').escape(),
        body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('phone').trim().notEmpty().withMessage('Phone is required').escape(),
        body('device_model').trim().notEmpty().withMessage('Device model is required').escape()
    ],
    
    // Step 4: The Main Logic
    (req, res) => {
        // Did Step 3 find any errors?
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

        // Get the form data
        const data = req.body;
        
        // Process uploaded images (if any)
        const imageFiles = req.files || [];
        // Convert file objects to simple URL strings
        const imagePaths = imageFiles.map(file => `/uploads/before-service/${file.filename}`);
        // Database needs JSON string for list of images
        const imagesJson = JSON.stringify(imagePaths);
        
        // Generate a random Reference Code (e.g., REF1234)
        const refCode = 'REF' + Math.floor(1000 + Math.random() * 9000);

        // SQL Command to save everything to database
        const sql = `INSERT INTO bookings (reference_code, customer_name, email, phone, device_type, device_model, issue_category, issue_desc, preferred_date, before_service_images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        // Run the SQL command
        db.query(sql, [refCode, data.customer_name, data.email, data.phone, data.device_type, data.device_model, data.issue_category, data.issue_desc, data.preferred_date || null, imagesJson], 
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            // Success! Send the reference code back to the user
            res.json({ success: true, reference_code: refCode, uploaded_images: imagePaths });
        });
});

// ===============================================
// 2. CHECK BOOKING STATUS
// Path: GET /api/bookings/:ref
// Example: /api/bookings/REF1234?email=john@example.com
// ===============================================
router.get('/:ref', 
    statusCheckLimiter, // Spam protection
    statusCheckValidation, // Check input
    (req, res) => {
        const refCode = req.params.ref; // From URL
        const email = req.query.email;  // From ?email=...

        // Find match in database
        db.query("SELECT * FROM bookings WHERE reference_code = ? AND email = ?", [refCode, email], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            
            if (results.length > 0) {
                const booking = results[0];
                
                // Helper to safely parse JSON strings from DB back into Arrays
                const safeParse = (d) => { try { return JSON.parse(d || '[]'); } catch { return []; } };
                
                // Convert image strings back to arrays for the frontend
                booking.received_condition_images = typeof booking.received_condition_images === 'string' ? safeParse(booking.received_condition_images) : booking.received_condition_images;
                booking.after_service_images = typeof booking.after_service_images === 'string' ? safeParse(booking.after_service_images) : booking.after_service_images;
                booking.before_service_images = typeof booking.before_service_images === 'string' ? safeParse(booking.before_service_images) : booking.before_service_images;

                res.json({ success: true, booking });
            } else {
                res.json({ success: false, message: 'Invalid Reference Code or Email' });
            }
        });
    }
);

module.exports = router;
