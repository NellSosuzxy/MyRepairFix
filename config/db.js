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

let dbConfig = {
    waitForConnections: true,
    connectionLimit: 4,
    queueLimit: 0
};

// Check for Heroku Database URL (JawsDB, ClearDB, etc.)
if (process.env.JAWSDB_URL || process.env.CLEARDB_DATABASE_URL || process.env.DATABASE_URL) {
    const dbUrl = new URL(process.env.JAWSDB_URL || process.env.CLEARDB_DATABASE_URL || process.env.DATABASE_URL);
    dbConfig.host = dbUrl.hostname;
    dbConfig.port = parseInt(dbUrl.port) || 3306;
    dbConfig.user = decodeURIComponent(dbUrl.username);
    dbConfig.password = decodeURIComponent(dbUrl.password);
    dbConfig.database = dbUrl.pathname.substring(1);
    dbConfig.ssl = { rejectUnauthorized: false };
    console.log(`[DB] Using JawsDB: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
} else {
    // Fallback to individual variables (Development / localhost)
    dbConfig.host = process.env.DB_HOST || 'localhost';
    dbConfig.port = parseInt(process.env.DB_PORT) || 3306;
    dbConfig.user = process.env.DB_USER || 'root';
    dbConfig.password = process.env.DB_PASSWORD || 'password';
    dbConfig.database = process.env.DB_NAME || 'myrepairfix_db';
    console.log(`[DB] Using local config: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
}

const pool = mysql.createPool(dbConfig);

// Test connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('[DB] Connection FAILED:', err.message);
    } else {
        console.log('[DB] Connection successful');
        connection.release();
    }
});

// 4. Export the pool so other files (like server.js) can use it
module.exports = pool;
