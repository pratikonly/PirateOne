const TMDB_API_KEY = window.CONFIG?.TMDB_API_KEY || 'd56ba8afb5eca855e13f2507f36f9a62';
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

async function getTVSeasonDetails(tvId, seasonNumber) {
    return await fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
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

async function getAnimeDetails(anilistId) {
    const query = `
    query ($id: Int) {
        Media(id: $id, type: ANIME) {
            id
            title {
                english
                romaji
                native
            }
            description
            coverImage {
                extraLarge
                large
            }
            bannerImage
            averageScore
            meanScore
            popularity
            favourites
            genres
            episodes
            duration
            status
            format
            season
            seasonYear
            studios {
                nodes {
                    name
                }
            }
            characters(perPage: 6, sort: ROLE) {
                edges {
                    role
                    node {
                        name {
                            full
                        }
                        image {
                            large
                        }
                    }
                    voiceActors(language: JAPANESE, sort: RELEVANCE) {
                        name {
                            full
                        }
                        image {
                            large
                        }
                    }
                }
            }
            recommendations(perPage: 10, sort: RATING_DESC) {
                nodes {
                    mediaRecommendation {
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
            }
        }
    }`;

    const data = await fetchAniList(query, { id: parseInt(anilistId) });
    return data ? data.Media : null;
}

function getVideasyEmbedUrl(tmdbId, type = 'movie', season = null, episode = null) {
    // Videasy.net player URL format:
    // Movies: https://player.videasy.net/movie/{tmdb_id}
    // TV Shows: https://player.videasy.net/tv/{tmdb_id}
    // TV Episodes: https://player.videasy.net/tv/{tmdb_id}/{season}/{episode}
    // Anime: https://player.videasy.net/anime/{anilist_id}
    if (type === 'movie') {
        return `https://player.videasy.net/movie/${tmdbId}`;
    } else if (type === 'tv') {
        if (season !== null && episode !== null) {
            return `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`;
        }
        return `https://player.videasy.net/tv/${tmdbId}`;
    } else if (type === 'anime') {
        return `https://player.videasy.net/anime/${tmdbId}`;
    }
    return `https://player.videasy.net/movie/${tmdbId}`;
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
        rating = item.averageScore ? (item.averageScore / 10).toFixed(1) : 'N/A';
    } else {
        imageUrl = getTMDBImageUrl(item.poster_path);
        title = item.title || item.name;
        year = (item.release_date || item.first_air_date || '').substring(0, 4);
        rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    }

    card.innerHTML = `
        <img src="${imageUrl}" alt="${title}" loading="lazy">
        ${rating !== 'N/A' ? `<div class="card-rating">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            ${rating}
        </div>` : ''}
        <div class="content-card-info">
            <div class="content-card-title">${title}</div>
            <div class="content-card-meta">
                ${year}
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        const id = item.id;
        window.location.href = `player.html?id=${id}&type=${type}`;
    });

    return card;
}
