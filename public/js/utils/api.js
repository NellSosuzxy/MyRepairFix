// ===============================================
// API UTILITIES - Reusable API Functions
// ===============================================
// Purpose: Centralized API interaction functions to reduce duplication
// Usage: Import these functions in page-specific JS files
// ===============================================

/**
 * Base API configuration
 */
const API_BASE_URL = window.location.origin;

/**
 * Helper to get cookie value by name
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

/**
 * Generic API request helper with error handling
 * @param {string} endpoint - API endpoint (e.g., '/api/bookings')
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Object>} - API response data
 */
async function apiRequest(endpoint, options = {}) {
    // Add CSRF Token to headers if it exists
    const csrfToken = getCookie('X-CSRF-Token');
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    
    if (csrfToken) {
        defaultHeaders['X-CSRF-Token'] = csrfToken;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                ...defaultHeaders,
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

/**
 * GET request helper
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} - API response data
 */
async function apiGet(endpoint) {
    return await apiRequest(endpoint, { method: 'GET' });
}

/**
 * POST request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send in request body
 * @returns {Promise<Object>} - API response data
 */
async function apiPost(endpoint, data) {
    return await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * PUT request helper
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Data to send in request body
 * @returns {Promise<Object>} - API response data
 */
async function apiPut(endpoint, data) {
    return await apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * DELETE request helper
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} - API response data
 */
async function apiDelete(endpoint) {
    return await apiRequest(endpoint, {
        method: 'DELETE'
    });
}

/**
 * Common API endpoints
 */
const API_ENDPOINTS = {
    NEWS: '/api/news',
    BOOKINGS: '/api/bookings',
    STATUS: '/api/status',
    ADMIN_BOOKINGS: '/api/admin/bookings'
};

// Export for module use (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { apiRequest, apiGet, apiPost, apiPut, API_ENDPOINTS };
}