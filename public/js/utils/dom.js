// ===============================================
// DOM UTILITIES - Common DOM Manipulation Functions
// ===============================================
// Purpose: Reusable DOM helper functions to reduce code duplication
// Usage: Include this before other JS files that need DOM helpers
// ===============================================

/**
 * Safe DOM element selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element to search within (optional)
 * @returns {Element|null} - Found element or null
 */
function $(selector, parent = document) {
    try {
        return parent.querySelector(selector);
    } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return null;
    }
}

/**
 * Select multiple elements
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element to search within (optional)
 * @returns {NodeList} - Found elements
 */
function $$(selector, parent = document) {
    try {
        return parent.querySelectorAll(selector);
    } catch (error) {
        console.warn(`Invalid selector: ${selector}`, error);
        return [];
    }
}

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string|Element} content - Inner content
 * @returns {Element} - Created element
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Set content
    if (typeof content === 'string') {
        element.innerHTML = content;
    } else if (content instanceof Element) {
        element.appendChild(content);
    }
    
    return element;
}

/**
 * Toggle element visibility
 * @param {Element} element - Element to toggle
 * @param {boolean} show - Force show/hide (optional)
 */
function toggleVisibility(element, show = null) {
    if (!element) return;
    
    if (show === null) {
        element.style.display = element.style.display === 'none' ? '' : 'none';
    } else {
        element.style.display = show ? '' : 'none';
    }
}

/**
 * Add loading state to element
 * @param {Element} element - Element to add loading to
 * @param {string} loadingText - Loading text (optional)
 */
function addLoading(element, loadingText = 'Loading...') {
    if (!element) return;
    
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.textContent = loadingText;
    element.classList.add('loading');
}

/**
 * Remove loading state from element
 * @param {Element} element - Element to remove loading from
 */
function removeLoading(element) {
    if (!element) return;
    
    element.disabled = false;
    element.textContent = element.dataset.originalText || element.textContent;
    element.classList.remove('loading');
    delete element.dataset.originalText;
}

/**
 * Smooth scroll to element
 * @param {Element|string} target - Element or selector to scroll to
 * @param {number} offset - Offset from top (optional)
 */
function scrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? $(target) : target;
    if (!element) return;
    
    const elementTop = element.offsetTop - offset;
    window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
    });
}

/**
 * Debounce function - prevents function from being called too frequently
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show notification/toast message
 * @param {string} message - Message to show
 * @param {string} type - Type: 'success', 'error', 'info' (optional)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = createElement('div', {
        className: `notification notification-${type}`,
        innerHTML: message
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 5000);
}