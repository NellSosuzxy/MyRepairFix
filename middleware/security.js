const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ===============================================
// IP RESTRICTION
// ===============================================
// ::1 = Localhost IPv6
// 127.0.0.1 = Localhost IPv4
// 192.168.0.226 = Your current laptop Wi-Fi IP
// IP restriction is session-based on Heroku (no static IPs behind load balancers).
// On production, admin access is protected by session auth, not IP whitelist.
const isProduction = process.env.NODE_ENV === 'production';

const ALLOWED_ADMIN_IPS = ['::1', '127.0.0.1', '192.168.0.226']; // Local dev IPs

const checkIP = (req, res, next) => {
    // Skip IP check in production (Heroku) — admin access is protected by session auth
    if (isProduction) return next();

    let clientIP = req.ip || req.connection.remoteAddress;

    // Normalize IPv6 mapped IPv4
    if (clientIP && clientIP.substring(0, 7) === '::ffff:') {
        clientIP = clientIP.substring(7);
    }
    
    // Check if path is an admin path (local dev only)
    if (req.path.startsWith('/api/admin') || req.path.startsWith('/admin.html')) {
        if (!ALLOWED_ADMIN_IPS.includes(clientIP)) {
            console.warn(`[SECURITY] Blocked admin access attempt from IP: ${clientIP}`);
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
            'INSERT INTO audit_logs (admin_id, username, action, detail, ip_address) VALUES (?, ?, ?, ?, ?)',
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
