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
router.get('/init', async (req, res) => {
    const token = req.query.token;
    const SECRET = process.env.INSTALL_TOKEN || 'secure_setup_token'; // Should be in .env

    if (token !== SECRET) {
        return res.status(403).send("Access Denied: Invalid Setup Token");
    }

    const queries = [
        // 1. Admins Table
        `CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('owner', 'staff') DEFAULT 'staff',
            last_seen TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        // 2. Bookings Table
        `CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            reference_code VARCHAR(20) NOT NULL UNIQUE,
            customer_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            device_type VARCHAR(50) NOT NULL,
            device_model VARCHAR(100) NOT NULL,
            issue_category VARCHAR(50) NOT NULL,
            issue_desc TEXT,
            preferred_date DATE,
            status ENUM('Pending', 'Confirmed', 'In-Progress', 'Ready', 'Completed', 'Canceled') DEFAULT 'Pending',
            before_service_images JSON,
            received_condition_images JSON,
            after_service_images JSON,
            technician_notes TEXT,
            cost DECIMAL(10, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        // 3. Audit Logs Table
        `CREATE TABLE IF NOT EXISTS audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            action VARCHAR(50) NOT NULL,
            admin_id INT,
            username VARCHAR(50),
            detail TEXT,
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    try {
        // Execute all CREATE TABLE queries
        for (const sql of queries) {
            await db.promise().query(sql);
        }

        // Create Default Admin
        const hashedPassword = await bcrypt.hash("password123", 10);
        const insertSQL = `INSERT IGNORE INTO admins (username, password_hash, role) VALUES ('boss', ?, 'owner')`;

        await db.promise().query(insertSQL, [hashedPassword]);
        
        res.send("<h1>Setup Complete!</h1><p>Tables created (admins, bookings, audit_logs).</p><p>Default Login: boss / password123</p>");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error initializing database: " + err.message);
    }
});

module.exports = router;