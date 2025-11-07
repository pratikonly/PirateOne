
document.addEventListener('DOMContentLoaded', async function() {
    checkAuth();
    
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');
    
    if (!id || !type) {
        alert('Invalid video');
        window.location.href = 'index.html';
        return;
    }
    
    await loadVideo(id, type);
    
    // Toggle sidebar
    const toggleBtn = document.getElementById('toggleInfoBtn');
    const sidebar = document.getElementById('playerSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sidebar.classList.toggle('hidden');
        });
    }
    
    if (closeSidebarBtn && sidebar) {
        closeSidebarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sidebar.classList.add('hidden');
        });
    }
    
    // Add to watchlist
    const addToWatchlistBtn = document.getElementById('addToWatchlistBtn');
    addToWatchlistBtn?.addEventListener('click', function() {
        const title = document.getElementById('videoTitle').textContent;
        
        addToWatchlist({
            id: id,
            type: type,
            title: title,
            poster: ''
        });
        
        addToWatchlistBtn.classList.add('added');
        addToWatchlistBtn.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Added to Watchlist
        `;
    });
    
    // Share button
    const shareBtn = document.getElementById('shareBtn');
    shareBtn?.addEventListener('click', function() {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: document.getElementById('videoTitle').textContent,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    });
    
    // Check if already in watchlist
    checkIfInWatchlist(id, type);
});

async function loadVideo(id, type) {
    const videoWrapper = document.getElementById('videoWrapper');
    const videoTitle = document.getElementById('videoTitle');
    const recommendedSlider = document.getElementById('recommendedSlider');
    
    try {
        let details;
        if (type === 'movie') {
            details = await getMovieDetails(id);
            const embedUrl = getVideasyEmbedUrl(id, 'movie');
            videoWrapper.innerHTML = `<iframe 
                src="${embedUrl}" 
                frameborder="0" 
                allowfullscreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="no-referrer-when-downgrade"
                scrolling="no"></iframe>`;
            
            if (details) {
                const title = details.title;
                videoTitle.textContent = title;
                
                // Load recommendations
                await loadRecommendations(id, 'movie');
                
                addToWatchHistory({
                    id: details.id,
                    type: 'movie',
                    title: details.title,
                    poster: getTMDBImageUrl(details.poster_path)
                });
            }
        } else if (type === 'tv') {
            details = await getTVShowDetails(id);
            const embedUrl = getVideasyEmbedUrl(id, 'tv');
            videoWrapper.innerHTML = `<iframe 
                src="${embedUrl}" 
                frameborder="0" 
                allowfullscreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="no-referrer-when-downgrade"
                scrolling="no"></iframe>`;
            
            if (details) {
                const title = details.name;
                videoTitle.textContent = title;
                
                // Load recommendations
                await loadRecommendations(id, 'tv');
                
                addToWatchHistory({
                    id: details.id,
                    type: 'tv',
                    title: details.name,
                    poster: getTMDBImageUrl(details.poster_path)
                });
            }
        } else if (type === 'anime') {
            const embedUrl = getVideasyEmbedUrl(id, 'anime');
            videoWrapper.innerHTML = `<iframe 
                src="${embedUrl}" 
                frameborder="0" 
                allowfullscreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="no-referrer-when-downgrade"
                scrolling="no"></iframe>`;
            
            videoTitle.textContent = 'Anime Player';
            if (recommendedSlider) {
                recommendedSlider.innerHTML = '<div class="loading">Recommendations not available</div>';
            }
        }
    } catch (error) {
        console.error('Error loading video:', error);
        videoWrapper.innerHTML = '<div class="loading">Failed to load video. Please try again later.</div>';
    }
}

async function loadCast(id, type) {
    const sidebarCast = document.getElementById('sidebarCast');
    
    try {
        const endpoint = type === 'movie' ? `/movie/${id}/credits` : `/tv/${id}/credits`;
        const data = await fetchTMDB(endpoint);
        
        if (data && data.cast && data.cast.length > 0) {
            const topCast = data.cast.slice(0, 6);
            sidebarCast.innerHTML = topCast.map(member => `
                <div class="cast-member">
                    <div class="cast-avatar">
                        <img src="${member.profile_path ? getTMDBImageUrl(member.profile_path, 'w185') : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect fill="%231f1f1f" width="50" height="50"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23666"%3E?%3C/text%3E%3C/svg%3E'}" alt="${member.name}">
                    </div>
                    <div class="cast-info">
                        <div class="cast-name">${member.name}</div>
                        <div class="cast-character">${member.character || 'Unknown role'}</div>
                    </div>
                </div>
            `).join('');
        } else {
            sidebarCast.innerHTML = '<div class="loading">No cast information available</div>';
        }
    } catch (error) {
        console.error('Error loading cast:', error);
        sidebarCast.innerHTML = '<div class="loading">Failed to load cast</div>';
    }
}

async function loadRecommendations(id, type) {
    const recommendedSlider = document.getElementById('recommendedSlider');
    
    try {
        const endpoint = type === 'movie' ? `/movie/${id}/recommendations` : `/tv/${id}/recommendations`;
        const data = await fetchTMDB(endpoint);
        
        if (data && data.results && data.results.length > 0) {
            recommendedSlider.innerHTML = '';
            data.results.slice(0, 10).forEach(item => {
                recommendedSlider.appendChild(createContentCard(item, type));
            });
        } else {
            // Fallback to similar content
            const similarEndpoint = type === 'movie' ? `/movie/${id}/similar` : `/tv/${id}/similar`;
            const similarData = await fetchTMDB(similarEndpoint);
            
            if (similarData && similarData.results && similarData.results.length > 0) {
                recommendedSlider.innerHTML = '';
                similarData.results.slice(0, 10).forEach(item => {
                    recommendedSlider.appendChild(createContentCard(item, type));
                });
            } else {
                recommendedSlider.innerHTML = '<div class="loading">No recommendations available</div>';
            }
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
        recommendedSlider.innerHTML = '<div class="loading">Failed to load recommendations</div>';
    }
}

function checkIfInWatchlist(id, type) {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
    const isInWatchlist = watchlist.some(item => item.id == id && item.type === type);
    
    const addToWatchlistBtn = document.getElementById('addToWatchlistBtn');
    if (isInWatchlist && addToWatchlistBtn) {
        addToWatchlistBtn.classList.add('added');
        addToWatchlistBtn.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Added to Watchlist
        `;
    }
}
