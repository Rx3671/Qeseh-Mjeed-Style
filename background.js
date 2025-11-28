/*
 * Background Service Worker for Qeseh Netflix Extension (REFACTORED)
 * Handles extension lifecycle, context menus, and communications
 * Follows Manifest V3 best practices
 */

// ========== CONFIGURATION ==========
const EXTENSION_CONFIG = {
    VERSION: '2.1.0',
    SITE_PATTERN: '*://wwv.qeseh.com/*',
    SITE_DOMAIN: 'qeseh.com',
    BASE_URL: 'https://wwv.qeseh.com'
};

// ========== INSTALLATION & UPDATE HANDLER ==========
chrome.runtime.onInstalled.addListener(async (details) => {
    try {
        if (details.reason === 'install') {
            console.log('🎬 Qeseh Netflix Extension Installed!');

            // Set default settings
            await chrome.storage.sync.set({
                designEnabled: true,
                seriesPageEnabled: true,
                version: EXTENSION_CONFIG.VERSION,
                firstInstall: Date.now()
            });

            // Create context menus
            await createContextMenus();

            // Open welcome page
            await chrome.tabs.create({
                url: EXTENSION_CONFIG.BASE_URL
            });

        } else if (details.reason === 'update') {
            console.log('✅ Qeseh Netflix Extension Updated!');

            // Update version
            await chrome.storage.sync.set({
                version: EXTENSION_CONFIG.VERSION,
                lastUpdate: Date.now()
            });

            // Recreate context menus (in case they changed)
            await createContextMenus();
        }
    } catch (error) {
        console.error('Error during installation/update:', error);
    }
});

// ========== CONTEXT MENUS CREATION ==========
async function createContextMenus() {
    try {
        // Remove all existing context menus first
        await chrome.contextMenus.removeAll();

        // Favorites menu items (only on qeseh.com)
        chrome.contextMenus.create({
            id: 'addToFavorites',
            title: 'إضافة إلى المفضلة',
            contexts: ['page'],
            documentUrlPatterns: [EXTENSION_CONFIG.SITE_PATTERN]
        });

        chrome.contextMenus.create({
            id: 'viewFavorites',
            title: 'عرض قائمتي',
            contexts: ['page'],
            documentUrlPatterns: [EXTENSION_CONFIG.SITE_PATTERN]
        });

        // General menu items (all pages)
        chrome.contextMenus.create({
            id: 'openQeseh',
            title: 'فتح قصة عشق',
            contexts: ['all']
        });

        chrome.contextMenus.create({
            id: 'toggleNetflixDesign',
            title: 'تبديل تصميم Netflix',
            contexts: ['all']
        });

        console.log('✅ Context menus created successfully');
    } catch (error) {
        console.error('Error creating context menus:', error);
    }
}

// ========== MESSAGE HANDLER ==========
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Handle async operations properly
    handleMessage(request, sender)
        .then(sendResponse)
        .catch(error => {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        });

    // Return true to indicate async response
    return true;
});

async function handleMessage(request, sender) {
    const { action, data } = request;

    switch (action) {
        case 'getFavorites':
            return await getFavorites();

        case 'saveFavorites':
            return await saveFavorites(data);

        case 'getStatus':
            return await getDesignStatus();

        case 'toggleDesign':
            return await toggleDesign(request.enabled);

        case 'logEvent':
            console.log(`📊 Event: ${request.event}`, data);
            return { received: true };

        default:
            console.warn(`Unknown action: ${action}`);
            return { error: 'Unknown action' };
    }
}

// ========== FAVORITES MANAGEMENT ==========
async function getFavorites() {
    try {
        const result = await chrome.storage.sync.get(['qesehFavorites']);
        return { favorites: result.qesehFavorites || [] };
    } catch (error) {
        console.error('Error getting favorites:', error);
        return { favorites: [], error: error.message };
    }
}

