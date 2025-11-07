const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_ORIGINAL = 'https://image.tmdb.org/t/p/original';

const ANILIST_API_URL = 'https://graphql.anilist.co';

const VIDEASY_EMBED_BASE = 'https://www.videasy.net/api/embed';

async function fetchTMDB(endpoint) {
    try {
        const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('TMDB API error');
        return await response.json();
    } catch (error) {
        console.error('TMDB API Error:', error);
        return null;
    }
}

async function fetchAniList(query, variables = {}) {
    try {
        const response = await fetch(ANILIST_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query, variables })
        });
        if (!response.ok) throw new Error('AniList API error');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('AniList API Error:', error);
        return null;
    }
}

async function getTrendingMovies() {
    return await fetchTMDB('/trending/movie/week');
}

async function getPopularMovies(page = 1) {
    return await fetchTMDB(`/movie/popular?page=${page}`);
}

async function getTopRatedMovies(page = 1) {
    return await fetchTMDB(`/movie/top_rated?page=${page}`);
}

async function getUpcomingMovies(page = 1) {
    return await fetchTMDB(`/movie/upcoming?page=${page}`);
}

async function getNowPlayingMovies(page = 1) {
    return await fetchTMDB(`/movie/now_playing?page=${page}`);
}

async function getPopularTVShows(page = 1) {
    return await fetchTMDB(`/tv/popular?page=${page}`);
}

async function getTopRatedTVShows(page = 1) {
    return await fetchTMDB(`/tv/top_rated?page=${page}`);
}

async function getOnTheAirTVShows(page = 1) {
    return await fetchTMDB(`/tv/on_the_air?page=${page}`);
}

async function getAiringTodayTVShows(page = 1) {
    return await fetchTMDB(`/tv/airing_today?page=${page}`);
}

async function getMoviesByGenre(genreId, page = 1) {
    return await fetchTMDB(`/discover/movie?with_genres=${genreId}&page=${page}`);
}

async function getTVShowsByGenre(genreId, page = 1) {
    return await fetchTMDB(`/discover/tv?with_genres=${genreId}&page=${page}`);
}

async function getMovieDetails(movieId) {
    return await fetchTMDB(`/movie/${movieId}`);
}

async function getTVShowDetails(tvId) {
    return await fetchTMDB(`/tv/${tvId}`);
}

async function searchMovies(query, page = 1) {
    return await fetchTMDB(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
}

async function searchTVShows(query, page = 1) {
    return await fetchTMDB(`/search/tv?query=${encodeURIComponent(query)}&page=${page}`);
}

async function getTrendingAnime() {
    const query = `
    query {
        Page(page: 1, perPage: 20) {
            media(type: ANIME, sort: TRENDING_DESC) {
                id
                title {
                    english
                    romaji
                }
                coverImage {
                    large
                }
                averageScore
                format
                episodes
            }
        }
    }`;
    
    const data = await fetchAniList(query);
    return data ? data.Page.media : [];
}

async function getPopularAnime(page = 1) {
    const query = `
    query ($page: Int) {
        Page(page: $page, perPage: 20) {
            media(type: ANIME, sort: POPULARITY_DESC) {
                id
                title {
                    english
                    romaji
                }
                coverImage {
                    large
                }
                averageScore
                format
                episodes
            }
        }
    }`;
    
    const data = await fetchAniList(query, { page });
    return data ? data.Page.media : [];
}

async function getTopRatedAnime(page = 1) {
    const query = `
    query ($page: Int) {
        Page(page: $page, perPage: 20) {
            media(type: ANIME, sort: SCORE_DESC) {
                id
                title {
                    english
                    romaji
                }
                coverImage {
                    large
                }
                averageScore
                format
                episodes
            }
        }
    }`;
    
    const data = await fetchAniList(query, { page });
    return data ? data.Page.media : [];
}

async function searchAnime(query) {
    const graphqlQuery = `
    query ($search: String) {
        Page(page: 1, perPage: 20) {
            media(type: ANIME, search: $search) {
                id
                title {
                    english
                    romaji
                }
                coverImage {
                    large
                }
                averageScore
                format
                episodes
            }
        }
    }`;
    
    const data = await fetchAniList(graphqlQuery, { search: query });
    return data ? data.Page.media : [];
}

function getVideasyEmbedUrl(tmdbId, type = 'movie') {
    return `${VIDEASY_EMBED_BASE}?tmdb=${tmdbId}&type=${type}`;
}

function getTMDBImageUrl(path, size = 'w500') {
    if (!path) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="750"%3E%3Crect fill="%231f1f1f" width="500" height="750"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

function formatAnimeTitle(anime) {
    return anime.title.english || anime.title.romaji || 'Unknown';
}

function createContentCard(item, type = 'movie') {
    const card = document.createElement('div');
    card.className = 'content-card';
    
    let imageUrl, title, year, rating;
    
    if (type === 'anime') {
        imageUrl = item.coverImage.large;
        title = formatAnimeTitle(item);
        year = '';
        rating = item.averageScore ? `${item.averageScore}%` : 'N/A';
    } else {
        imageUrl = getTMDBImageUrl(item.poster_path);
        title = item.title || item.name;
        year = (item.release_date || item.first_air_date || '').substring(0, 4);
        rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    }
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${title}" loading="lazy">
        <div class="content-card-info">
            <div class="content-card-title">${title}</div>
            <div class="content-card-meta">
                ${year} ${year && rating !== 'N/A' ? '•' : ''} ${rating !== 'N/A' ? '⭐ ' + rating : ''}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        const id = item.id;
        window.location.href = `player.html?id=${id}&type=${type}`;
    });
    
    return card;
}
