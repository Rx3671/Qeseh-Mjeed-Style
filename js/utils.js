/*
 * Utility Functions for Qeseh Mjeed Style Extension
 * Shared helper functions used across multiple scripts
 */

// ========== URL & TITLE EXTRACTION ==========

/**
 * Extract series URL from episode URL
 * @param {string} episodeUrl - Full episode URL
 * @returns {string} Clean series URL
 */
function extractSeriesUrl(episodeUrl) {
    try {
        const url = new URL(episodeUrl);
        let pathname = url.pathname;

        // Remove trailing slash
        pathname = pathname.replace(/\/$/, '');

        // Remove episode patterns with numbers
        pathname = pathname
            .replace(/-الحلقة-\d+$/i, '')
            .replace(/-حلقة-\d+$/i, '')
            .replace(/-episode-\d+$/i, '')
            .replace(/-الحلقه-\d+$/i, '')
            .replace(/-ep-\d+$/i, '')
            .replace(/-ح-\d+$/i, '');

        // Add trailing slash back
        pathname = pathname + '/';

        return `${url.origin}${pathname}`;
    } catch (error) {
        console.error('Error extracting series URL:', error);
        return episodeUrl;
    }
}

/**
 * Extract series title from full title
 * @param {string} fullTitle - Full title with episode info
 * @returns {string} Clean series title
 */
function extractSeriesTitle(fullTitle) {
    if (!fullTitle) return '';

    return fullTitle
        .replace(/\s*-\s*(ال)?حلق[ةه]\s*\d+\s*$/i, '')
        .replace(/\s*(ال)?حلق[ةه]\s*\d+\s*$/i, '')
        .replace(/\s*-\s*episode\s*\d+\s*$/i, '')
        .replace(/\s*episode\s*\d+\s*$/i, '')
        .replace(/\s*-\s*ح\s*\d+\s*$/i, '')
        .replace(/\s*ح\s*\d+\s*$/i, '')
        .replace(/\s*-\s*\d+\s*$/i, '')
        .trim();
}

// ========== STORAGE HELPERS ==========

/**
 * Get data from Chrome Storage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {Promise<*>} Stored value or default
 */
async function getStorageData(key, defaultValue = null) {
    try {
        const result = await chrome.storage.sync.get([key]);
        return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
        console.error(`Error getting storage data for key "${key}":`, error);
        return defaultValue;
    }
}

/**
 * Set data in Chrome Storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {Promise<boolean>} Success status
 */
async function setStorageData(key, value) {
    try {
        await chrome.storage.sync.set({ [key]: value });
        return true;
    } catch (error) {
        console.error(`Error setting storage data for key "${key}":`, error);
        return false;
    }
}

// ========== DEBOUNCE & THROTTLE ==========

/**
 * Debounce function - delays execution until after wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
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
 * Throttle function - limits execution to once per wait time
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========== DOM HELPERS ==========

/**
 * Safely get element with null check
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (optional)
 * @returns {Element|null} Found element or null
 */
function safeQuerySelector(selector, parent = document) {
    try {
        return parent.querySelector(selector);
    } catch (error) {
        console.error(`Error querying selector "${selector}":`, error);
        return null;
    }
}

/**
 * Safely get all elements with null check
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (optional)
 * @returns {NodeList} Found elements or empty NodeList
 */
function safeQuerySelectorAll(selector, parent = document) {
    try {
        return parent.querySelectorAll(selector);
    } catch (error) {
        console.error(`Error querying selector "${selector}":`, error);
        return [];
    }
}

/**
 * Sanitize HTML for safe insertion
 * For controlled HTML (like our own templates), returns as-is
 * For user-generated content, use textContent instead
 * @param {string} html - HTML string
 * @returns {string} HTML string
 */
function sanitizeHTML(html) {
    // For now, return as-is since we control all HTML sources
    // If you need to sanitize user-generated content, use textContent instead
    // or integrate a library like DOMPurify
    return html;
}

// ========== LOGGER ==========

const Logger = {
    levels: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    },
    currentLevel: 1, // INFO by default

    debug(...args) {
        if (this.currentLevel <= this.levels.DEBUG) {
            console.log('%c[DEBUG]', 'color: #888', ...args);
        }
    },

    info(...args) {
        if (this.currentLevel <= this.levels.INFO) {
            console.log('%c[INFO]', 'color: #2196F3', ...args);
        }
    },

    warn(...args) {
        if (this.currentLevel <= this.levels.WARN) {
            console.warn('%c[WARN]', 'color: #FF9800', ...args);
        }
    },

    error(...args) {
        if (this.currentLevel <= this.levels.ERROR) {
            console.error('%c[ERROR]', 'color: #F44336', ...args);
        }
    }
};

// ========== TOUCH DEVICE DETECTION ==========

/**
 * Detect if device supports touch
 * @returns {boolean} True if touch device
 */
function isTouchDevice() {
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );
}

/**
 * Add touch class to body if touch device
 */
function markTouchDevice() {
    if (isTouchDevice()) {
        document.body.classList.add('touch-device');
    }
}
