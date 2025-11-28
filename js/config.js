/*
 * Configuration Constants for Qeseh Mjeed Extension
 * Central location for all configuration values
 */

const CONFIG = {
    // Storage Keys
    STORAGE_KEYS: {
        FAVORITES: 'qesehFavorites',
        USER_PREFERENCES: 'qesehPreferences',
        CACHE: 'qesehCache'
    },

    // Animation Durations (in milliseconds)
    ANIMATION: {
        FAST: 200,
        NORMAL: 300,
        SLOW: 500,
        CARD_HOVER: 350
    },

    // Debounce/Throttle Timings
    TIMING: {
        SCROLL_DEBOUNCE: 150,
        RESIZE_DEBOUNCE: 250,
        SEARCH_DEBOUNCE: 300
    },

    // Breakpoints (in pixels)
    BREAKPOINTS: {
        MOBILE_SMALL: 479,
        MOBILE_LARGE: 767,
        TABLET: 991,
        DESKTOP_SMALL: 1199,
        DESKTOP_LARGE: 1599
    },

    // UI Constants
    UI: {
        HEADER_HEIGHT: 61, // pixels
        CARD_MIN_WIDTH: 120, // pixels
        EPISODE_ASPECT_RATIO: 1.2, // height/width (portrait)
        POSTER_ASPECT_RATIO: 1.5 // height/width
    },

    // URLs
    URLS: {
        BASE: 'https://wwv.qeseh.com',
        SERIES_PATH: '/series/',
        SEARCH_PATH: '/?s='
    },

    // Classes
    CLASSES: {
        MJEED_BROWSING: 'mjeed-browsing',
        TOUCH_DEVICE: 'touch-device',
        IN_LIST: 'in-list',
        ACTIVE: 'active',
        DISABLED: 'disabled'
    },

    // Feature Flags
    FEATURES: {
        ENABLE_ANIMATIONS: true,
        ENABLE_LAZY_LOADING: true,
        ENABLE_DEBUG_LOGGING: false,
        ENABLE_ANALYTICS: false
    },

    // Cache Settings
    CACHE: {
        EPISODE_DATA_TTL: 3600000, // 1 hour in milliseconds
        SERIES_DATA_TTL: 7200000, // 2 hours
        MAX_CACHE_SIZE: 100 // maximum cached items
    }
};

// Freeze the config object to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);
Object.freeze(CONFIG.ANIMATION);
Object.freeze(CONFIG.TIMING);
Object.freeze(CONFIG.BREAKPOINTS);
Object.freeze(CONFIG.UI);
Object.freeze(CONFIG.URLS);
Object.freeze(CONFIG.CLASSES);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.CACHE);

// Export for module support
// export default CONFIG;
