/*
 * mjeed-Style Redesign - Clean Grid Layout (REFACTORED)
 * Enhanced with proper error handling, chrome.storage, and utility functions
 */

(function () {
    'use strict';

    // ========== INITIALIZATION ========== 
    function init() {
        // Wait for DOM to be ready before accessing body/head
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', applyMjeedDesign);
        } else {
            applyMjeedDesign();
        }
    }

    // SPA Navigation Support
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('🔄 URL changed to:', url);
            setTimeout(applyMjeedDesign, 500); // Re-apply design
        }
    }).observe(document, { subtree: true, childList: true });

    // Start
    init();

    // ========== ICONS ==========
    const ICONS = {
        PLAY: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="display: block;"><path d="M8 5v14l11-7z"/></svg>',
        PLUS: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
        CHECK: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        TRASH: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'
    };

    // ========== MAIN FUNCTION ========== 
    function applyMjeedDesign() {
        // Force black background immediately
        const style = document.createElement('style');
        style.textContent = `
            body, html {
                background-color: #000000 !important;
                background: #000000 !important;
            }
        `;
        document.head.appendChild(style);

        console.log('🎬 Mjeed Design: Starting...');

        // Mark touch devices (now safe to access body)
        markTouchDevice();

        document.body.classList.add('mjeed-browsing');

        // Aggressively ensure main content containers are visible
        forceMainContentVisibility();

        ensureViewport(); // Ensure mobile responsiveness

        hideOriginalElements();
        injectMjeedHeader();
        enhancePosters();
        setupScrollEffects();
        addLazyLoading();
        injectAnimationStyles(); // Moved here
        injectDynamicStyles();
        injectMadeWithLove();

        console.log('✅ Mjeed Design: Complete!');

        // Initialize sync listeners
        setupSyncListeners();
    }

    // ========== SYNC LISTENERS ========== 
    function setupSyncListeners() {
        // Listen for chrome.storage changes from other tabs
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName === 'sync' && changes[CONFIG.STORAGE_KEYS.FAVORITES]) {
                Logger.debug('Favorites changed in another tab, syncing...');
                syncAllButtons();
            }
        });

        // Listen for changes within the same tab (custom event)
        window.addEventListener('qesehFavoritesChanged', () => {
            Logger.debug('Favorites changed in this tab');
            // Sync is handled by the event dispatcher
        });

        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'showMyList') {
                showMyListModal();
            }
        });
    }

    // ========== SYNC ALL BUTTONS ========== 
    async function syncAllButtons() {
        try {
            const favorites = await getStorageData(CONFIG.STORAGE_KEYS.FAVORITES, []);
            const posters = safeQuerySelectorAll('.block-post');

            posters.forEach(poster => {
                const postLink = poster.querySelector('a');
                if (!postLink) return;

                const seriesUrl = extractSeriesUrl(postLink.href);

                // Match by URL (more reliable)
                const isFavorite = favorites.some(fav => fav.seriesUrl === seriesUrl);

                const addBtn = poster.querySelector('.mjeed-btn:not(.mjeed-btn-play)');
                if (addBtn) {
                    updateFavoriteButton(addBtn, isFavorite);
                }
            });
        } catch (error) {
            Logger.error('Error syncing buttons:', error);
        }
    }

    // Helper function to update favorite button state
    function updateFavoriteButton(button, isFavorite) {
        if (isFavorite) {
            button.innerHTML = ICONS.CHECK;
            button.style.borderColor = '#46d369';
            button.style.background = 'rgba(70, 211, 105, 0.2)';
            button.title = 'في قائمتي';
            button.classList.add('in-list');
        } else {
            button.innerHTML = ICONS.PLUS;
            button.style.borderColor = 'rgba(255, 255, 255, 0.7)';
            button.style.background = 'rgba(255, 255, 255, 0.2)';
            button.title = 'إضافة إلى قائمتي';
            button.classList.remove('in-list');
        }
    }

    // ========== FORCE MAIN CONTENT VISIBILITY ========== 
    function forceMainContentVisibility() {
        const mainContainers = safeQuerySelectorAll('.sec-line, .containers, .container-fluid, .row, #load-post');
        mainContainers.forEach(el => {
            if (el) {
                el.style.setProperty('display', 'block', 'important');
                el.style.setProperty('visibility', 'visible', 'important');
                el.style.setProperty('opacity', '1', 'important');
            }
        });
    }

    // ========== ENSURE VIEWPORT FOR MOBILE ==========
    function ensureViewport() {
        let viewport = safeQuerySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            if (document.head) {
                document.head.appendChild(viewport);
            }
        }
        // Force "app-like" behavior with safe area support
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        Logger.info('Viewport configured for mobile responsiveness');
    }

    // ========== HIDE ORIGINAL ELEMENTS ========== 
    function hideOriginalElements() {
        // Only hide elements that are definitely replaced or not needed for the new design.
        // We must be careful not to hide the main content container.
        const selectorsToHide = [
            '.footer',
            '.copyRight',
            '#menuFooter',
            '#leftMenu',
            '.iconSearch',
            '.btn-mobile',
            '.navbar-collapse',
            '#search .sea_close'
        ];

        selectorsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (el) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                }
            });
        });

        // Hide the original header if the new one is injected, but we will handle this in injectNetflixHeader
        // For now, we will only hide the elements that are definitely not needed.
        // The main content is usually within a container that is not hidden here.
    }

    // ========== INJECT NETFLIX HEADER ========== 
    function injectMjeedHeader() {
        if (document.getElementById('mjeed-header')) return;

        // Skip on Watch Page to prevent conflicts
        if (window.location.href.includes('/watch')) return;

        const header = document.createElement('div');
        header.id = 'mjeed-header';

        // Logo Container
        const logoContainer = document.createElement('div');
        logoContainer.className = 'mjeed-logo-container';
        logoContainer.style.display = 'flex';
        logoContainer.style.flexDirection = 'column';
        logoContainer.style.justifyContent = 'center';
        logoContainer.style.marginLeft = '20px';

        // Logo
        const logo = document.createElement('a');
        logo.id = 'mjeed-logo';
        logo.href = '/';
        logo.textContent = 'Qeseh';
        logo.setAttribute('aria-label', 'الصفحة الرئيسية');
        logo.style.marginLeft = '0'; // Reset margin

        // Subtitle
        const subtitle = document.createElement('span');
        subtitle.className = 'mjeed-logo-subtitle';
        subtitle.textContent = 'اعاده تصميم كامل لموقع قصه عشق';
        subtitle.style.fontSize = '9px';
        subtitle.style.color = 'rgba(255, 255, 255, 0.6)';
        subtitle.style.marginTop = '2px';
        subtitle.style.whiteSpace = 'nowrap';
        subtitle.style.fontWeight = 'normal';

        logoContainer.appendChild(logo);
        logoContainer.appendChild(subtitle);

        // Hide original header after new one is created
        const originalHeader = document.getElementById('headerNav');
        if (originalHeader) {
            originalHeader.style.display = 'none';
        }

        // Navigation
        const nav = document.createElement('nav');
        nav.id = 'mjeed-nav';

        const navLinks = [
            { text: 'الرئيسية', href: '/' },
            { text: 'مسلسلات', href: '/all-series/' },
            { text: 'أفلام', href: '/category/الأفلام-التركية/' },
            { text: 'أحدث', href: '/episodes/' },
            { text: 'كاملة', href: '/category/مسلسلات-كاملة/' },
            { text: 'قائمتي', href: '#', id: 'my-list-btn' },
            { text: 'MJEED', href: '#', id: 'mjeed-profile-btn' }
        ];

        navLinks.forEach(linkData => {
            const link = document.createElement('a');
            link.href = linkData.href;
            link.textContent = linkData.text;

            if (linkData.id) {
                link.id = linkData.id;
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (linkData.id === 'my-list-btn') {
                        showMyListModal();
                    } else if (linkData.id === 'mjeed-profile-btn') {
                        showProfileModal();
                    }
                });
            }

            // Mark current page
            if (window.location.pathname === linkData.href ||
                window.location.pathname.includes(linkData.href.slice(0, -1))) {
                link.style.color = '#ffffff';
            }

            nav.appendChild(link);
        });

        // Search icon
        const searchIcon = document.createElement('span');
        searchIcon.id = 'mjeed-search-icon';
        searchIcon.textContent = '🔍';
        searchIcon.setAttribute('role', 'button');
        searchIcon.setAttribute('aria-label', 'البحث');
        searchIcon.addEventListener('click', toggleSearch);

        // Assemble
        header.appendChild(logoContainer);
        header.appendChild(nav);
        header.appendChild(searchIcon);

        document.body.insertBefore(header, document.body.firstChild);

        console.log('✅ Header injected');
    }

    // ========== ENHANCE POSTERS ========== 
    async function enhancePosters() {
        const posters = document.querySelectorAll('.block-post');
        if (posters.length === 0) return;

        // Fetch favorites from Chrome Storage (Sync)
        const favorites = await getStorageData(CONFIG.STORAGE_KEYS.FAVORITES, []);

        posters.forEach((poster, index) => {
            // Check if already enhanced
            if (poster.querySelector('.mjeed-info')) return;

            // Get title and link
            const titleElement = poster.querySelector('.title');
            const titleText = titleElement ? titleElement.textContent.trim() : '';

            // Check for the specific title to remove
            if (titleElement) {
                titleElement.remove();
                console.log('Removed specific hidden title div.');
            }


            // Get the post link
            const postLink = poster.querySelector('a');
            const postUrl = postLink ? postLink.href : '#';

            // Get poster image
            const imgBg = poster.querySelector('.imgBg');
            const posterImage = imgBg ? window.getComputedStyle(imgBg).backgroundImage : '';

            // Extract series URL (remove episode number from URL)
            const seriesUrl = extractSeriesUrl(postUrl);
            const seriesTitle = extractSeriesTitle(titleText);

            // Hide title element instead of removing

            // Hide episode number instead of removing
            // Episode number handling is now managed by CSS or specific page scripts
            // We do NOT want to hide it globally here as it affects the series page
            /*
            const episodeNum = poster.querySelector('.episodeNum');
            if (episodeNum) {
                episodeNum.style.display = 'none';
            }
            */

            // Create info overlay
            const infoOverlay = document.createElement('div');
            infoOverlay.className = 'mjeed-info';

            const title = document.createElement('div');
            title.className = 'mjeed-info-title';
            title.textContent = titleText;

            const actions = document.createElement('div');
            actions.className = 'mjeed-info-actions';

            // Play button
            const playBtn = document.createElement('button');
            playBtn.className = 'mjeed-btn mjeed-btn-play';
            playBtn.innerHTML = `${ICONS.PLAY} مشاهدة`;
            playBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.href = postUrl;
            };

            // Add button
            const addBtn = document.createElement('button');
            addBtn.className = 'mjeed-btn';
            addBtn.title = 'إضافة إلى قائمتي';

            // Check if series already in favorites (Match by Title)
            const isFavorite = favorites.some(fav => (fav.title || '').trim() === (seriesTitle || '').trim());

            if (isFavorite) {
                addBtn.innerHTML = ICONS.CHECK;
                addBtn.style.borderColor = '#46d369';
                addBtn.style.background = 'rgba(70, 211, 105, 0.2)';
                addBtn.title = 'في قائمتي';
                addBtn.classList.add('in-list');
            } else {
                addBtn.innerHTML = ICONS.PLUS;
                addBtn.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                addBtn.classList.remove('in-list');
            }

            addBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(seriesUrl, seriesTitle, posterImage, addBtn);
            };

            actions.appendChild(playBtn);
            actions.appendChild(addBtn);



            infoOverlay.appendChild(title);
            infoOverlay.appendChild(actions);

            poster.appendChild(infoOverlay);

            // Add hover delay
            let hoverTimeout;
            poster.addEventListener('mouseenter', function () {
                hoverTimeout = setTimeout(() => {
                    this.classList.add('mjeed-hover');
                }, 400);
            });

            poster.addEventListener('mouseleave', function () {
                clearTimeout(hoverTimeout);
                this.classList.remove('mjeed-hover');
            });
        });

        console.log(`✅ Enhanced ${posters.length} posters`);
    }

    // ========== SCROLL EFFECTS (with Debounce) ========== 
    function setupScrollEffects() {
        const header = safeQuerySelector('#mjeed-header');
        if (!header) return;

        let lastScrollTop = 0;
        let ticking = false;

        const handleScroll = debounce(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (scrollTop > 100) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }

                    if (scrollTop > lastScrollTop && scrollTop > 200) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }

                    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                    ticking = false;
                });

                ticking = true;
            }
        }, CONFIG.TIMING.SCROLL_DEBOUNCE);

        window.addEventListener('scroll', handleScroll);

        Logger.info('Scroll effects initialized with debounce');
    }

    // ========== SHOW MY LIST MODAL ========== 
    async function showMyListModal() {
        // Remove existing modal if any
        const existingModal = safeQuerySelector('.mjeed-modal-overlay');
        if (existingModal) {
            existingModal.remove();
            return;
        }

        try {
            const favorites = await getStorageData(CONFIG.STORAGE_KEYS.FAVORITES, []);

            const modal = document.createElement('div');
            modal.className = 'mjeed-modal-overlay';

            const content = document.createElement('div');
            content.className = 'mjeed-modal-content';

            // Header
            const header = document.createElement('div');
            header.className = 'mjeed-modal-header';

            const title = document.createElement('h2');
            title.textContent = `قائمتي (${favorites.length})`;
            title.className = 'mjeed-modal-title';

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✕';
            closeBtn.className = 'mjeed-modal-close';
            closeBtn.onclick = () => modal.remove();

            header.appendChild(title);
            header.appendChild(closeBtn);

            // Grid
            const grid = document.createElement('div');
            grid.className = 'mjeed-modal-grid';

            if (favorites.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'mjeed-modal-empty';
                emptyMessage.innerHTML = `
                <div class="mjeed-modal-empty-icon">📝</div>
                <p style="margin: 0;">قائمتك فارغة</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">ابدأ بإضافة مسلسلاتك المفضلة</p>
            `;
                grid.appendChild(emptyMessage);
            } else {
                favorites.reverse().forEach((item, index) => {
                    const card = document.createElement('div');
                    card.className = 'mjeed-modal-card';

                    // Poster
                    const posterDiv = document.createElement('div');
                    posterDiv.className = 'mjeed-modal-poster';

                    const posterImg = document.createElement('div');
                    posterImg.className = 'mjeed-modal-poster-img';
                    posterImg.style.backgroundImage = item.posterImage;

                    // Remove button overlay
                    const removeOverlay = document.createElement('div');
                    removeOverlay.className = 'mjeed-modal-overlay-actions';

                    const overlayTitle = document.createElement('div');
                    overlayTitle.textContent = item.title;
                    overlayTitle.className = 'mjeed-modal-card-title';

                    const overlayActions = document.createElement('div');
                    overlayActions.className = 'mjeed-modal-btn-group';

                    const watchBtnOverlay = document.createElement('button');
                    watchBtnOverlay.innerHTML = '▶ مشاهدة';
                    watchBtnOverlay.className = 'mjeed-modal-btn mjeed-modal-btn-watch';
                    watchBtnOverlay.onclick = (e) => {
                        e.stopPropagation();
                        window.location.href = item.seriesUrl;
                    };

                    const removeBtnOverlay = document.createElement('button');
                    removeBtnOverlay.innerHTML = ICONS.TRASH;
                    removeBtnOverlay.title = 'إزالة';
                    removeBtnOverlay.className = 'mjeed-modal-btn mjeed-modal-btn-remove';
                    removeBtnOverlay.onclick = async (e) => {
                        e.stopPropagation();
                        await removeFavorite(item.seriesUrl); // Pass URL correctly
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.9)';
                        setTimeout(async () => {
                            card.remove();
                            const favorites = await getStorageData(CONFIG.STORAGE_KEYS.FAVORITES, []);
                            const newCount = favorites.length;
                            title.textContent = `قائمتي (${newCount})`;
                            if (newCount === 0) {
                                modal.remove();
                                showMyListModal(); // Re-open to show empty state
                            }
                        }, 300);
                    };

                    overlayActions.appendChild(watchBtnOverlay);
                    overlayActions.appendChild(removeBtnOverlay);
                    removeOverlay.appendChild(overlayTitle);
                    removeOverlay.appendChild(overlayActions);

                    posterDiv.appendChild(posterImg);
                    posterDiv.appendChild(removeOverlay);

                    card.appendChild(posterDiv);
                    // Removed cardTitle as per request
                    grid.appendChild(card);

                    card.onclick = (e) => {
                        if (!e.target.closest('button')) {
                            window.location.href = item.seriesUrl;
                        }
                    };
                });
            }

            content.appendChild(header);
            content.appendChild(grid);
            modal.appendChild(content);
            document.body.appendChild(modal);

            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // Close on ESC
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        } catch (error) {
            Logger.error('Error showing My List modal:', error);
        }
    }

    // ========== SHOW PROFILE MODAL ========== 
    function showProfileModal() {
        const existingModal = document.getElementById('mjeed-profile-modal');
        if (existingModal) {
            existingModal.remove();
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'mjeed-profile-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            width: 90%;
            max-width: 500px;
            height: 600px;
            background: transparent;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        `;

        const iframe = document.createElement('iframe');
        iframe.src = chrome.runtime.getURL('profile.html');
        iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: transparent;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 20px;
            cursor: pointer;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            z-index: 10;
        `;
        closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(0, 0, 0, 0.8)';
        closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(0, 0, 0, 0.5)';
        closeBtn.onclick = () => modal.remove();

        content.appendChild(iframe);
        content.appendChild(closeBtn);
        modal.appendChild(content);
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // ========== REMOVE FAVORITE ========== 
    async function removeFavorite(seriesUrl) {
        try {
            let favorites = await getStorageData(CONFIG.STORAGE_KEYS.FAVORITES, []);

            // Match by URL
            favorites = favorites.filter(fav => fav.seriesUrl !== seriesUrl);
            await setStorageData(CONFIG.STORAGE_KEYS.FAVORITES, favorites);

            // Update all buttons on the page
            syncAllButtons();

            showNotification('تم الإزالة من قائمتي', 'mjeed-tv');

            // Dispatch event for same-tab sync
            window.dispatchEvent(new CustomEvent('qesehFavoritesChanged', {
                detail: { favorites: favorites }
            }));
        } catch (error) {
            Logger.error('Error removing favorite:', error);
        }
    }

    // ========== TOGGLE FAVORITE ========== 
    async function toggleFavorite(seriesUrl, seriesTitle, posterImage, button) {
        try {
            let favorites = await getStorageData(CONFIG.STORAGE_KEYS.FAVORITES, []);

            // Match by URL
            const index = favorites.findIndex(fav => fav.seriesUrl === seriesUrl);

            Logger.debug(`Toggling favorite: ${seriesTitle} (Index: ${index})`);

            if (index > -1) {
                // Remove from favorites
                favorites.splice(index, 1);
                updateFavoriteButton(button, false);
                showNotification('تم الإزالة من قائمتي', 'mjeed-tv');
            } else {
                // Add to favorites
                favorites.push({
                    seriesUrl: seriesUrl,
                    title: seriesTitle,
                    posterImage: posterImage,
                    addedAt: new Date().toISOString()
                });
                updateFavoriteButton(button, true);
                showNotification('تمت الإضافة إلى قائمتي', 'mjeed-success');
            }

            await setStorageData(CONFIG.STORAGE_KEYS.FAVORITES, favorites);

            // Dispatch event for same-tab sync
            window.dispatchEvent(new CustomEvent('qesehFavoritesChanged', {
                detail: { favorites: favorites }
            }));

            // Sync all buttons
            syncAllButtons();
        } catch (error) {
            Logger.error('Error toggling favorite:', error);
            showNotification('حدث خطأ في حفظ التغييرات');
        }
    }

    // ========== UPDATE ALL SERIES BUTTONS ========== 
    function updateAllSeriesButtons(seriesUrl, isFavorite, targetSeriesTitle) {
        const posters = document.querySelectorAll('.block-post');
        posters.forEach(poster => {
            const postLink = poster.querySelector('a');
            if (postLink) {
                const titleElement = poster.querySelector('.mjeed-info-title');
                const seriesTitle = titleElement ? extractSeriesTitle(titleElement.textContent) : extractSeriesTitle(poster.querySelector('.title')?.textContent || '');

                // Compare by title
                if ((seriesTitle || '').trim() === (targetSeriesTitle || '').trim()) {
                    const addBtn = poster.querySelector('.mjeed-btn:not(.mjeed-btn-play)');
                    if (addBtn) {
                        if (isFavorite) {
                            addBtn.innerHTML = '✓';
                            addBtn.style.borderColor = '#46d369';
                            addBtn.style.background = 'rgba(70, 211, 105, 0.2)';
                            addBtn.title = 'في قائمتي';
                            addBtn.classList.add('in-list');
                        } else {
                            addBtn.innerHTML = '+';
                            addBtn.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                            addBtn.style.background = 'rgba(30, 30, 30, 0.7)';
                            addBtn.title = 'إضافة إلى قائمتي';
                            addBtn.classList.remove('in-list');
                        }
                    }
                }
            }
        });
    }

    // ========== SHOW NOTIFICATION ========== 
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');

        // Mjeed Style Notification
        if (type === 'mjeed' || type === 'mjeed-success') {
            const icon = type === 'mjeed-success' ? '✓' : '✕';
            notification.style.cssText = `
                position: fixed;
                top: 24px;
                right: 24px;
                background: rgba(28, 28, 30, 0.6);
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 15px;
                font-weight: 600;
                z-index: 10001;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                animation: slideInRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                backdrop-filter: blur(30px);
                -webkit-backdrop-filter: blur(30px);
                display: flex;
                align-items: center;
                gap: 12px;
                border: 1px solid rgba(255, 255, 255, 0.15);
            `;
            notification.innerHTML = `
                <div style="
                    width: 24px; 
                    height: 24px; 
                    background: ${type === 'mjeed-success' ? '#34c759' : '#ff3b30'}; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 14px;
                    color: white;
                ">${icon}</div>
                <span>${message}</span>
            `;
        } else {
            // Default Style
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 4%;
                background: ${type === 'success' ? 'rgba(70, 211, 105, 0.95)' : 'rgba(229, 9, 20, 0.95)'};
                color: white;
                padding: 16px 28px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                z-index: 10001;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8);
                animation: slideInRight 0.3s ease;
                backdrop-filter: blur(10px);
            `;
            notification.textContent = message;
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ========== TOGGLE SEARCH ========== 
    function toggleSearch() {
        let searchContainer = document.querySelector('.mjeed-search-overlay');

        if (searchContainer) {
            searchContainer.remove();
            return;
        }

        searchContainer = document.createElement('div');
        searchContainer.className = 'mjeed-search-overlay';
        searchContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        const searchBox = document.createElement('div');
        searchBox.style.cssText = `
            width: 90%;
            max-width: 700px;
            background: rgba(20, 20, 20, 0.98);
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.9);
        `;

        searchBox.innerHTML = `
            <h2 style="color: white; font-size: 28px; margin-bottom: 25px; text-align: center;">
                ابحث عن مسلسل أو فيلم
            </h2>
            <form action="/" method="GET" style="display: flex; gap: 15px;">
                <input 
                    type="text" 
                    name="s" 
                    placeholder="اكتب اسم المسلسل..." 
                    style="
                        flex: 1;
                        padding: 18px 24px;
                        border: 2px solid #333;
                        border-radius: 8px;
                        background: #1a1a1a;
                        color: white;
                        font-size: 18px;
                        outline: none;
                        transition: border-color 0.3s;
                    "
                    autofocus
                />
                <button type="submit" style="
                    padding: 18px 40px;
                    background: #e50914;
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-weight: 700;
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.3s;
                    white-space: nowrap;
                ">🔍 بحث</button>
            </form>
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
                اضغط ESC للإغلاق
            </p>
        `;

        searchContainer.appendChild(searchBox);
        document.body.appendChild(searchContainer);

        // Focus input
        const input = searchBox.querySelector('input');
        input.focus();

        // Hover effect for input
        input.addEventListener('focus', function () {
            this.style.borderColor = '#e50914';
        });

        input.addEventListener('blur', function () {
            this.style.borderColor = '#333';
        });

        // Close handlers
        searchContainer.addEventListener('click', function (e) {
            if (e.target === searchContainer) {
                searchContainer.remove();
            }
        });

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                searchContainer.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // ========== LAZY LOADING ========== 
    function addLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const imgBg = entry.target;
                    imgBg.style.opacity = '1';
                    imageObserver.unobserve(imgBg);
                }
            });
        }, {
            rootMargin: '100px'
        });

        document.querySelectorAll('.imgBg').forEach(img => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.6s ease';
            imageObserver.observe(img);
        });

        console.log('✅ Lazy loading initialized');
    }

    // ========== KEYBOARD SHORTCUTS ========== 
    document.addEventListener('keydown', (e) => {
        // Press '/' to search
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            toggleSearch();
        }

        // Press 's' to search
        if (e.key === 's' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            toggleSearch();
        }
    });

    // ========== INJECT MADE WITH LOVE ========== 
    function injectMadeWithLove() {
        if (document.getElementById('made-with-love')) return;

        const madeWithLove = document.createElement('div');
        madeWithLove.id = 'made-with-love';
        madeWithLove.innerHTML = 'Made with <span style="color: #e50914; display: inline-block; animation: beat 1s infinite;">❤️</span> BY MJEED';
        madeWithLove.style.cssText = `
            text-align: center;
            color: #ffffff;
            font-size: 13px;
            font-weight: 700;
            padding: 15px 0;
            width: 100%;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin-top: 70px; /* Space for fixed header */
            margin-bottom: 0;
            opacity: 0.9;
            text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        `;

        // Add heartbeat animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes beat {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);

        // Insert before the first container or sec-line
        const target = document.querySelector('.sec-line') || document.querySelector('.containers') || document.querySelector('.container-fluid');
        if (target) {
            // If sec-line exists, insert inside it at the top
            if (target.classList.contains('sec-line')) {
                target.insertBefore(madeWithLove, target.firstChild);
                // Remove margin-top since sec-line has padding
                madeWithLove.style.marginTop = '0';
                madeWithLove.style.marginBottom = '20px';
            } else {
                target.parentNode.insertBefore(madeWithLove, target);
            }
        } else {
            document.body.appendChild(madeWithLove);
        }
    }

    // ========== START ========== 
    init();

    // Re-run enhancement on dynamic content
    const observer = new MutationObserver((mutations) => {
        let shouldEnhance = false;

        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('post')) {
                        shouldEnhance = true;
                    }
                });
            }
        });

        if (shouldEnhance) {
            setTimeout(() => {
                enhancePosters();
                addLazyLoading();
            }, 500);
        }
    });

    const loadPost = document.getElementById('load-post');
    if (loadPost) {
        observer.observe(loadPost, {
            childList: true,
            subtree: true
        });
    }

    // Add fade in animation keyframe
    function injectAnimationStyles() {
        if (document.getElementById('mjeed-main-animations')) return;

        const style = document.createElement('style');
        style.id = 'mjeed-main-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.8); }
            }
        `;
        if (document.head) {
            document.head.appendChild(style);
        }
    }

    // ========== INJECT DYNAMIC STYLES ==========
    function injectDynamicStyles() {
        if (!CONFIG.STYLES) return;

        let cssVariables = ':root {\n';

        // 1. Flatten and add all base styles
        const categories = ['COLORS', 'SPACING', 'TYPOGRAPHY', 'LAYOUT'];
        categories.forEach(category => {
            if (CONFIG.STYLES[category]) {
                Object.entries(CONFIG.STYLES[category]).forEach(([key, value]) => {
                    cssVariables += `    ${key}: ${value};\n`;
                });
            }
        });

        // 2. Apply Device Specific Overrides
        const width = window.innerWidth;
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        let deviceType = 'DESKTOP'; // Default

        if (/iPad|Macintosh/i.test(userAgent) && 'ontouchend' in document) {
            deviceType = 'IPAD';
        } else if (/iPhone|iPod/i.test(userAgent)) {
            deviceType = 'IPHONE';
        } else if (width > 1600) {
            deviceType = 'LARGE_SCREEN';
        }

        if (CONFIG.STYLES.DEVICES && CONFIG.STYLES.DEVICES[deviceType]) {
            console.log(`📱 Applying styles for: ${deviceType}`);
            Object.entries(CONFIG.STYLES.DEVICES[deviceType]).forEach(([key, value]) => {
                cssVariables += `    ${key}: ${value} !important;\n`;
            });
        }

        cssVariables += '}\n';

        const style = document.createElement('style');
        style.id = 'mjeed-dynamic-styles';
        style.textContent = cssVariables;
        document.head.appendChild(style);
    }

})();
