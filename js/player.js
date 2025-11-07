
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
    
    // Add to watchlist button
    const addToWatchlistBtn = document.getElementById('addToWatchlistBtn');
    addToWatchlistBtn?.addEventListener('click', async function() {
        const title = document.getElementById('videoTitle')?.textContent || 'Unknown';
        const posterElement = document.querySelector('.movie-poster-small img');
        const poster = posterElement ? posterElement.src : '';
        
        await addToWatchlist(id, type, title, poster);
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
    
    const moviePoster = document.getElementById('moviePoster');
    const movieTitle = document.getElementById('movieTitle');
    const movieYear = document.getElementById('movieYear');
    const movieRating = document.getElementById('movieRating');
    const movieDescription = document.getElementById('movieDescription');
    const movieGenres = document.getElementById('movieGenres');
    const movieCast = document.getElementById('movieCast');
    
    try {
        let details;
        if (type === 'movie') {
            const embedUrl = getVideasyEmbedUrl(id, 'movie');
            videoWrapper.innerHTML = `<iframe 
                src="${embedUrl}" 
                frameborder="0" 
                allowfullscreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="origin"
                scrolling="no"
                style="border: none;"></iframe>`;
            
            try {
                details = await getMovieDetails(id);
                console.log('Movie details:', details);
                
                if (details) {
                    const title = details.title || 'Unknown Title';
                    const year = details.release_date ? details.release_date.substring(0, 4) : 'N/A';
                    const rating = details.vote_average ? `⭐ ${details.vote_average.toFixed(1)}` : 'N/A';
                    
                    videoTitle.textContent = title;
                    movieTitle.textContent = title;
                    movieYear.textContent = year;
                    movieRating.textContent = rating;
                    movieDescription.textContent = details.overview || 'No description available.';
                    
                    if (details.poster_path) {
                        moviePoster.src = getTMDBImageUrl(details.poster_path, 'w500');
                    } else {
                        moviePoster.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="150"%3E%3Crect fill="%231f1f1f" width="100" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }
                    
                    if (details.genres && details.genres.length > 0) {
                        movieGenres.innerHTML = details.genres.map(g => 
                            `<span class="genre-tag">${g.name}</span>`
                        ).join('');
                    } else {
                        movieGenres.innerHTML = '<span class="genre-tag">N/A</span>';
                    }
                    
                    await loadMovieCast(id);
                    await loadRecommendations(id, 'movie');
                    
                    addToWatchHistory({
                        id: details.id,
                        type: 'movie',
                        title: details.title,
                        poster: getTMDBImageUrl(details.poster_path)
                    });
                }
            } catch (apiError) {
                console.warn('Could not load movie details from TMDB:', apiError);
                videoTitle.textContent = 'Movie Player';
                movieTitle.textContent = 'Movie Player';
                movieDescription.textContent = 'Enjoy your movie!';
                movieGenres.innerHTML = '<span class="genre-tag">Movie</span>';
                movieCast.innerHTML = '<div class="loading">Details not available</div>';
                if (recommendedSlider) {
                    recommendedSlider.innerHTML = '<div class="loading">Recommendations not available</div>';
                }
            }
        } else if (type === 'tv') {
            const embedUrl = getVideasyEmbedUrl(id, 'tv');
            videoWrapper.innerHTML = `<iframe 
                src="${embedUrl}" 
                frameborder="0" 
                allowfullscreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="origin"
                scrolling="no"
                style="border: none;"></iframe>`;
            
            try {
                details = await getTVShowDetails(id);
                console.log('TV show details:', details);
                
                if (details) {
                    const title = details.name || 'Unknown Title';
                    const year = details.first_air_date ? details.first_air_date.substring(0, 4) : 'N/A';
                    const rating = details.vote_average ? `⭐ ${details.vote_average.toFixed(1)}` : 'N/A';
                    
                    videoTitle.textContent = title;
                    movieTitle.textContent = title;
                    movieYear.textContent = year;
                    movieRating.textContent = rating;
                    movieDescription.textContent = details.overview || 'No description available.';
                    
                    if (details.poster_path) {
                        moviePoster.src = getTMDBImageUrl(details.poster_path, 'w500');
                    } else {
                        moviePoster.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="150"%3E%3Crect fill="%231f1f1f" width="100" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }
                    
                    if (details.genres && details.genres.length > 0) {
                        movieGenres.innerHTML = details.genres.map(g => 
                            `<span class="genre-tag">${g.name}</span>`
                        ).join('');
                    } else {
                        movieGenres.innerHTML = '<span class="genre-tag">N/A</span>';
                    }
                    
                    await loadMovieCast(id, 'tv');
                    await loadRecommendations(id, 'tv');
                    
                    addToWatchHistory({
                        id: details.id,
                        type: 'tv',
                        title: details.name,
                        poster: getTMDBImageUrl(details.poster_path)
                    });
                }
            } catch (apiError) {
                console.warn('Could not load TV show details from TMDB:', apiError);
                videoTitle.textContent = 'TV Show Player';
                movieTitle.textContent = 'TV Show Player';
                movieDescription.textContent = 'Enjoy your show!';
                movieGenres.innerHTML = '<span class="genre-tag">TV Show</span>';
                movieCast.innerHTML = '<div class="loading">Details not available</div>';
                if (recommendedSlider) {
                    recommendedSlider.innerHTML = '<div class="loading">Recommendations not available</div>';
                }
            }
        } else if (type === 'anime') {
            const embedUrl = getVideasyEmbedUrl(id, 'anime');
            videoWrapper.innerHTML = `<iframe 
                src="${embedUrl}" 
                frameborder="0" 
                allowfullscreen 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="origin"
                scrolling="no"
                style="border: none;"></iframe>`;
            
            videoTitle.textContent = 'Anime Player';
            movieTitle.textContent = 'Anime Player';
            movieDescription.textContent = 'Enjoy your anime!';
            movieGenres.innerHTML = '<span class="genre-tag">Anime</span>';
            movieCast.innerHTML = '<div class="loading">Cast information not available</div>';
            if (recommendedSlider) {
                recommendedSlider.innerHTML = '<div class="loading">Recommendations not available</div>';
            }
        }
    } catch (error) {
        console.error('Error loading video:', error);
        videoWrapper.innerHTML = '<div class="loading">Failed to load video. Please try again later.</div>';
    }
}

async function loadMovieCast(id, type = 'movie') {
    const movieCast = document.getElementById('movieCast');
    
    try {
        const endpoint = type === 'movie' ? `/movie/${id}/credits` : `/tv/${id}/credits`;
        const data = await fetchTMDB(endpoint);
        
        if (data && data.cast && data.cast.length > 0) {
            const topCast = data.cast.slice(0, 6);
            movieCast.innerHTML = topCast.map(member => `
                <div class="cast-item">
                    <div class="cast-photo">
                        <img src="${member.profile_path ? getTMDBImageUrl(member.profile_path, 'w185') : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="45" height="45"%3E%3Crect fill="%231f1f1f" width="45" height="45"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23666"%3E?%3C/text%3E%3C/svg%3E'}" alt="${member.name}">
                    </div>
                    <div class="cast-name">${member.name}</div>
                </div>
            `).join('');
        } else {
            movieCast.innerHTML = '<div class="loading">No cast information available</div>';
        }
    } catch (error) {
        console.error('Error loading cast:', error);
        movieCast.innerHTML = '<div class="loading">Failed to load cast</div>';
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

async function checkIfInWatchlist(id, type) {
    const user = getCurrentUser();
    if (!user) return;
    
    const API_BASE = window.location.origin.replace(':5000', ':5001');
    
    try {
        const response = await fetch(`${API_BASE}/api/watchlist/${user.id}`);
        const watchlist = await response.json();
        const isInWatchlist = watchlist.some(item => item.item_id == id && item.item_type === type);
        
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
    } catch (error) {
        console.error('Check watchlist error:', error);
    }
}

async function addToWatchlist(id, type, title, poster) {
    const user = getCurrentUser();
    if (!user) {
        alert('Please login to add to watchlist');
        return;
    }
    
    const API_BASE = window.location.origin.replace(':5000', ':5001');
    const addToWatchlistBtn = document.getElementById('addToWatchlistBtn');
    
    try {
        const checkResponse = await fetch(`${API_BASE}/api/watchlist/${user.id}`);
        const watchlist = await checkResponse.json();
        const exists = watchlist.find(item => item.item_id == id && item.item_type === type);
        
        if (!exists) {
            await fetch(`${API_BASE}/api/watchlist/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, title, poster })
            });
            
            if (addToWatchlistBtn) {
                addToWatchlistBtn.classList.add('added');
                addToWatchlistBtn.innerHTML = `
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Added to Watchlist
                `;
            }
        } else {
            await fetch(`${API_BASE}/api/watchlist/${user.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type })
            });
            
            if (addToWatchlistBtn) {
                addToWatchlistBtn.classList.remove('added');
                addToWatchlistBtn.innerHTML = `
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Add to Watchlist
                `;
            }
    }
}
