// ===============================================
// SETUP ROUTES - Initial System Configuration
// ===============================================

// --- DEPENDENCIES ---
const express = require('express');
const bcrypt = require('bcrypt');

// --- DATABASE & CONFIG ---
const db = require('../config/db');

// --- INITIALIZATION ---
const router = express.Router();

// Secure Setup Route
// Requires ?token=MY_SECRET_INSTALL_KEY in URL to run
router.get('/create-admin', async (req, res) => {
    const token = req.query.token;
    const SECRET = process.env.INSTALL_TOKEN || 'secure_setup_token'; // Should be in .env

    if (token !== SECRET) {
        return res.status(403).send("Access Denied: Invalid Setup Token");
    }

    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('owner', 'staff') DEFAULT 'staff',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

    db.query(createTableSQL, async (err) => {
        if (err) return res.send("Error creating table: " + err.message);

        const hashedPassword = await bcrypt.hash("password123", 10);
        const insertSQL = `INSERT INTO admins (username, password_hash, role) VALUES ('boss', ?, 'owner')`;

        db.query(insertSQL, [hashedPassword], (err) => {
            if (err && err.code === 'ER_DUP_ENTRY') return res.send("Already setup.");
            res.send("Setup Complete. Login: boss/password123");
        });
    });
});

module.exports = router;