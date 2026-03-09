// ===============================================
// INPUT VALIDATION MIDDLEWARE
// ===============================================
// Purpose: Centralized input validation using express-validator
// Features:
// - Reusable validation chains
// - Consistent error responses
// - Sanitization of inputs
// ===============================================

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation Result Handler
 * Checks for validation errors and returns 400 if any exist
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // DEBUG LOGGING
        console.log("Validation Failed for:", req.originalUrl);
        console.log("Body:", req.body);
        console.log("Errors:", errors.array());

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Booking Validation Rules
 * Validates customer booking form data
 */
const bookingValidation = [
    body('customer_name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .escape(),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[\d\s\-+()]{8,20}$/).withMessage('Invalid phone number format'),
    
    body('device_type')
        .trim()
        .notEmpty().withMessage('Device type is required')
        .isIn(['smartphone', 'laptop', 'tablet', 'desktop', 'other'])
        .withMessage('Invalid device type'),
    
    body('device_model')
        .trim()
        .notEmpty().withMessage('Device model is required')
        .isLength({ max: 100 }).withMessage('Device model too long')
        .escape(),
    
    body('issue_category')
        .trim()
        .notEmpty().withMessage('Issue category is required')
        .escape(),
    
    body('issue_desc')
        .trim()
        .notEmpty().withMessage('Issue description is required')
        .isLength({ max: 1000 }).withMessage('Description too long (max 1000 characters)')
        .escape(),
    
    body('preferred_date')
        .optional()
        .isISO8601().withMessage('Invalid date format'),
    
    handleValidation
];

/**
 * Login Validation Rules
 */
const loginValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
        .escape(),
    
    body('password')
        .notEmpty().withMessage('Password is required'),
    
    handleValidation
];

/**
 * Status Check Validation Rules
 */
const statusCheckValidation = [
    param('ref')
        .trim()
        .notEmpty().withMessage('Reference code is required')
        .matches(/^REF\d{4}$/).withMessage('Invalid reference code format'),
    
    query('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    
    handleValidation
];

/**
 * Register Staff Validation Rules
 */
const registerStaffValidation = [
    body('newUsername')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
        .escape(),
    
    body('newPassword')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    
    handleValidation
];

/**
 * Password Reset Validation Rules
 */
const passwordResetValidation = [
    body('targetUsername')
        .trim()
        .notEmpty().withMessage('Target username is required')
        .escape(),
    
    body('newPassword')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    
    handleValidation
];

/**
 * Booking ID Validation
 */
const bookingIdValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid booking ID'),
    
    handleValidation
];

/**
 * Status Update Validation
 */
const statusUpdateValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid booking ID'),
    
    body('status')
        .trim()
        .notEmpty().withMessage('Status is required')
        // Allow both database formats and legacy/human-readable formats to support older clients/cache
        .isIn(['Pending', 'Confirmed', 'In-Progress', 'In Progress', 'Ready', 'Completed', 'Canceled', 'Cancelled'])
        .withMessage('Invalid status value'),
    
    handleValidation
];

/**
 * Image Upload Validation
 */
const imageUploadValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid booking ID'),
    
    body('stage')
        .trim()
        .notEmpty().withMessage('Stage is required')
        .isIn(['received-condition', 'after-service'])
        .withMessage('Invalid stage value'),
    
    handleValidation
];

module.exports = {
    handleValidation,
    bookingValidation,
    loginValidation,
    statusCheckValidation,
    registerStaffValidation,
    passwordResetValidation,
    bookingIdValidation,
    statusUpdateValidation,
    imageUploadValidation
};
