// ===============================================
// AUTH ROUTES - Authentication & Session Handling
// ===============================================
// This file handles:
// 1. Logging in (verifying username/password)
// 2. Logging out (destroying sesssion)
// 3. Checking if a user is currently logged in
// 4. Staff management (Register, Delete, Reset Password)
// ===============================================

// --- DEPENDENCIES ---
const express = require('express');
const bcrypt = require('bcrypt'); // Used for hashing passwords securely
const { body, validationResult } = require('express-validator'); // For validating inputs

// --- CONFIG & DATABASE ---
const db = require('../config/db');

// --- MIDDLEWARE ---
const { checkAuth, checkOwner } = require('../middleware/authMiddleware'); // Authorization checks
const { loginLimiter } = require('../middleware/rateLimiter'); // Prevents brute-force attacks

// --- INITIALIZATION ---
const router = express.Router();

// --- HELPER FUNCTION: VALIDATION ---
// This runs the validation rules and returns errors if any fail.
// It keeps our route handlers clean.
const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));
        // Check for errors
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next(); // logic is valid, proceed
        }
        // Return 400 Bad Request with error details
        res.status(400).json({ success: false, errors: errors.array() });
    };
};

const isProduction = process.env.NODE_ENV === 'production';

// ===============================================
// 1. SESSION CHECK (GET /api/session)
// ===============================================
// Checks if the user's browser has a valid session cookie.
// Used by the frontend to decide whether to show the Dashboard or Login page.
router.get('/session', (req, res) => {
    if (req.session.userId) {
        // User is logged in
        res.json({ 
            success: true, 
            loggedIn: true, 
            role: req.session.role,
            username: req.session.username 
        });
    } else {
        // User is NOT logged in
        res.json({ success: true, loggedIn: false });
    }
});

// ===============================================
// 2. LOGIN (POST /api/login)
// ===============================================
// Verifies credentials and creates a session.
router.post('/login', 
    loginLimiter, // Limit attempts to prevent guessing
    validate([
        body('username').trim().notEmpty().withMessage('Username required'),
        body('password').notEmpty().withMessage('Password required')
    ]), 
    (req, res) => {
        const { username, password } = req.body;
        
        // 1. Find user in database
        db.query('SELECT * FROM admins WHERE username = ?', [username], async (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Database Error" });
            
            // 2. User not found?
            if (results.length === 0) return res.json({ success: false, message: "Invalid credentials" });
            
            const user = results[0];
            let match = false;
            
            // 3. Compare password with the hashed version in DB
            try {
                match = await bcrypt.compare(password, user.password_hash);
            } catch (e) { /* Ignore comparison errors */ }

            // FALLBACK: Allow legacy plain text passwords until migrated (Dev only)
            if (!match && !isProduction && password === user.password_hash) {
                match = true;
                console.warn('⚠️ Plain text password detected. Please hash passwords!');
            }

            // 4. Password validation result
            if (match) {
                // Success! Create session variables
                req.session.userId = user.id;
                req.session.role = user.role;
                req.session.username = user.username;
                
                // Force session save to ensure cookie is set before response
                req.session.save();

                res.json({ success: true, role: user.role, message: "Login successful" });
            } else {
                // Wrong password
                res.json({ success: false, message: "Invalid credentials" });
            }
        });
});

// ===============================================
// 3. LOGOUT (POST /api/logout)
// ===============================================
// Destroys the session and clears the cookie.
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
        
        // Remove the cookie from the browser
        res.clearCookie('myrepairfix_session');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// ===============================================
// 4. STAFF MANAGEMENT (Restricted to Owner)
// ===============================================

// --- REGISTER NEW STAFF ---
// Allows the owner to create new admin accounts.
router.post('/register-staff', 
    checkAuth,  // Must be logged in
    checkOwner, // Must be 'owner' role
    validate([
        body('newUsername').trim().isLength({ min: 3 }).withMessage('Username must be 3+ chars'),
        body('newPassword').isLength({ min: 6 }).withMessage('Password must be 6+ chars')
    ]),
    async (req, res) => {
        const { newUsername, newPassword } = req.body;
        try {
            // Hash the password before saving
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            
            // Insert into DB
            db.query("INSERT INTO admins (username, password_hash, role) VALUES (?, ?, 'staff')", 
            [newUsername, hashedPassword], (err) => {
                if (err) {
                    // Handle duplicate username error
                    if (err.code === 'ER_DUP_ENTRY') return res.json({ success: false, message: "Username taken" });
                    return res.status(500).json({ success: false, message: "DB Error" });
                }
                res.json({ success: true, message: "Staff created!" });
            });
        } catch (e) {
            res.status(500).json({ success: false, message: "Server error" });
        }
});

// --- RESET STAFF PASSWORD ---
// Allows owner to reset a staff member's password.
router.post('/reset-staff-password', 
    checkAuth, 
    checkOwner,
    validate([
        body('targetUsername').notEmpty(),
        body('newPassword').isLength({ min: 6 })
    ]),
    async (req, res) => {
        const { targetUsername, newPassword } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            
            // Update password in DB
            db.query("UPDATE admins SET password_hash = ? WHERE username = ? AND role = 'staff'", 
            [hashedPassword, targetUsername], (err, result) => {
                if (err) return res.status(500).json({success: false, message: "DB Error"});
                if (result.affectedRows === 0) return res.json({success: false, message: "Staff not found!"});
                res.json({ success: true, message: "Password reset successfully!" });
            });
        } catch (e) {
             res.status(500).json({ success: false, message: "Server error" });
        }
});

// --- GET LIST OF STAFF ---
// Returns all admins so the owner can manage them.
router.get('/staff-list', 
    checkAuth, 
    checkOwner,
    (req, res) => {
        db.query("SELECT id, username, role, created_at FROM admins ORDER BY role DESC, created_at DESC", 
        (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "DB Error" });
            res.json({ success: true, staff: results });
        });
});

// --- DELETE STAFF MEMBER ---
// Removes a staff account.
router.delete('/delete-staff/:id', 
    checkAuth, 
    checkOwner,
    (req, res) => {
        const staffId = req.params.id;
        
        // Safety check: Prevent owner from deleting themselves
        if (parseInt(staffId) === req.session.adminId) {
            return res.json({ success: false, message: "Cannot delete yourself!" });
        }
        
        // Execute delete (only if role is 'staff')
        db.query("DELETE FROM admins WHERE id = ? AND role = 'staff'", 
        [staffId], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "DB Error" });
            if (result.affectedRows === 0) return res.json({ success: false, message: "Staff not found or is an owner!" });
            res.json({ success: true, message: "Staff deleted successfully!" });
        });
});

module.exports = router;
