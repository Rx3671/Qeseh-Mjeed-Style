/*
 * mjeed-Style Watch Page Script
 * Using utils.js for better code quality
 */

(function () {
    'use strict';

    const UNIQUE_PREFIX = 'mjeed-watch-';

    function initWatchPage() {
        try {
            // Safety check for URL
            if (!window.location.href.includes('/watch')) {
                document.body.classList.remove(UNIQUE_PREFIX + 'active');
                const mainContainer = document.querySelector('.' + UNIQUE_PREFIX + 'main-container');
                if (mainContainer) mainContainer.remove();
                return;
            }

            console.log('🎬 Mjeed Watch Page: Initializing...');

            // 1. Add Unique Body Class
            document.body.classList.add(UNIQUE_PREFIX + 'active');

            // 2. Get Original Elements
            const originalPlayer = safeQuerySelector('.getEmbed');
            const originalHero = safeQuerySelector('.singleSeries');
            const originalServers = safeQuerySelector('.serversList');

            if (!originalPlayer) {
                console.error('❌ Player element missing');
                document.body.classList.remove(UNIQUE_PREFIX + 'active');
                return;
            }

            // 3. Create New Structure
            const mainContainer = document.createElement('div');
            mainContainer.className = UNIQUE_PREFIX + 'main-container';

            const heroSection = document.createElement('div');
            heroSection.className = UNIQUE_PREFIX + 'hero';

            // Back Button
            const backBtn = document.createElement('div');
            backBtn.className = UNIQUE_PREFIX + 'return-nav';
            backBtn.innerHTML = '<span class="' + UNIQUE_PREFIX + 'back-icon">&#10095;</span> <span>رجوع</span>';
            backBtn.onclick = () => window.history.back();
            heroSection.appendChild(backBtn);

            // Background Poster
            let posterUrl = '';
            if (originalHero) {
                const coverImg = originalHero.querySelector('.cover .img');
                if (coverImg) {
                    posterUrl = window.getComputedStyle(coverImg).backgroundImage;
                }
            }

            const heroPoster = document.createElement('div');
            heroPoster.className = UNIQUE_PREFIX + 'poster-bg';
            if (posterUrl) {
                heroPoster.style.backgroundImage = posterUrl;
            }
            heroSection.appendChild(heroPoster);

            // Content Wrapper
            const contentWrapper = document.createElement('div');
            contentWrapper.className = UNIQUE_PREFIX + 'content-wrapper';

            // Info Section
            const infoSection = document.createElement('div');
            infoSection.className = UNIQUE_PREFIX + 'info';

            if (originalHero) {
                const title = originalHero.querySelector('.info h1');
                const story = originalHero.querySelector('.info .story');

                if (title) {
                    const newTitle = document.createElement('h1');
                    newTitle.className = UNIQUE_PREFIX + 'title';
                    newTitle.textContent = title.textContent;
                    infoSection.appendChild(newTitle);
                }

                if (story) {
                    const newStory = document.createElement('div');
                    newStory.className = UNIQUE_PREFIX + 'story';
                    newStory.textContent = story.textContent;
                    infoSection.appendChild(newStory);
                }
            }
            contentWrapper.appendChild(infoSection);

            // Servers Section
            if (originalServers) {
                const serversSection = document.createElement('div');
                serversSection.className = UNIQUE_PREFIX + 'servers-container';

                const serversLabel = document.createElement('h3');
                serversLabel.className = UNIQUE_PREFIX + 'servers-label';
                serversLabel.textContent = 'مصادر المشاهدة';
                serversSection.appendChild(serversLabel);

                originalServers.classList.add(UNIQUE_PREFIX + 'servers-list');
                serversSection.appendChild(originalServers);

                contentWrapper.appendChild(serversSection);
            }

            // Player Section
            const playerSection = document.createElement('div');
            playerSection.className = UNIQUE_PREFIX + 'player-container';
            playerSection.appendChild(originalPlayer);
            contentWrapper.appendChild(playerSection);

            // Assemble
            heroSection.appendChild(contentWrapper);
            mainContainer.appendChild(heroSection);

            // 4. Inject into DOM
            if (document.body.firstChild) {
                document.body.insertBefore(mainContainer, document.body.firstChild);
            } else {
                document.body.appendChild(mainContainer);
            }

            // 5. Mark as Ready
            document.body.classList.add(UNIQUE_PREFIX + 'ready');

            // Hide   Header
            const Header = safeQuerySelector('#mjeed-header');
            if (Header) {
                Header.style.display = 'none';
            }

            console.log('✅   Watch Page: Setup Complete');

        } catch (error) {
            console.error('❌ Watch Page Init Error:', error);
            document.body.classList.remove(UNIQUE_PREFIX + 'active');
        }
    }

    // Run
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWatchPage);
    } else {
        initWatchPage();
    }

    // SPA Navigation & Content Loading Support
    let lastUrl = location.href;
    let retryCount = 0;
    const MAX_RETRIES = 20;
    let initTimeout = null;

    new MutationObserver(() => {
        const url = location.href;
        const isWatchUrl = url.includes('/watch');

        if (url !== lastUrl) {
            lastUrl = url;
            console.log('🔄 URL changed to:', url);
            retryCount = 0;
            setTimeout(initWatchPage, 500);
        } else if (isWatchUrl && !document.querySelector('.' + UNIQUE_PREFIX + 'main-container')) {
            if (retryCount < MAX_RETRIES) {
                const hasPlayer = document.querySelector('.getEmbed') || document.querySelector('.modern-player-container');
                if (hasPlayer) {
                    if (!initTimeout) {
                        initTimeout = setTimeout(() => {
                            initWatchPage();
                            retryCount++;
                            initTimeout = null;
                        }, 200);
                    }
                }
            }
        }
    }).observe(document, { subtree: true, childList: true });
})();
