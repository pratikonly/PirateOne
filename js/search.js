document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('quickSearch');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let currentType = 'all';
    
    // Check for query parameter and auto-search
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        searchInput.value = query;
        performSearch();
    }
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentType = this.dataset.type;
            
            if (searchInput.value.trim()) {
                performSearch();
            }
        });
    });
    
    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;
        
        const resultsContainer = document.getElementById('searchResultsContainer');
        resultsContainer.innerHTML = '<div class="loading">Searching...</div>';
        
        try {
            let allResults = [];
            
            if (currentType === 'all' || currentType === 'movie') {
                const movieData = await searchMovies(query);
                if (movieData && movieData.results) {
                    allResults = allResults.concat(
                        movieData.results.map(item => ({...item, searchType: 'movie'}))
                    );
                }
            }
            
            if (currentType === 'all' || currentType === 'tv') {
                const tvData = await searchTVShows(query);
                if (tvData && tvData.results) {
                    allResults = allResults.concat(
                        tvData.results.map(item => ({...item, searchType: 'tv'}))
                    );
                }
            }
            
            if (currentType === 'all' || currentType === 'anime') {
                const animeData = await searchAnime(query);
                if (animeData && animeData.length > 0) {
                    allResults = allResults.concat(
                        animeData.map(item => ({...item, searchType: 'anime'}))
                    );
                }
            }
            
            if (allResults.length > 0) {
                resultsContainer.innerHTML = '<div class="content-grid"></div>';
                const grid = resultsContainer.querySelector('.content-grid');
                
                allResults.forEach(item => {
                    grid.appendChild(createContentCard(item, item.searchType));
                });
            } else {
                resultsContainer.innerHTML = `
                    <div class="search-placeholder">
                        <h2>No results found</h2>
                        <p>Try searching with different keywords</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <h2>Search failed</h2>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }
});
