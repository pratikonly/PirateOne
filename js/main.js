document.addEventListener('DOMContentLoaded', async function() {
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
        return;
    }
    
    checkAuth();
    
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
            const heroMovie = trendingMovies.results[0];
            updateHero(heroMovie);
            
            document.getElementById('playBtn').addEventListener('click', () => {
                window.location.href = `player.html?id=${heroMovie.id}&type=movie`;
            });
        }
        
        await Promise.all([
            loadContentRow('trendingMovies', getTrendingMovies(), 'movie'),
            loadContentRow('popularTV', getPopularTVShows(), 'tv'),
            loadContentRow('topRatedMovies', getTopRatedMovies(), 'movie'),
            loadContentRow('trendingAnime', getTrendingAnime(), 'anime'),
            loadContentRow('actionMovies', getMoviesByGenre(28), 'movie'),
            loadContentRow('comedyTV', getTVShowsByGenre(35), 'tv')
        ]);
        
    } catch (error) {
        console.error('Error loading homepage:', error);
    }
}

function updateHero(movie) {
    const heroTitle = document.getElementById('heroTitle');
    const heroDescription = document.getElementById('heroDescription');
    const hero = document.querySelector('.hero');
    
    if (heroTitle) heroTitle.textContent = movie.title || movie.name;
    if (heroDescription) heroDescription.textContent = movie.overview || 'Discover unlimited entertainment';
    
    if (hero && movie.backdrop_path) {
        hero.style.backgroundImage = `
            linear-gradient(rgba(0,0,0,0.4), rgba(20,20,20,1)),
            url('${getTMDBImageUrl(movie.backdrop_path, 'original')}')
        `;
    }
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
