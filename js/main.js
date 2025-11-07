let currentSlide = 0;
let slideshowMovies = [];
let slideshowInterval;

let currentPage = 1;
const cardsPerPage = 20;

document.addEventListener('DOMContentLoaded', async function() {
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
        return;
    }

    const user = getCurrentUser();
    if (user) {
        const userActions = document.getElementById('userActions');
        const userMenu = document.getElementById('userMenu');
        if (userActions) userActions.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
    }

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
            window.location.href = 'login.html';
        });
    }

    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        await loadHomepage();
    }
});

async function loadHomepage() {
    try {
        const trendingMovies = await getTrendingMovies();
        if (trendingMovies && trendingMovies.results && trendingMovies.results.length > 0) {
            slideshowMovies = trendingMovies.results.slice(0, 5);
            initializeSlideshow();
        }

        await Promise.all([
            loadContentRow('trendingMovies', getTrendingMovies(), 'movie'),
            loadContentRow('popularTV', getPopularTVShows(), 'tv'),
            loadContentRow('trendingAnime', getTrendingAnime(), 'anime')
        ]);

    } catch (error) {
        console.error('Error loading homepage:', error);
    }
}

function initializeSlideshow() {
    const container = document.getElementById('slideshowContainer');

    if (!container) return;

    container.innerHTML = '';

    slideshowMovies.forEach((movie, index) => {
        const slide = createSlide(movie, index);
        container.appendChild(slide);
    });

    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');

    if (prevBtn) prevBtn.addEventListener('click', previousSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    startAutoSlide();
}

function createSlide(movie, index) {
    const slide = document.createElement('div');
    slide.className = index === 0 ? 'slide active' : 'slide';
    slide.dataset.index = index;

    const backdropUrl = getTMDBImageUrl(movie.backdrop_path, 'original');
    slide.style.backgroundImage = `url('${backdropUrl}')`;

    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const year = movie.release_date ? movie.release_date.substring(0, 4) : '';
    const posterUrl = getTMDBImageUrl(movie.poster_path, 'w500');

    const ratingColor = getRatingColor(movie.vote_average);
    slide.style.setProperty('--theme-color', ratingColor);

    slide.innerHTML = `
        <div class="slide-overlay"></div>
        <div class="slide-content">
            <h1 class="slide-title">${movie.title || movie.name}</h1>
            <div class="slide-meta">
                <span class="rating-badge">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    ${rating}
                </span>
                <span>${year}</span>
                <span>MOVIE</span>
            </div>
            <p class="slide-description">${movie.overview || 'Discover unlimited entertainment'}</p>
            <div class="slide-buttons">
                <button class="play-btn" onclick="window.location.href='player.html?id=${movie.id}&type=movie'">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    Watch Now
                </button>
                <button class="add-btn" onclick="addToWatchlist(${movie.id}, 'movie', '${(movie.title || '').replace(/'/g, "\\'")}', '${movie.poster_path || ''}')">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Add to List
                </button>
            </div>
        </div>
        <div class="slide-poster">
            <img src="${posterUrl}" alt="${movie.title || movie.name}">
        </div>
    `;

    return slide;
}

function getRatingColor(rating) {
    if (!rating) return '#44BB91';
    if (rating >= 8) return '#00ff88';
    if (rating >= 7) return '#44BB91';
    if (rating >= 6) return '#ffaa00';
    if (rating >= 5) return '#ff7700';
    return '#ff4444';
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');

    slides[currentSlide].classList.add('slide-exit');
    slides[currentSlide].classList.remove('active');

    setTimeout(() => {
        slides[currentSlide].classList.remove('slide-exit');
    }, 800);

    currentSlide = index;

    slides[currentSlide].classList.add('active');

    resetAutoSlide();
}

function nextSlide() {
    const nextIndex = (currentSlide + 1) % slideshowMovies.length;
    goToSlide(nextIndex);
}

function previousSlide() {
    const prevIndex = (currentSlide - 1 + slideshowMovies.length) % slideshowMovies.length;
    goToSlide(prevIndex);
}

function startAutoSlide() {
    slideshowInterval = setInterval(nextSlide, 4000);
}

function resetAutoSlide() {
    clearInterval(slideshowInterval);
    startAutoSlide();
}

function stopAutoSlide() {
    clearInterval(slideshowInterval);
}

async function loadContentRow(elementId, dataPromise, type) {
    const container = document.getElementById(elementId);
    if (!container) return;

    try {
        let data;
        if (type === 'anime') {
            data = await dataPromise;
        } else {
            const response = await dataPromise;
            data = response ? response.results : [];
        }

        if (data && data.length > 0) {
            container.innerHTML = '';
            data.slice(0, 20).forEach(item => {
                container.appendChild(createContentCard(item, type));
            });
        } else {
            container.innerHTML = '<p class="empty-message">No content available</p>';
        }
    } catch (error) {
        console.error(`Error loading ${elementId}:`, error);
        container.innerHTML = '<p class="empty-message">Failed to load content</p>';
    }
}

async function addToWatchlist(id, type, title, poster) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login to add to watchlist');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/watchlist/${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, type, title, poster })
        });

        if (response.ok) {
            alert('Added to watchlist!');
        } else {
            alert('Already in watchlist!');
        }
    } catch (error) {
        console.error('Add to watchlist error:', error);
        alert('Failed to add to watchlist');
    }
}


