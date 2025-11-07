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
    
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            setRating(rating);
            saveRating(id, type, rating);
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            highlightStars(rating);
        });
    });
    
    document.querySelector('.stars-input').addEventListener('mouseleave', function() {
        const currentRating = getRating(id, type);
        highlightStars(currentRating);
    });
    
    const currentRating = getRating(id, type);
    if (currentRating > 0) {
        highlightStars(currentRating);
    }
});

async function loadVideo(id, type) {
    const videoWrapper = document.getElementById('videoWrapper');
    const videoTitle = document.getElementById('videoTitle');
    const videoYear = document.getElementById('videoYear');
    const videoRating = document.getElementById('videoRating');
    const videoGenres = document.getElementById('videoGenres');
    const videoOverview = document.getElementById('videoOverview');
    
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
                videoTitle.textContent = details.title;
                videoYear.textContent = details.release_date ? details.release_date.substring(0, 4) : '';
                videoRating.textContent = details.vote_average ? `⭐ ${details.vote_average.toFixed(1)}` : '';
                videoGenres.textContent = details.genres ? details.genres.map(g => g.name).join(', ') : '';
                videoOverview.textContent = details.overview || 'No description available.';
                
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
                videoTitle.textContent = details.name;
                videoYear.textContent = details.first_air_date ? details.first_air_date.substring(0, 4) : '';
                videoRating.textContent = details.vote_average ? `⭐ ${details.vote_average.toFixed(1)}` : '';
                videoGenres.textContent = details.genres ? details.genres.map(g => g.name).join(', ') : '';
                videoOverview.textContent = details.overview || 'No description available.';
                
                addToWatchHistory({
                    id: details.id,
                    type: 'tv',
                    title: details.name,
                    poster: getTMDBImageUrl(details.poster_path)
                });
            }
        } else if (type === 'anime') {
            videoWrapper.innerHTML = '<div class="loading">Anime playback not available via Videasy. Please use alternative streaming services.</div>';
            videoTitle.textContent = 'Anime Playback';
            videoOverview.textContent = 'Anime content from AniList cannot be played directly through Videasy API. Please visit official anime streaming platforms.';
        }
    } catch (error) {
        console.error('Error loading video:', error);
        videoWrapper.innerHTML = '<div class="loading">Failed to load video. Please try again later.</div>';
    }
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        if (starRating <= rating) {
            star.classList.add('active');
            star.textContent = '★';
        } else {
            star.classList.remove('active');
            star.textContent = '☆';
        }
    });
}

function setRating(rating) {
    highlightStars(rating);
    const message = document.getElementById('ratingMessage');
    message.textContent = `You rated this ${rating} star${rating > 1 ? 's' : ''}`;
}

function saveRating(id, type, rating) {
    const urlParams = new URLSearchParams(window.location.search);
    const videoTitle = document.getElementById('videoTitle').textContent;
    
    addRating({
        id,
        type,
        title: videoTitle,
        poster: 'placeholder'
    }, rating);
}
