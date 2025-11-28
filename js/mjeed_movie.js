/*
 * Movie Page Mjeed Style 
 */

(function () {
    'use strict';

    console.log('🎬 Mjeed Movie Page Script Started');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 50);
    }

    // SPA Navigation & Content Loading Support
    let lastUrl = location.href;
    let retryCount = 0;
    const MAX_RETRIES = 20;
    let initTimeout = null;

    new MutationObserver((mutations) => {
        const url = location.href;
        const isMovieUrl = url.includes('/movies/');

        // 1. Handle URL Change
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('🔄 URL changed to:', url);
            retryCount = 0; // Reset retries

            // Always run init to handle cleanup or setup
            setTimeout(init, 500);
        }
        // 2. Handle Content Loading (if on movie page but hero missing)
        else if (isMovieUrl && !document.getElementById('mjeed-movie-hero')) {
            // If we see relevant content but no hero, try to init
            // We limit retries to avoid infinite loops if extraction fails
            if (retryCount < MAX_RETRIES) {
                const hasContent = document.querySelector('.singleSeries') ||
                    document.querySelector('.singleInfo') ||
                    document.querySelector('h1');

                if (hasContent) {
                    // Debounce the init call
                    if (!initTimeout) {
                        initTimeout = setTimeout(() => {
                            console.log('DOM content detected, attempting init...');
                            init();
                            retryCount++;
                            initTimeout = null;
                        }, 200);
                    }
                }
            }
        }
    }).observe(document, { subtree: true, childList: true });

    function init() {
        const isMoviesUrl = window.location.href.includes('/movies/');

        if (!isMoviesUrl) {
            console.log('❌ Not a movie page, skipping movie script');
            const existingHero = document.getElementById('mjeed-movie-hero');
            if (existingHero) existingHero.remove();
            return;
        }

        console.log('✅ Movie page detected!');

        setTimeout(() => {
            try {
                transformPage();
            } catch (error) {
                console.error('❌ Transform error:', error);
            }
        }, 200);
    }

    function transformPage() {
        console.log('🔄 Starting movie page transformation...');

        const pageData = extractPageData();

        // Validate Data
        if (!pageData.title) {
            console.log('⚠️ No movie title found yet, skipping transform');
            return;
        }

        console.log('📊 Extracted data:', pageData);

        createHeroSection(pageData);
        syncMyListButton();
        addAnimationStyles();

        console.log('✅ Movie page transformation complete!');
    }

    // ========== EXTRACT PAGE DATA ========== 
    function extractPageData() {
        const data = {
            title: '',
            story: '',
            cast: '',
            posterImage: '',
            movieUrl: '',
            watchUrl: ''
        };

        // Get watch URL from player link
        const playerLink = document.querySelector('.modern-player-container a.fullscreen-clickable');
        if (playerLink && playerLink.href) {
            data.watchUrl = playerLink.href;
            console.log('✅ Watch URL found:', data.watchUrl);
        }

        const singleSeries = document.querySelector('.singleSeries');
        if (singleSeries) {
            const titleEl = singleSeries.querySelector('.info h1 a') ||
                singleSeries.querySelector('.info h1') ||
                document.querySelector('.singleInfo h1');

            if (titleEl) {
                data.title = titleEl.textContent.trim();
                if (titleEl.href) {
                    data.movieUrl = titleEl.href;
                }
            }

            const storyEl = singleSeries.querySelector('.info .story');
            if (storyEl) {
                data.story = storyEl.textContent.trim();
            }

            const castEl = singleSeries.querySelector('.info .tax');
            if (castEl) {
                data.cast = castEl.innerHTML;
            }

            const posterEl = singleSeries.querySelector('.cover .img');
            if (posterEl) {
                const bgImage = window.getComputedStyle(posterEl).backgroundImage;
                if (bgImage && bgImage !== 'none') {
                    data.posterImage = bgImage;
                }
            }
        } else {
            // Fallback for pages without .singleSeries
            // Try to find title
            const h1 = document.querySelector('h1');
            if (h1) {
                data.title = h1.textContent.trim();
            }

            // Try to find poster
            const posterImg = document.querySelector('.poster img, .img img, .cover img');
            if (posterImg) {
                data.posterImage = `url('${posterImg.src}')`;
            }
        }

        // Fallback for title from document title
        if (!data.title) {
            data.title = document.title.replace(' - قصة عشق', '').trim();
        }

        // Extract poster from modern-player-container (highest priority)
        const playerContainer = document.querySelector('.modern-player-container');
        if (playerContainer) {
            const bgImage = window.getComputedStyle(playerContainer).backgroundImage;
            if (bgImage && bgImage !== 'none') {
                data.posterImage = bgImage;
            }
        }

        // Fallback to singleSeries poster
        if (!data.posterImage) {
            const posterEl = singleSeries ? singleSeries.querySelector('.cover .img') : null;
            if (posterEl) {
                const bgImage = window.getComputedStyle(posterEl).backgroundImage;
                if (bgImage && bgImage !== 'none') {
                    data.posterImage = bgImage;
                }
            }
        }

        // Fallback to any large image
        if (!data.posterImage) {
            const anyImg = document.querySelector('.singleSeries img') || document.querySelector('.poster img');
            if (anyImg) {
                data.posterImage = `url('${anyImg.src}')`;
            }
        }

        // Get movie URL from current page if not found
        if (!data.movieUrl) {
            data.movieUrl = window.location.href;
        }

        return data;
    }

    // ========== CREATE HERO SECTION ========== 
    function createHeroSection(data) {
        console.log('🎨 Creating movie hero section...');

        // Cleanup potential series elements
        const seriesHero = document.getElementById('mjeed-series-hero');
        if (seriesHero) seriesHero.remove();

        const episodesSection = document.querySelector('.mjeed-episodes-section');
        if (episodesSection) episodesSection.remove();

        const existingHero = document.getElementById('mjeed-movie-hero');
        if (existingHero) {
            existingHero.remove();
        }

        const hero = document.createElement('div');
        hero.id = 'mjeed-movie-hero';
        hero.className = 'mjeed-movie-hero';

        // Create poster section
        const posterSection = document.createElement('div');
        posterSection.className = 'mjeed-hero-poster';
        if (data.posterImage) {
            // Use the full background-image string
            posterSection.style.backgroundImage = data.posterImage;
        }
        hero.appendChild(posterSection);

        // Create content container
        const content = document.createElement('div');
        content.className = 'mjeed-hero-content';

        // Title
        if (data.title) {
            const titleEl = document.createElement('h1');
            titleEl.className = 'mjeed-movie-title';
            titleEl.textContent = data.title;
            content.appendChild(titleEl);
        }

        // Story
        if (data.story) {
            const storyEl = document.createElement('div');
            storyEl.className = 'mjeed-movie-story';
            storyEl.textContent = data.story;
            content.appendChild(storyEl);
        }

        // Cast
        if (data.cast) {
            const castEl = document.createElement('div');
            castEl.className = 'mjeed-movie-cast';
            castEl.innerHTML = data.cast;
            content.appendChild(castEl);
        }

        // Buttons
        const buttons = document.createElement('div');
        buttons.className = 'mjeed-hero-buttons';

        // Watch Button - Always link to watch page
        const playBtn = document.createElement('a');
        playBtn.className = 'mjeed-play-btn';
        playBtn.href = data.watchUrl || '#';
        playBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <span>مشاهدة</span>
        `;

        // If no watch URL, scroll to player
        if (!data.watchUrl) {
            playBtn.onclick = (e) => {
                e.preventDefault();
                const player = document.querySelector('.secContainer') || document.querySelector('.modern-player-container');
                if (player) {
                    player.scrollIntoView({ behavior: 'smooth' });
                }
            };
        }

        buttons.appendChild(playBtn);

        // My List Button
        const myListBtn = createMyListButton(data.movieUrl, data.title, data.posterImage);
        buttons.appendChild(myListBtn);

        content.appendChild(buttons);
        hero.appendChild(content);

        // Insert hero right after headerNav (at the top)
        const headerNav = document.querySelector('#headerNav');
        if (headerNav && headerNav.nextSibling) {
            headerNav.parentNode.insertBefore(hero, headerNav.nextSibling);
            console.log('✅ Hero inserted after header');
        } else {
            // Fallback: insert before secContainer
            const secContainer = document.querySelector('.secContainer');
            if (secContainer) {
                secContainer.parentNode.insertBefore(hero, secContainer);
                console.log('✅ Hero inserted before video player');
            }
        }
    }

    // ========== CREATE MY LIST BUTTON (Chrome Storage) ========== 
    function createMyListButton(movieUrl, title, posterImage) {
        const button = document.createElement('button');
        button.className = 'mjeed-mylist-btn';
        button.setAttribute('data-movie-url', movieUrl);
        button.setAttribute('data-movie-title', title);

        // Initialize state asynchronously
        chrome.storage.sync.get(['qesehFavorites'], (result) => {
            const favorites = result.qesehFavorites || [];
            const isInList = favorites.some(fav =>
                fav.seriesUrl === movieUrl || // reusing seriesUrl field for consistency
                (fav.title || '').trim() === (title || '').trim()
            );
            updateButtonState(button, isInList);
        });

        button.onclick = () => {
            toggleFavorite(movieUrl, title, posterImage, button);
        };

        return button;
    }

    // ========== UPDATE BUTTON STATE ========== 
    function updateButtonState(button, isInList) {
        if (isInList) {
            button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>في قائمتي</span>
            `;
            button.classList.add('in-list');
        } else {
            button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <span>قائمتي</span>
            `;
            button.classList.remove('in-list');
        }
    }

    // ========== TOGGLE FAVORITE (Chrome Storage) ========== 
    function toggleFavorite(movieUrl, title, posterImage, button) {
        chrome.storage.sync.get(['qesehFavorites'], (result) => {
            let favorites = result.qesehFavorites || [];

            // Match by URL OR Title
            const index = favorites.findIndex(fav =>
                fav.seriesUrl === movieUrl ||
                (fav.title || '').trim() === (title || '').trim()
            );

            if (index > -1) {
                // Remove from favorites
                favorites.splice(index, 1);
                updateButtonState(button, false);
                showNotification('تم الإزالة من قائمتي', 'mjeed');
                console.log('❌ Removed from My List:', title);
            } else {
                // Add to favorites
                const newFavorite = {
                    seriesUrl: movieUrl, // reusing seriesUrl field
                    title: title,
                    posterImage: posterImage,
                    addedAt: new Date().toISOString(),
                    type: 'movie' // Add type to distinguish
                };
                favorites.push(newFavorite);
                updateButtonState(button, true);
                showNotification('تمت الإضافة إلى قائمتي', 'mjeed-success');
                console.log('✅ Added to My List:', newFavorite);
            }

            chrome.storage.sync.set({ qesehFavorites: favorites }, () => {
                console.log('💾 Favorites saved to Chrome Storage');
            });
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
            // Default Style (Fallback)
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

    // ========== SYNC MY LIST ACROSS TABS/PAGES (Chrome Storage) ========== 
    function syncMyListButton() {
        const button = document.querySelector('.mjeed-mylist-btn');
        if (!button) return;

        const title = button.getAttribute('data-movie-title');
        const movieUrl = button.getAttribute('data-movie-url');

        if (!title && !movieUrl) return;

        chrome.storage.sync.get(['qesehFavorites'], (result) => {
            const favorites = result.qesehFavorites || [];
            const isInList = favorites.some(fav =>
                (movieUrl && fav.seriesUrl === movieUrl) ||
                (title && (fav.title || '').trim() === (title || '').trim())
            );

            console.log('🔄 Syncing My List button:', {
                title: title,
                movieUrl: movieUrl,
                isInList: isInList
            });

            updateButtonState(button, isInList);
        });
    }

    // Monitor Chrome Storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.qesehFavorites) {
            console.log('🔄 My List changed in storage - syncing button state');
            syncMyListButton();
        }
    });

    // ========== ADD ANIMATION STYLES ========== 
    function addAnimationStyles() {
        if (document.getElementById('mjeed-animations')) return;

        const style = document.createElement('style');
        style.id = 'mjeed-animations';
        style.textContent = `
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
        `;
        document.head.appendChild(style);
    }

})();