async function toggleWatchlist(itemId, itemType, title, poster) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login to use the watchlist');
        return;
    }

    try {
        const inWatchlist = await isInWatchlist(itemId, itemType);

        if (inWatchlist) {
            await fetch(`${API_BASE_URL}/api/watchlist/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: itemId,
                    type: itemType
                })
            });
            alert('Removed from watchlist');
        } else {
            await fetch(`${API_BASE_URL}/api/watchlist/${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: itemId,
                    type: itemType,
                    title: title,
                    poster: poster
                })
            });
            alert('Added to watchlist');
        }
    } catch (error) {
        console.error('Error toggling watchlist:', error);
    }
}

async function isInWatchlist(itemId, itemType) {
    const user = getCurrentUser();
    if (!user) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/api/watchlist/${user.id}`);
        const watchlist = await response.json();
        return watchlist.some(item => item.item_id === itemId && item.item_type === itemType);
    } catch (error) {
        console.error('Error checking watchlist:', error);
        return false;
    }
}

function createContentCard(item, type) {
    const card = document.createElement('div');
    card.className = 'content-card';
    
    let poster, title, rating, year;
    
    if (type === 'anime') {
        poster = item.image || item.coverImage?.large || '';
        title = item.title?.english || item.title?.romaji || 'Unknown';
        rating = item.averageScore ? (item.averageScore / 10).toFixed(1) : 'N/A';
        year = item.seasonYear || '';
    } else {
        poster = getTMDBImageUrl(item.poster_path, 'w500');
        title = item.title || item.name || 'Unknown';
        rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
        year = item.release_date ? item.release_date.substring(0, 4) : (item.first_air_date ? item.first_air_date.substring(0, 4) : '');
    }
    
    const ratingColor = getRatingColor(parseFloat(rating));
    
    card.innerHTML = `
        <img src="${poster}" alt="${title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27300%27%3E%3Crect fill=%27%231f1f1f%27 width=%27200%27 height=%27300%27/%3E%3C/svg%3E'">
        <div class="card-overlay">
            <h3>${title}</h3>
            <div class="card-info">
                <span class="rating" style="color: ${ratingColor}">★ ${rating}</span>
                ${year ? `<span>${year}</span>` : ''}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `player.html?id=${item.id}&type=${type}`;
    });
    
    return card;
}

function getTMDBImageUrl(path, size = 'w500') {
    if (!path) return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27300%27%3E%3Crect fill=%27%231f1f1f%27 width=%27200%27 height=%27300%27/%3E%3C/svg%3E';
    return `https://image.tmdb.org/t/p/${size}${path}`;
}