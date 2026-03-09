// ===============================================
// 🛢️ DATABASE CONFIGURATION
// ===============================================
// This file connects your application to the MySQL database.
// It uses a "Connection Pool" which is more efficient than a single connection.

// 1. Load secret settings (.env file)
require('dotenv').config();

// 2. Load the MySQL library
const mysql = require('mysql2');

// 3. Create the Connection Pool
// Think of this like a "pool" of 10 workers ready to handle database requests.
// When a request comes in, a worker is assigned. When done, it returns to the pool.
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',     // Where is the DB? (usually localhost)
    user: process.env.DB_USER || 'root',          // Database username
    password: process.env.DB_PASSWORD || 'password', // Database password
    database: process.env.DB_NAME || 'myrepairfix_db', // Which database to use
    
    // Pool settings (leave these as defaults for now)
    waitForConnections: true, // Wait if all workers are busy?
    connectionLimit: 10,      // Max number of simultaneous connections
    queueLimit: 0,            // Max requests to queue (0 = unlimited)
    ssl: {
        rejectUnauthorized: false
    }
});

// 4. Export the pool so other files (like server.js) can use it
module.exports = pool;
