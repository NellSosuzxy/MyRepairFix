// ===============================================
// RATE LIMITING MIDDLEWARE
// ===============================================
// Purpose: Protect API endpoints from abuse
// Features:
// - Different limits for different routes
// - Prevents brute-force attacks on login
// - Protects against DDoS
// ===============================================

const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Applies to all API routes
 * Limit: 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3000, // 3000 requests per window
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false
});

/**
 * Strict Login Rate Limiter
 * Prevents brute-force attacks on authentication
 * Limit: 5 attempts per 15 minutes
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 attempts
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Booking Creation Rate Limiter
 * Prevents spam bookings
 * Limit: 10 bookings per hour per IP
 */
const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // 100 bookings per hour
    message: {
        success: false,
        message: 'Too many booking requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Status Check Rate Limiter
 * Prevents abuse of status check endpoint
 * Limit: 30 checks per 15 minutes
 */
const statusCheckLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: {
        success: false,
        message: 'Too many status checks. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * News API Rate Limiter
 * Limits external API calls to preserve quota
 * Limit: 20 requests per 15 minutes
 */
const newsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: {
        success: false,
        message: 'News API rate limit reached. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    generalLimiter,
    loginLimiter,
    bookingLimiter,
    statusCheckLimiter,
    newsLimiter
};
