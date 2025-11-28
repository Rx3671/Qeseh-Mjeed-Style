/*
 * Series Page Netflix Style - Fixed Version with Chrome Storage Sync
 */

(function () {
    'use strict';

    console.log('🎬 Netflix Series Page Script Started');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 50);
    }

    function init() {
        const isSinglePost = document.body.classList.contains('single-post');
        const hasSeriesInfo = document.querySelector('.singleSeries');
        const isSeriesUrl = window.location.href.includes('/series/');
        const isMoviesUrl = window.location.href.includes('/movies/');

        if (isMoviesUrl) {
            console.log('❌ Movie page detected, skipping series script');
            return;
        }

        if (document.body.innerText.includes('هذه الصفحة طوت فصلها الأخير')) {
            console.log('⚠️ Page turned its last chapter detected');
            checkAndFixUrl();
            return;
        }

        if (!isSinglePost && !hasSeriesInfo && !isSeriesUrl) {
            console.log('❌ Not a series page');
            return;
        }

        console.log('✅ Series page detected!');

        setTimeout(() => {
            try {
                transformPage();
            } catch (error) {
                console.error('❌ Transform error:', error);
                // restoreOriginalContent(); // Disabled to prevent reverting on minor errors
            }
        }, 200);
    }

    function transformPage() {
        console.log('🔄 Starting page transformation...');

        const pageData = extractPageData();
        console.log('📊 Extracted data:', pageData);

        createHeroSection(pageData);
        createEpisodesSection();
        highlightCurrentEpisode(pageData.currentEpisode);
        syncMyListButton();
        addAnimationStyles();

        console.log('✅ Page transformation complete!');
    }

    function highlightCurrentEpisode(currentEpisode) {
        if (!currentEpisode) return;
        const posts = document.querySelectorAll('.block-post');
        posts.forEach(post => {
            const link = post.querySelector('a');
            if (link) {
                // Check for exact episode match at end of URL
                const match = link.href.match(/-(\d+)\/?$/);
                if (match && parseInt(match[1]) === currentEpisode) {
                    post.classList.add('active-episode');
                }
            }
        });
    }

    // ========== EXTRACT PAGE DATA ========== 
    function extractPageData() {
        const data = {
            title: '',
            story: '',
            cast: '',
            posterImage: '',
            seriesUrl: '',
            watchUrl: '',
            firstEpisodeUrl: ''
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
                    data.seriesUrl = extractSeriesUrl(titleEl.href);
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
            // Fallback for pages without .singleSeries (like /series/ pages)
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

        // Fallback for title
        if (!data.title) {
            const h1 = document.querySelector('.singleInfo h1') || document.querySelector('h1');
            if (h1) {
                data.title = h1.textContent.trim();
            }
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

        // Get series URL from current page if not found
        if (!data.seriesUrl) {
            data.seriesUrl = extractSeriesUrl(window.location.href);
        }

        // Extract Current Episode Number
        const urlMatch = window.location.href.match(/-(\d+)\/?$/);
        if (urlMatch) {
            data.currentEpisode = parseInt(urlMatch[1], 10);
        }

        // Extract Total Episodes and First Episode URL
        const secLine = document.querySelector('.sec-line');
        if (secLine) {
            data.totalEpisodes = secLine.querySelectorAll('.block-post').length;
            const allPosts = secLine.querySelectorAll('.block-post a');
            if (allPosts.length > 0) {
                // Get the last episode in the list (usually Episode 1)
                data.firstEpisodeUrl = allPosts[allPosts.length - 1].href;
            }
        }

        return data;
    }

    // ========== CREATE NEXT EPISODE BUTTON ==========
    function createNextEpisodeButton(currentEpisode, totalEpisodes, explicitUrl = null) {
        const button = document.createElement('a');
        button.className = 'mjeed-next-btn';

        if (explicitUrl) {
            // Case: Main series page or explicit link provided
            button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <span>بدء المشاهدة</span>
            `;
            button.href = explicitUrl;
            return button;
        }

        const isLastEpisode = currentEpisode >= totalEpisodes;

        if (isLastEpisode) {
            button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                <span>الحلقة الأخيرة</span>
            `;
            button.classList.add('disabled');
            button.removeAttribute('href');
        } else {
            button.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                </svg>
                <span>الحلقة التالية</span>
            `;

            // Generate Next Episode URL
            const nextEpisode = currentEpisode + 1;
            const currentUrl = window.location.href;
            // Replace the last number in the URL
            const nextUrl = currentUrl.replace(/-(\d+)\/?$/, `-${nextEpisode}/`);
            button.href = nextUrl;
        }

        return button;
    }

    // ========== CREATE HERO SECTION ========== 
    function createHeroSection(data) {
        console.log('🎨 Creating hero section...');

        const existingHero = document.getElementById('mjeed-series-hero');
        if (existingHero) {
            existingHero.remove();
        }

        const hero = document.createElement('div');
        hero.id = 'mjeed-series-hero';
        hero.className = 'mjeed-series-hero';

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
            titleEl.className = 'mjeed-series-title';
            titleEl.textContent = data.title;
            content.appendChild(titleEl);
        }

        // Story
        if (data.story) {
            const storyEl = document.createElement('div');
            storyEl.className = 'mjeed-series-story';
            storyEl.textContent = data.story;
            content.appendChild(storyEl);
        }

        // Cast
        if (data.cast) {
            const castEl = document.createElement('div');
            castEl.className = 'mjeed-series-cast';
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

        if (!data.watchUrl) {
            playBtn.onclick = (e) => {
                e.preventDefault();
                scrollToEpisodes();
            };
        }

        buttons.appendChild(playBtn);

        // My List Button
        const myListBtn = createMyListButton(data.seriesUrl, data.title, data.posterImage);
        buttons.appendChild(myListBtn);

        // Next Episode Button
        if (data.currentEpisode && data.totalEpisodes) {
            const nextEpBtn = createNextEpisodeButton(data.currentEpisode, data.totalEpisodes);
            buttons.appendChild(nextEpBtn);
        } else if (data.firstEpisodeUrl) {
            // Show "Start Watching" if on main series page
            const nextEpBtn = createNextEpisodeButton(null, null, data.firstEpisodeUrl);
            buttons.appendChild(nextEpBtn);
        }

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
    function createMyListButton(seriesUrl, title, posterImage) {
        const button = document.createElement('button');
        button.className = 'mjeed-mylist-btn';
        button.setAttribute('data-series-url', seriesUrl);
        button.setAttribute('data-series-title', title);

        // Initialize state asynchronously
        chrome.storage.sync.get(['qesehFavorites'], (result) => {
            const favorites = result.qesehFavorites || [];
            const isInList = favorites.some(fav =>
                fav.seriesUrl === seriesUrl ||
                (fav.title || '').trim() === (title || '').trim()
            );
            updateButtonState(button, isInList);
        });

        button.onclick = () => {
            toggleFavorite(seriesUrl, title, posterImage, button);
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
    function toggleFavorite(seriesUrl, title, posterImage, button) {
        chrome.storage.sync.get(['qesehFavorites'], (result) => {
            let favorites = result.qesehFavorites || [];

            // Match by URL OR Title
            const index = favorites.findIndex(fav =>
                fav.seriesUrl === seriesUrl ||
                (fav.title || '').trim() === (title || '').trim()
            );

            if (index > -1) {
                // Remove from favorites
                favorites.splice(index, 1);
                updateButtonState(button, false);
                showNotification('تم الإزالة من قائمتي', 'mjeed-tv');
                console.log('❌ Removed from My List:', title);
            } else {
                // Add to favorites
                const newFavorite = {
                    seriesUrl: seriesUrl,
                    title: title,
                    posterImage: posterImage,
                    addedAt: new Date().toISOString()
                };
                favorites.push(newFavorite);
                updateButtonState(button, true);
                showNotification('تمت الإضافة إلى قائمتي', 'mjeed-tv-success');
                console.log('✅ Added to My List:', newFavorite);
            }

            chrome.storage.sync.set({ qesehFavorites: favorites }, () => {
                console.log('💾 Favorites saved to Chrome Storage');
            });
        });
    }

    // ========== CREATE EPISODES SECTION ========== 
    function createEpisodesSection() {
        console.log('📺 Creating episodes section...');

        const secLine = document.querySelector('.sec-line');
        if (!secLine) {
            console.log('❌ .sec-line not found');
            return;
        }
        secLine.classList.add('mjeed-series-content');

        // البحث عن الحلقات
        const episodes = Array.from(secLine.querySelectorAll('.block-post'));
        if (episodes.length === 0) {
            console.log('❌ No episodes found');
            return;
        }

        console.log(`✅ Found ${episodes.length} episodes`);

        // إنشاء style tag مخصص لإجبار الظهور
        const forceStyleTag = document.createElement('style');
        forceStyleTag.id = 'mjeed-force-visibility';
        forceStyleTag.textContent = `
            .mjeed-episodes-grid { display: grid !important; }
            .mjeed-episode-card { display: block !important; visibility: visible !important; }
            .mjeed-episode-card .block-post { display: block !important; visibility: visible !important; opacity: 1 !important; background: #1a1a1a !important; border-radius: 8px !important; overflow: hidden !important; }
            .mjeed-episode-card .block-post > a { display: block !important; visibility: visible !important; opacity: 1 !important; }
            .mjeed-episode-card .poster { display: block !important; visibility: visible !important; width: 100% !important; height: 0 !important; padding-bottom: 150% !important; position: relative !important; background: #000 !important; }
            .mjeed-episode-card .imgSer { display: block !important; visibility: visible !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; background-size: cover !important; background-position: center !important; }
            .mjeed-episode-card .episodeNum { display: flex !important; visibility: visible !important; position: absolute !important; top: 10px !important; right: 10px !important; z-index: 10 !important; background: rgba(0,0,0,0.8) !important; padding: 8px 12px !important; border-radius: 6px !important; flex-direction: column !important; align-items: center !important; }
            .mjeed-episode-card .episodeNum span { display: block !important; color: white !important; font-size: 14px !important; font-weight: bold !important; }
            .mjeed-episode-card .title { display: block !important; visibility: visible !important; padding: 12px !important; background: #181818 !important; color: #e5e5e5 !important; font-size: 14px !important; text-align: right !important; }
        `;
        document.head.appendChild(forceStyleTag);

        const section = document.createElement('div');
        section.className = 'mjeed-episodes-section';

        const header = document.createElement('h2');
        header.className = 'mjeed-episodes-header';
        header.textContent = 'الحلقات';
        section.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'mjeed-episodes-grid';

        episodes.forEach((blockPost, index) => {
            const card = document.createElement('div');
            card.className = 'mjeed-episode-card';

            // قراءة البيانات من العنصر الأصلي
            const link = blockPost.querySelector('a');
            const originalImgSer = blockPost.querySelector('.imgSer');
            const episodeNumEl = blockPost.querySelector('.episodeNum');
            const titleEl = blockPost.querySelector('.title');

            const href = link ? link.href : '#';
            const title = titleEl ? titleEl.textContent.trim() : '';
            const bgImage = originalImgSer ? window.getComputedStyle(originalImgSer).backgroundImage : '';

            let imageUrl = '';
            if (bgImage && bgImage !== 'none') {
                const match = bgImage.match(/url\(["']?(.+?)["']?\)/);
                if (match && match[1]) {
                    imageUrl = match[1];
                }
            }

            let episodeNumber = '';
            if (episodeNumEl) {
                const spans = episodeNumEl.querySelectorAll('span');
                if (spans.length > 1) {
                    episodeNumber = spans[1].textContent.trim();
                }
            }

            // بناء HTML من الصفر - استخدام imgSer بدلاً من imgBg
            card.innerHTML = `
                <div class="block-post">
                    <a href="${href}">
                        <div class="poster">
                            <div class="imgSer" style="background-image:url(${imageUrl});"></div>
                            ${episodeNumber ? `
                            <div class="episodeNum">
                                <span>${episodeNumber}</span>
                            </div>` : ''}
                        </div>
                        <div class="title">
                            <div>${title}</div>
                            <div class="watch-btn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                                <span>مشاهدة</span>
                            </div>
                        </div>
                    </a>
                </div>
            `;

            card.style.animationDelay = `${index * 0.05}s`;
            grid.appendChild(card);
        });

        section.appendChild(grid);

        console.log('Clearing old content...');
        secLine.innerHTML = '';
        secLine.appendChild(section);

        console.log('✅ Episodes section created and injected');
    }

    // ========== SCROLL TO EPISODES ========== 
    function scrollToEpisodes() {
        const episodesSection = document.querySelector('.mjeed-episodes-section');
        if (episodesSection) {
            const headerHeight = document.querySelector('#headerNav')?.offsetHeight || 0;
            const yOffset = -headerHeight - 20;
            const y = episodesSection.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });
        }
    }

    // ========== SHOW NOTIFICATION ========== 
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');

        // Apple TV Style Notification
        if (type === 'mjeed-tv' || type === 'mjeed-tv-success') {
            const icon = type === 'mjeed-tv-success' ? '✓' : '✕';
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
                    background: ${type === 'mjeed-tv-success' ? '#34c759' : '#ff3b30'}; 
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

        const title = button.getAttribute('data-series-title');
        const seriesUrl = button.getAttribute('data-series-url');

        if (!title && !seriesUrl) return;

        chrome.storage.sync.get(['qesehFavorites'], (result) => {
            const favorites = result.qesehFavorites || [];
            const isInList = favorites.some(fav =>
                (seriesUrl && fav.seriesUrl === seriesUrl) ||
                (title && (fav.title || '').trim() === (title || '').trim())
            );

            console.log('🔄 Syncing My List button:', {
                title: title,
                seriesUrl: seriesUrl,
                isInList: isInList
            });

            updateButtonState(button, isInList);
        });
    }

    // مراقبة التغييرات في Chrome Storage
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

    // ========== URL FIX LOGIC ==========
    function checkAndFixUrl() {
        const currentUrl = window.location.href;
        const decodedUrl = decodeURI(currentUrl);

        // Specific fix for "This Sea Will Overflow"
        // Incorrect: مسلسل-هذا-البحر-سيفيض
        // Correct: هذا-البحر-سوف-يفيض
        if (decodedUrl.includes('مسلسل-هذا-البحر-سيفيض')) {
            const newUrl = decodedUrl.replace('مسلسل-هذا-البحر-سيفيض', 'هذا-البحر-سوف-يفيض');
            createFixButton(newUrl);
        }
    }

    function createFixButton(newUrl) {
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            text-align: center;
            background: rgba(0, 0, 0, 0.8);
            padding: 40px;
            border-radius: 16px;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;

        const title = document.createElement('h2');
        title.textContent = 'رابط الحلقة غير صحيح';
        title.style.cssText = 'color: white; margin-bottom: 20px; font-size: 24px;';
        container.appendChild(title);

        const btn = document.createElement('a');
        btn.href = newUrl;
        btn.className = 'mjeed-play-btn';
        // Remove conflicting inline styles to match standard buttons
        btn.style.cssText = `
            margin-top: 10px !important;
            text-decoration: none !important;
        `;
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
            </svg>
            <span>إصلاح الرابط والمشاهدة</span>
        `;

        container.appendChild(btn);
        document.body.appendChild(container);
    }

})();
