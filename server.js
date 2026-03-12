// ===============================================
// MyRepairFix - Backend Server (Production Ready)
// ===============================================
// This is the main entry point for the application.
// It sets up the web server, connects to the database,
// configures security, and defines the routes (API endpoints).
// ===============================================

// --- 1. LOAD ENVIRONMENT VARIABLES ---
// process.env contains sensitive data like database passwords.
// We load these from a .env file so they are not hardcoded in the code.
require('dotenv').config();

// --- 2. IMPORT DEPENDENCIES ---
// Express is the web framework we use to handle HTTP requests.
const express = require('express');
// CORS allows our frontend (if hosted separately) to talk to this backend.
const cors = require('cors');
// Body-parser helps us read data sent in POST requests (like forms).
const bodyParser = require('body-parser');
// Path helps us work with file and directory paths correctly on any OS.
const path = require('path');
// Session management for keeping users logged in.
const session = require('express-session');
// Store sessions in the MySQL database so they persist if the server restarts.
const MySQLStore = require('express-mysql-session')(session);
// Helmet adds security headers to protect against common web attacks.
const helmet = require('helmet');
// Morgan logs every request to the console (useful for debugging).
const morgan = require('morgan');
// NOTE: compression is intentionally omitted — Railway's edge proxy (Caddy) handles
// gzip/brotli compression. Adding it here causes HTTP/2 protocol errors on Railway.

// --- 3. DATABASE CONNECTION ---
// Import the database connection pool from our config folder.
const pool = require('./config/db');

// --- 4. IMPORT CUSTOM MIDDLEWARE ---
// Middleware functions run before the final route handler.
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter'); 
// Security middleware: IP checking, CSRF protection, and activity tracking.
const { checkIP, generateCSRFToken, validateCSRF, trackActivity } = require('./middleware/security'); 

// --- 5. IMPORT ROUTES ---
// Routes define the different URLs our app responds to.
const bookingRoutes = require('./routes/bookingRoutes'); // Booking repairs
const authRoutes = require('./routes/authRoutes');       // Login/Register
const adminRoutes = require('./routes/adminRoutes');     // Admin dashboard
const newsRoutes = require('./routes/newsRoutes');       // Tech news
const setupRoutes = require('./routes/setupRoutes');     // Initial setup

// --- 6. ENVIRONMENT CONFIGURATION ---
// Check if we are in 'production' (live) or 'development' mode.
const isProduction = process.env.NODE_ENV === 'production';
// Set the port (default to 3000 if not specified in .env).
const PORT = process.env.PORT || 3000;

// --- 7. INITIALIZE APP ---
const app = express();

// Trust Railway's reverse proxy (required for correct IP, protocol, cookies)
app.set('trust proxy', 1);

// --- 8. SECURITY HEADERS (HELMET) ---
// This configures Content Security Policy (CSP) to only allow safe sources
// for scripts, images, and styles. It prevents Cross-Site Scripting (XSS).
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: "no-referrer" }
}));

// --- 9. STATIC FILES ---
// Serve static files with correct headers for Railway's reverse proxy.
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: isProduction ? '1h' : 0,
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        // Ensure CSS files always get the correct MIME type
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
    }
}));


// --- 10. GLOBAL MIDDLEWARE SETUP ---
// Apply these checks to APIs and dynamic routes.

// Rate Limiter: Prevent too many requests from one IP (Anti-DDoS).
// app.use(generalLimiter); 

// IP Check: Block blacklisted IPs or allow only whitelisted ones.
app.use(checkIP);        

// Activity Tracker: Log what staff members are doing.
app.use(trackActivity);  

// Logging: Show request details in the console.
if (isProduction) {
    app.use(morgan('combined')); // Detailed logs for production
} else {
    app.use(morgan('dev'));      // Simple logs for development
}

// --- 10. SESSION CONFIGURATION ---
// Setup where sessions are stored in the database.
const sessionStore = new MySQLStore({
    clearExpired: true,
    checkExpirationInterval: 900000, 
    expiration: 86400000, // Session lasts 24 hours
    createDatabaseTable: true,
    connectionLimit: 2 // Reserve connections for session store within JawsDB limit
}, pool);

// Configure the session cookie.
app.use(session({
    key: 'myrepairfix_session', // Name of the cookie
    secret: process.env.SESSION_SECRET || 'fallback_secret_change_in_production', // Encryption key
    store: sessionStore, // Where to save session data
    resave: false,
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
        secure: isProduction, // Use HTTPS in production
        httpOnly: true,       // Prevent JS from accessing the cookie (Anti-XSS)
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'       // CSRF protection measure
    }
}));

// --- 11. CORS CONFIGURATION ---
// Allow the frontend to request data from the backend.
app.use(cors({
    origin: isProduction ? process.env.CORS_ORIGIN : '*', // Restrict options in production
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// --- 12. BODY PARSING ---
// Allow the server to read JSON data and Form data from requests.
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// --- 13. CSRF PROTECTION ---
// Cross-Site Request Forgery protection.
// Prevents attackers from making requests on behalf of a user.
app.use(generateCSRFToken);         // Generate a token for every session
app.use('/api/admin', validateCSRF); // Check token on all admin actions
app.use('/api/auth', validateCSRF);  // Check token on login/logout actions

// --- 14. CACHE CONTROL (For API Routes Only) ---
// Prevent browsers from caching API responses so users always see fresh data.
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// --- 15. STATIC FILES MOVED TO TOP ---
// (Already handled in section 9)

// ===============================================
// HEALTH CHECK ENDPOINT
// ===============================================
// Simple route to check if the server is running.
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ===============================================
// MOUNT API ROUTES
// ===============================================
// Associate specific URL paths with their route handlers.

// Public Booking Routes (Create a booking, Check status)
app.use('/api/bookings', bookingRoutes);

// Authentication Routes (Login, Logout, Session info)
app.use('/api', authRoutes);

// Admin Routes (Manage bookings, update statuses)
app.use('/api/admin/bookings', adminRoutes);

// News API (Fetch tech news)
app.use('/api/news', newsRoutes);

// Setup Routes (Database initialization)
app.use('/setup', setupRoutes);


// ===============================================
// ERROR HANDLING
// ===============================================
// If no route matches, show a 404 error.
app.use(notFound);
// Handle any other errors that occur.
app.use(errorHandler);

// ===============================================
// START SERVER
// ===============================================
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════');
    console.log(`🚀 MyRepairFix Server Started`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security: ${isProduction ? 'Production Mode' : 'Development Mode'}`);
    console.log('═══════════════════════════════════════════');
});

// Graceful shutdown: Close database connection when server stops.
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    pool.end(() => {
        console.log('Database pool closed.');
        process.exit(0);
    });
});
