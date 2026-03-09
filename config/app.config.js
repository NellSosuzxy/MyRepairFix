// ===============================================
// APPLICATION CONFIGURATION
// ===============================================
// Purpose: Centralized configuration settings
// Usage: Import/include this file to access app settings
// ===============================================

const APP_CONFIG = {
    // Application Information
    APP_NAME: 'MyRepairFix',
    VERSION: '1.0.0',
    
    // API Configuration
    API: {
        BASE_URL: window.location.origin,
        ENDPOINTS: {
            NEWS: '/api/news',
            BOOKINGS: '/api/bookings',
            STATUS: '/api/status',
            ADMIN_BOOKINGS: '/api/admin/bookings'
        },
        TIMEOUT: 10000 // 10 seconds
    },
    
    // News Widget Settings
    NEWS: {
        REFRESH_INTERVAL: 8000,    // 8 seconds
        VISIBLE_CARDS: 6,
        AUTO_ROTATE: true
    },
    
    // Theme Settings
    THEME: {
        DEFAULT: 'light',
        STORAGE_KEY: 'myrepairfix-theme',
        TRANSITION_DURATION: 300   // milliseconds
    },
    
    // Language Settings
    LANGUAGE: {
        DEFAULT: 'en',
        STORAGE_KEY: 'myrepairfix-lang',
        SUPPORTED: ['en', 'ms']    // English, Malay
    },
    
    // Admin Settings (authentication is handled server-side)
    ADMIN: {
        SESSION_TIMEOUT: 3600000   // 1 hour in milliseconds
    },
    
    // Form Validation
    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^[\d\s\-\+\(\)]{10,}$/,
        MIN_NAME_LENGTH: 2,
        MAX_DESCRIPTION_LENGTH: 500
    },
    
    // Animation Settings
    ANIMATION: {
        PRELOADER_DURATION: 3000,  // 3 seconds
        FADE_DURATION: 300,
        STAGGER_DELAY: 100
    },
    
    // Device Types for Booking
    DEVICE_TYPES: [
        'Smartphone',
        'Tablet',
        'Laptop',
        'Desktop',
        'Gaming Console',
        'Other'
    ],
    
    // Issue Categories
    ISSUE_CATEGORIES: [
        'Screen/Display',
        'Battery',
        'Charging Port',
        'Speaker/Microphone',
        'Camera',
        'Storage',
        'Performance',
        'Water Damage',
        'Physical Damage',
        'Software Issues',
        'Other'
    ],
    
    // Status Types
    STATUS_TYPES: {
        PENDING: 'Pending',
        IN_PROGRESS: 'In-Progress', 
        COMPLETED: 'Completed',
        CANCELLED: 'Canceled'
    },
    
    // Status Colors for UI
    STATUS_COLORS: {
        'Pending': '#f59e0b',      // Yellow
        'In-Progress': '#3b82f6',   // Blue
        'Completed': '#10b981',     // Green
        'Canceled': '#ef4444'      // Red
    }
};

// Make config globally available
if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
}

// Export for Node.js/module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
}