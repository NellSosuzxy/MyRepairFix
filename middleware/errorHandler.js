// ===============================================
// ERROR HANDLER MIDDLEWARE
// ===============================================
// Purpose: Centralized error handling for the application
// Features:
// - Consistent error response format
// - Hides error details in production
// - Logs errors for debugging
// ===============================================

/**
 * Not Found Handler (404)
 * Catches requests to undefined routes
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Global Error Handler
 * Catches all errors and returns consistent JSON response
 * @param {Error} err - The error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
const errorHandler = (err, req, res, next) => {
    // If response already started, delegate to default handler
    if (res.headersSent) {
        return next(err);
    }

    // Determine status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Error:', err.message);
        console.error(err.stack);
    }

    // Send response
    res.json({
        success: false,
        message: err.message,
        // Only show stack trace in development
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 * Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
 * @param {Function} fn - Async function to wrap
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { notFound, errorHandler, asyncHandler };