async function saveFavorites(favorites) {
    try {
        await chrome.storage.sync.set({ qesehFavorites: favorites });
        return { success: true };
    } catch (error) {
        console.error('Error saving favorites:', error);
        return { success: false, error: error.message };
    }
}

// ========== DESIGN TOGGLE ==========
async function getDesignStatus() {
    try {
        const result = await chrome.storage.sync.get(['designEnabled']);
        return { enabled: result.designEnabled !== false };
    } catch (error) {
        console.error('Error getting design status:', error);
        return { enabled: true, error: error.message };
    }
}

async function toggleDesign(enabled) {
    try {
        await chrome.storage.sync.set({ designEnabled: enabled });

        // Notify all qeseh.com tabs
        const tabs = await chrome.tabs.query({});
        const notifyPromises = tabs
            .filter(tab => tab.url && tab.url.includes(EXTENSION_CONFIG.SITE_DOMAIN))
            .map(tab =>
                chrome.tabs.sendMessage(tab.id, {
                    action: 'refreshDesign',
                    enabled: enabled
                }).catch(() => {
                    // Tab might not have content script loaded, ignore
                })
            );

        await Promise.all(notifyPromises);

        return { success: true };
    } catch (error) {
        console.error('Error toggling design:', error);
        return { success: false, error: error.message };
    }
}

// ========== TAB UPDATE HANDLER ==========
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes(EXTENSION_CONFIG.SITE_DOMAIN)) {
        try {
            const result = await chrome.storage.sync.get(['designEnabled']);
            if (result.designEnabled !== false) {
                console.log('🎬 Netflix Style Active on:', tab.url);
            }
        } catch (error) {
            console.error('Error checking design status:', error);
        }
    }
});

// ========== CONTEXT MENU CLICK HANDLER ==========
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        switch (info.menuItemId) {
            case 'viewFavorites':
                await chrome.tabs.sendMessage(tab.id, { action: 'openFavorites' })
                    .catch(err => console.warn('Could not send message to tab:', err));
                break;

            case 'addToFavorites':
                await chrome.tabs.sendMessage(tab.id, { action: 'addCurrentToFavorites' })
                    .catch(err => console.warn('Could not send message to tab:', err));
                break;

            case 'openQeseh':
                await chrome.tabs.create({ url: EXTENSION_CONFIG.BASE_URL });
                break;

            case 'toggleNetflixDesign':
                const result = await chrome.storage.sync.get(['designEnabled']);
                const newState = !result.designEnabled;
                await chrome.storage.sync.set({ designEnabled: newState });

                // Reload if on qeseh.com
                if (tab.url && tab.url.includes(EXTENSION_CONFIG.SITE_DOMAIN)) {
                    await chrome.tabs.reload(tab.id);
                }
                break;
        }
    } catch (error) {
        console.error('Error handling context menu click:', error);
    }
});

// ========== KEYBOARD SHORTCUT HANDLER ==========
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'toggle-design') {
        try {
            const result = await chrome.storage.sync.get(['designEnabled']);
            const newState = !result.designEnabled;
            await chrome.storage.sync.set({ designEnabled: newState });

            // Reload current tab if on qeseh.com
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0] && tabs[0].url && tabs[0].url.includes(EXTENSION_CONFIG.SITE_DOMAIN)) {
                await chrome.tabs.reload(tabs[0].id);
            }
        } catch (error) {
            console.error('Error toggling design via shortcut:', error);
        }
    }
});

// ========== STATS TRACKING ==========
async function updateStats() {
    try {
        const result = await chrome.storage.sync.get(['stats']);
        const stats = result.stats || {
            activations: 0,
            lastUsed: Date.now(),
            firstUsed: Date.now()
        };

        stats.activations++;
        stats.lastUsed = Date.now();

        await chrome.storage.sync.set({ stats });
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Initialize stats on load
updateStats();

console.log('🎬 Qeseh Netflix Extension - Background Service Active (Refactored V3)');