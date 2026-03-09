const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ===============================================
// IP RESTRICTION
// ===============================================
// ::1 = Localhost IPv6
// 127.0.0.1 = Localhost IPv4
// 192.168.0.226 = Your current laptop Wi-Fi IP
const ALLOWED_ADMIN_IPS = ['::1', '127.0.0.1', '192.168.0.226']; // Add your real static IPs here

const checkIP = (req, res, next) => {
    // Basic IP extraction (works for local and basic proxies)
    // For production behind proxies (Nginx/Cloudflare), you might need req.headers['x-forwarded-for']
    let clientIP = req.ip || req.connection.remoteAddress;

    // Normalize IPv6 mapped IPv4
    if (clientIP.substr(0, 7) == "::ffff:") {
        clientIP = clientIP.substr(7);
    }
    
    // Check if path is an admin path
    if (req.path.startsWith('/api/admin') || req.path.startsWith('/admin.html')) {
        if (!ALLOWED_ADMIN_IPS.includes(clientIP)) {
            console.warn(`[SECURITY] Blocked admin access attempt from IP: ${clientIP}`);
            // Don't return 403 immediately to avoid revealing admin path exists? 
            // Or return 403 for honest feedback. User asked for 403.
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: Access restricted to authorized networks only.' 
            });
        }
    }
    next();
};

// ===============================================
// CSRF PROTECTION (Synchronizer Token Pattern)
// ===============================================
const generateCSRFToken = (req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    // Expose token to views/frontend via cookie or response local (not used here directly but good practice)
    res.cookie('X-CSRF-Token', req.session.csrfToken, { 
        httpOnly: false, // Allow JS to read it for headers
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    next();
};

const validateCSRF = (req, res, next) => {
    // Skip for GET/HEAD/OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const token = req.headers['x-csrf-token'] || (req.body && req.body._csrf);

    if (!req.session || !req.session.csrfToken) {
         console.warn('[SECURITY] CRITICAL: Session or CSRF token missing in session store.');
         // return res.status(500).json({ success: false, message: 'Server Error: Session invalid' });
         // Create a fresh token if missing to avoid permanent breakage?
         // No, this means user session is broken/expired.
    }

    if (!token || (req.session && token !== req.session.csrfToken)) {
        console.warn(`[SECURITY] Potential CSRF attempt Blocked. IP: ${req.ip}`);
        return res.status(403).json({ 
            success: false, 
            message: 'Forbidden: Invalid or missing CSRF token' 
        });
    }
    next();
};

// ===============================================
// AUDIT LOGGING
// ===============================================
const db = require('../config/db'); // Import DB connection

const auditLog = (action, userId, username, details = '', ip = '') => {
    // 1. Log to File (Backup)
    const fs = require('fs');
    const path = require('path');
    const logStream = fs.createWriteStream(path.join(__dirname, '../logs/audit.log'), { flags: 'a' });
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] USER:${username}(${userId}) ACTION:${action} DETAILS:${details} IP:${ip}\n`;
    logStream.write(logEntry);
    
    // 2. Log to Database (Primary for UI) - Use async but don't await to avoid blocking response
    if (userId) {
        db.query(
            'INSERT INTO audit_logs (user_id, username, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
            [userId, username, action, details, ip],
            (err) => { if (err) console.error('Audit Log DB Error:', err); }
        );
    }
};

// Middleware to track "Online" status
const trackActivity = (req, res, next) => {
    if (req.session && req.session.userId) {
        // Update last_seen timestamp
        db.query('UPDATE admins SET last_seen = NOW() WHERE id = ?', [req.session.userId]);
    }
    next();
};

module.exports = {
    checkIP,
    generateCSRFToken,
    validateCSRF,
    auditLog,
    trackActivity
};
