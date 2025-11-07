
function initSearchSuggestions(inputId, suggestionsId) {
    const searchInput = document.getElementById(inputId);
    const searchSuggestions = document.getElementById(suggestionsId);
    
    if (!searchInput || !searchSuggestions) return;
    
    let searchTimeout;

    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length < 2) {
            searchSuggestions.classList.remove('active');
            return;
        }

        searchTimeout = setTimeout(async () => {
            await showSearchSuggestions(query, searchSuggestions);
        }, 300);
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query) {
                searchSuggestions.classList.remove('active');
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        }
    });

    searchInput.addEventListener('blur', function() {
        setTimeout(() => {
            searchSuggestions.classList.remove('active');
        }, 200);
    });
}

async function showSearchSuggestions(query, suggestionsElement) {
    try {
        const [movies, tv, anime] = await Promise.all([
            searchMovies(query),
            searchTVShows(query),
            searchAnime(query)
        ]);

        let suggestions = [];
        
        if (movies && movies.results) {
            suggestions = suggestions.concat(movies.results.slice(0, 3).map(item => ({...item, type: 'movie'})));
        }
        if (tv && tv.results) {
            suggestions = suggestions.concat(tv.results.slice(0, 3).map(item => ({...item, type: 'tv'})));
        }
        if (anime && anime.length > 0) {
            suggestions = suggestions.concat(anime.slice(0, 3).map(item => ({...item, type: 'anime'})));
        }

        if (suggestions.length > 0) {
            suggestionsElement.innerHTML = suggestions.map(item => {
                const poster = item.type === 'anime' ? item.coverImage?.large : getTMDBImageUrl(item.poster_path, 'w185');
                const title = item.type === 'anime' ? formatAnimeTitle(item) : (item.title || item.name);
                const year = item.release_date ? item.release_date.substring(0, 4) : (item.first_air_date ? item.first_air_date.substring(0, 4) : '');
                const typeLabel = item.type === 'movie' ? 'Movie' : item.type === 'tv' ? 'TV Show' : 'Anime';
                
                return `
                    <div class="search-suggestion-item" onclick="window.location.href='player.html?id=${item.id}&type=${item.type}'">
                        <img src="${poster}" alt="${title}" class="search-suggestion-poster" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2750%27 height=%2775%27%3E%3Crect fill=%27%231f1f1f%27 width=%2750%27 height=%2775%27/%3E%3C/svg%3E'">
                        <div class="search-suggestion-info">
                            <div class="search-suggestion-title">${title}</div>
                            <div class="search-suggestion-meta">
                                <span>${typeLabel}</span>
                                ${year ? `<span>•</span><span>${year}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            suggestionsElement.classList.add('active');
        } else {
            suggestionsElement.classList.remove('active');
        }
    } catch (error) {
        console.error('Search suggestions error:', error);
        suggestionsElement.classList.remove('active');
    }
}
