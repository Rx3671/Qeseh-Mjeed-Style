/*
 * Popup Script for Qeseh Mjeed style Extension
 * Handles popup UI interactions and favorites display
 */

(function () {
    'use strict';

    // ========== INITIALIZATION ==========
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        loadFavoritesCount();
        setupEventListeners();
    }

    // ========== LOAD FAVORITES COUNT ==========
    async function loadFavoritesCount() {
        try {
            const result = await chrome.storage.sync.get(['qesehFavorites']);
            const favorites = result.qesehFavorites || [];
            const countElement = document.getElementById('favorites-count');

            if (countElement) {
                countElement.textContent = favorites.length;
            }
        } catch (error) {
            console.error('Error loading favorites count:', error);
        }
    }

    // ========== SETUP EVENT LISTENERS ==========
    function setupEventListeners() {
        const viewListBtn = document.getElementById('view-list-btn');
        const exportListBtn = document.getElementById('export-list-btn');
        const clearCacheBtn = document.getElementById('clear-cache-btn');

        if (viewListBtn) {
            viewListBtn.addEventListener('click', handleViewList);
        }

        if (exportListBtn) {
            exportListBtn.addEventListener('click', handleExportList);
        }

        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', handleClearCache);
        }
    }

    // ========== EXPORT FAVORITES LIST ==========
    async function handleExportList() {
        try {
            const result = await chrome.storage.sync.get(['qesehFavorites']);
            const favorites = result.qesehFavorites || [];

            if (favorites.length === 0) {
                showNotification('القائمة فارغة!', 'error');
                return;
            }

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(favorites, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "qeseh_favorites_" + new Date().toISOString().slice(0, 10) + ".json");
            document.body.appendChild(downloadAnchorNode); // required for firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();

            showNotification('تم تصدير القائمة بنجاح', 'success');
        } catch (error) {
            console.error('Error exporting list:', error);
            showNotification('حدث خطأ أثناء التصدير', 'error');
        }
    }

    // ========== VIEW FAVORITES LIST ==========
    async function handleViewList() {
        try {
            // Query the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                console.error('No active tab found');
                return;
            }

            // Send message to content script to show favorites modal
            await chrome.tabs.sendMessage(tab.id, {
                action: 'showMyList'
            });

            // Close popup
            window.close();
        } catch (error) {
            console.error('Error opening favorites list:', error);
            showNotification('حدث خطأ أثناء فتح القائمة', 'error');
        }
    }

    // ========== CLEAR CACHE ==========
    async function handleClearCache() {
        try {
            // Clear chrome storage
            await chrome.storage.local.clear();
            await chrome.storage.sync.remove(['qesehFavorites']);

            showNotification('تم مسح الذاكرة المؤقتة بنجاح!', 'success');

            // Update count display
            const countElement = document.getElementById('favorites-count');
            if (countElement) {
                countElement.textContent = '0';
            }

            // Reload active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                await chrome.tabs.reload(tab.id);
            }

            // Close popup after short delay
            setTimeout(() => window.close(), 1500);
        } catch (error) {
            console.error('Error clearing cache:', error);
            showNotification('حدث خطأ أثناء مسح الذاكرة', 'error');
        }
    }

    // ========== SHOW NOTIFICATION ==========
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const icon = type === 'success' ? '✓' : '✕';

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(28, 28, 30, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            animation: slideDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 90%;
            justify-content: center;
        `;

        notification.innerHTML = `
            <div style="
                width: 20px; 
                height: 20px; 
                background: ${type === 'success' ? '#34c759' : '#ff3b30'}; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 12px;
                color: white;
                flex-shrink: 0;
            ">${icon}</div>
            <span>${message}</span>
        `;

        // Add animation keyframes if not exists
        if (!document.getElementById('popup-animations')) {
            const style = document.createElement('style');
            style.id = 'popup-animations';
            style.textContent = `
                @keyframes slideDown {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                @keyframes slideUpFade {
                    from { opacity: 1; transform: translate(-50%, 0); }
                    to { opacity: 0; transform: translate(-50%, -20px); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUpFade 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

})();
