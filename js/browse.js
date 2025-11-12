async function loadMovies(filter, page) {
    const grid = document.getElementById('moviesGrid');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    grid.innerHTML = '<div class="loading">Loading movies...</div>';

    let data;
    switch(filter) {
        case 'popular':
            data = await getPopularMovies(page);
            break;
        case 'top_rated':
            data = await getTopRatedMovies(page);
            break;
        case 'upcoming':
            data = await getUpcomingMovies(page);
            break;
        case 'now_playing':
            data = await getNowPlayingMovies(page);
            break;
        default:
            data = await getPopularMovies(page);
    }

    if (data && data.results) {
        grid.innerHTML = '';
        data.results.forEach(movie => {
            grid.appendChild(createContentCard(movie, 'movie'));
        });

        pageInfo.textContent = `Page ${page}`;
        prevBtn.disabled = page === 1;
        nextBtn.disabled = page >= data.total_pages;
    } else {
        grid.innerHTML = '<p class="empty-message">Failed to load movies</p>';
    }
}

async function loadTVShows(filter, page) {
    const grid = document.getElementById('tvGrid');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    grid.innerHTML = '<div class="loading">Loading TV shows...</div>';

    let data;
    switch(filter) {
        case 'popular':
            data = await getPopularTVShows(page);
            break;
        case 'top_rated':
            data = await getTopRatedTVShows(page);
            break;
        case 'on_the_air':
            data = await getOnTheAirTVShows(page);
            break;
        case 'airing_today':
            data = await getAiringTodayTVShows(page);
            break;
        default:
            data = await getPopularTVShows(page);
    }

    if (data && data.results) {
        grid.innerHTML = '';
        data.results.forEach(show => {
            grid.appendChild(createContentCard(show, 'tv'));
        });

        pageInfo.textContent = `Page ${page}`;
        prevBtn.disabled = page === 1;
        nextBtn.disabled = page >= data.total_pages;
    } else {
        grid.innerHTML = '<p class="empty-message">Failed to load TV shows</p>';
    }
}

async function loadAnime(filter, page) {
    const grid = document.getElementById('animeGrid');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    grid.innerHTML = '<div class="loading">Loading anime...</div>';

    let data;
    switch(filter) {
        case 'trending':
            data = await getTrendingAnime();
            break;
        case 'popular':
            data = await getPopularAnime(page);
            break;
        case 'top_rated':
            data = await getTopRatedAnime(page);
            break;
        default:
            data = await getTrendingAnime();
    }

    if (data && data.length > 0) {
        grid.innerHTML = '';
        data.forEach(anime => {
            grid.appendChild(createContentCard(anime, 'anime'));
        });

        pageInfo.textContent = `Page ${page}`;
        prevBtn.disabled = page === 1;
        nextBtn.disabled = false;
    } else {
        grid.innerHTML = '<p class="empty-message">Failed to load anime</p>';
    }
}
