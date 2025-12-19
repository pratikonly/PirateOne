// TV playback state
let currentTvContext = {
    tvId: null,
    seasons: [],
    seasonNumber: null,
    episodeNumber: null,
    seasonDetails: null
};

// DOM references
let episodesContainer, seasonSelector, episodesList;

document.addEventListener('DOMContentLoaded', async function() {
    checkAuth();

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const type = urlParams.get('type');
    const season = urlParams.get('season');
    const episode = urlParams.get('episode');

    if (!id || !type) {
        alert('Invalid video');
        window.location.href = 'index.html';
        return;
    }

    // Initialize DOM references
    episodesContainer = document.getElementById('episodesContainer');
    seasonSelector = document.getElementById('seasonSelector');
    episodesList = document.getElementById('episodesList');

    // Setup season selector change listener
    if (seasonSelector) {
        seasonSelector.addEventListener('change', async function() {
            const selectedSeason = parseInt(this.value);
            if (!Number.isNaN(selectedSeason) && selectedSeason !== null && currentTvContext.tvId) {
                const urlParams = new URLSearchParams(window.location.search);
                const type = urlParams.get('type');

                if (type === 'anime') {
                    await loadAnimeEpisodes(currentTvContext.tvId, selectedSeason);
                } else {
                    await loadEpisodes(currentTvContext.tvId, selectedSeason);
                }
            }
        });
    }

    // Setup episode list click delegation
    if (episodesList) {
        episodesList.addEventListener('click', async function(e) {
            const episodeItem = e.target.closest('.episode-item');
            if (episodeItem && currentTvContext.tvId) {
                const seasonNum = parseInt(episodeItem.dataset.season);
                const episodeNum = parseInt(episodeItem.dataset.episode);
                const episodeName = episodeItem.dataset.name;
                const runtime = episodeItem.dataset.runtime;

                const urlParams = new URLSearchParams(window.location.search);
                const type = urlParams.get('type');

                if (type === 'anime') {
                    await playAnimeEpisode(currentTvContext.tvId, seasonNum, episodeNum, {
                        name: episodeName,
                        runtime: runtime
                    });
                } else {
                    await playEpisode(currentTvContext.tvId, seasonNum, episodeNum, {
                        name: episodeName,
                        runtime: runtime
                    });
                }
            }
        });
    }

    await loadVideo(id, type, { season: season ? parseInt(season) : null, episode: episode ? parseInt(episode) : null });

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

async function loadVideo(id, type, defaults = {}) {
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

                    // Initialize TV playback with seasons/episodes
                    await initTvPlayback(id, details, defaults);

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
            try {
                // Get anime details from AniList
                details = await getAnimeDetails(id);
                console.log('Anime details from AniList:', details);

                if (details) {
                    const title = details.title.english || details.title.romaji || 'Unknown Anime';
                    const year = details.seasonYear || 'N/A';
                    const rating = details.averageScore ? `⭐ ${(details.averageScore / 10).toFixed(1)}` : 'N/A';

                    videoTitle.textContent = title;
                    movieTitle.textContent = title;
                    movieYear.textContent = year;
                    movieRating.textContent = rating;

                    // Strip HTML tags from description
                    const description = details.description ? details.description.replace(/<[^>]*>/g, '') : 'No description available.';
                    movieDescription.textContent = description;

                    if (details.coverImage && details.coverImage.extraLarge) {
                        moviePoster.src = details.coverImage.extraLarge;
                    } else if (details.coverImage && details.coverImage.large) {
                        moviePoster.src = details.coverImage.large;
                    } else {
                        moviePoster.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="150"%3E%3Crect fill="%231f1f1f" width="100" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23666"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }

                    if (details.genres && details.genres.length > 0) {
                        movieGenres.innerHTML = details.genres.map(g => 
                            `<span class="genre-tag">${g}</span>`
                        ).join('');
                    } else {
                        movieGenres.innerHTML = '<span class="genre-tag">Anime</span>';
                    }

                    // Load AniList characters
                    await loadAnimeCharacters(details);

                    // Load AniList recommendations
                    await loadAnimeRecommendations(details);

                    // Initialize anime playback with episodes
                    const episodeCount = details.episodes || 12;
                    const mockDetails = {
                        id: id,
                        name: title,
                        seasons: [
                            { season_number: 1, episode_count: episodeCount, name: 'Season 1' }
                        ]
                    };

                    await initAnimePlayback(id, mockDetails, defaults);

                    addToWatchHistory({
                        id: details.id,
                        type: 'anime',
                        title: title,
                        poster: details.coverImage ? details.coverImage.large : ''
                    });
                } else {
                    throw new Error('No anime details found');
                }
            } catch (apiError) {
                console.warn('Could not load anime details from AniList:', apiError);

                // Set basic info
                videoTitle.textContent = 'Anime Player';
                movieTitle.textContent = 'Anime Player';
                movieYear.textContent = 'N/A';
                movieRating.textContent = 'N/A';
                movieDescription.textContent = 'Enjoy your anime!';
                movieGenres.innerHTML = '<span class="genre-tag">Anime</span>';
                movieCast.innerHTML = '<div class="loading">Character information not available</div>';
                moviePoster.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="150"%3E%3Crect fill="%231f1f1f" width="100" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23666"%3EAnime%3C/text%3E%3C/svg%3E';

                if (recommendedSlider) {
                    recommendedSlider.innerHTML = '<div class="loading">Recommendations not available</div>';
                }

                // Create a mock details object with default episodes for anime
                const mockDetails = {
                    id: id,
                    name: 'Anime',
                    seasons: [
                        { season_number: 1, episode_count: 12, name: 'Season 1' }
                    ]
                };

                // Initialize anime playback with mock data
                await initAnimePlayback(id, mockDetails, defaults);
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

async function loadAnimeCharacters(animeDetails) {
    const movieCast = document.getElementById('movieCast');

    try {
        if (animeDetails.characters && animeDetails.characters.edges && animeDetails.characters.edges.length > 0) {
            const characters = animeDetails.characters.edges.slice(0, 6);
            movieCast.innerHTML = characters.map(edge => {
                const character = edge.node;
                const imageUrl = character.image && character.image.large ? character.image.large : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="45" height="45"%3E%3Crect fill="%231f1f1f" width="45" height="45"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23666"%3E?%3C/text%3E%3C/svg%3E';
                return `
                    <div class="cast-item">
                        <div class="cast-photo">
                            <img src="${imageUrl}" alt="${character.name.full}">
                        </div>
                        <div class="cast-name">${character.name.full}</div>
                    </div>
                `;
            }).join('');
        } else {
            movieCast.innerHTML = '<div class="loading">No character information available</div>';
        }
    } catch (error) {
        console.error('Error loading anime characters:', error);
        movieCast.innerHTML = '<div class="loading">Failed to load characters</div>';
    }
}

async function loadAnimeRecommendations(animeDetails) {
    const recommendedSlider = document.getElementById('recommendedSlider');

    try {
        if (animeDetails.recommendations && animeDetails.recommendations.nodes && animeDetails.recommendations.nodes.length > 0) {
            recommendedSlider.innerHTML = '';
            animeDetails.recommendations.nodes.forEach(node => {
                if (node.mediaRecommendation) {
                    const anime = node.mediaRecommendation;
                    recommendedSlider.appendChild(createContentCard(anime, 'anime'));
                }
            });
        } else {
            recommendedSlider.innerHTML = '<div class="loading">No recommendations available</div>';
        }
    } catch (error) {
        console.error('Error loading anime recommendations:', error);
        recommendedSlider.innerHTML = '<div class="loading">Failed to load recommendations</div>';
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

async function addToWatchlist(id, type, title, poster) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');

    const exists = watchlist.find(item => item.id == id && item.type === type);
    const addToWatchlistBtn = document.getElementById('addToWatchlistBtn');

    if (!exists) {
        watchlist.push({
            id,
            type,
            title,
            poster,
            addedAt: new Date().toISOString()
        });
        localStorage.setItem('watchlist', JSON.stringify(watchlist));

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
        watchlist = watchlist.filter(item => !(item.id == id && item.type === type));
        localStorage.setItem('watchlist', JSON.stringify(watchlist));

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

async function initTvPlayback(tvId, details, defaults = {}) {
    if (!details || !details.seasons || !episodesContainer) {
        return;
    }

    currentTvContext.tvId = tvId;
    currentTvContext.seasons = details.seasons.filter(s => s.season_number >= 0 && s.episode_count > 0);

    if (currentTvContext.seasons.length === 0) {
        return;
    }

    episodesContainer.style.display = 'block';

    seasonSelector.innerHTML = currentTvContext.seasons.map(season => 
        `<option value="${season.season_number}">
            ${season.name} (${season.episode_count} episodes)
        </option>`
    ).join('');

    const defaultSeason = defaults.season !== null && defaults.season !== undefined ? defaults.season : currentTvContext.seasons[0].season_number;
    seasonSelector.value = defaultSeason;
    currentTvContext.seasonNumber = defaultSeason;

    await loadEpisodes(tvId, defaultSeason, defaults.episode);
}

async function loadEpisodes(tvId, seasonNumber, defaultEpisode = null) {
    if (!episodesList) return;

    episodesList.innerHTML = '<div class="loading">Loading episodes...</div>';

    try {
        const seasonData = await getTVSeasonDetails(tvId, seasonNumber);

        if (!seasonData || !seasonData.episodes || seasonData.episodes.length === 0) {
            episodesList.innerHTML = '<div class="loading">No episodes available</div>';
            return;
        }

        currentTvContext.seasonNumber = seasonNumber;
        currentTvContext.seasonDetails = seasonData;

        episodesList.innerHTML = seasonData.episodes.map(episode => {
            const runtime = episode.runtime ? `${episode.runtime}min` : 'N/A';

            return `
                <div class="episode-item" 
                     data-season="${seasonNumber}" 
                     data-episode="${episode.episode_number}"
                     data-name="${episode.name || 'Episode ' + episode.episode_number}"
                     data-runtime="${runtime}">
                    <div class="episode-number">E${episode.episode_number}</div>
                    <div class="episode-details">
                        <div class="episode-name">${episode.name || 'Episode ' + episode.episode_number}</div>
                        <div class="episode-meta">
                            <span class="episode-duration">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                </svg>
                                ${runtime}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const episodeToPlay = defaultEpisode || 1;
        const firstEpisode = seasonData.episodes.find(e => e.episode_number === episodeToPlay) || seasonData.episodes[0];

        if (firstEpisode) {
            await playEpisode(tvId, seasonNumber, firstEpisode.episode_number, {
                name: firstEpisode.name,
                runtime: firstEpisode.runtime
            });
        }

    } catch (error) {
        console.error('Error loading episodes:', error);
        episodesList.innerHTML = '<div class="loading">Failed to load episodes</div>';
    }
}

async function initAnimePlayback(animeId, details, defaults = {}) {
    if (!details || !details.seasons || !episodesContainer) {
        return;
    }

    currentTvContext.tvId = animeId;
    currentTvContext.seasons = details.seasons.filter(s => s.season_number >= 0 && s.episode_count > 0);

    if (currentTvContext.seasons.length === 0) {
        return;
    }

    episodesContainer.style.display = 'block';

    seasonSelector.innerHTML = currentTvContext.seasons.map(season => 
        `<option value="${season.season_number}">
            Season ${season.season_number} (${season.episode_count} episodes)
        </option>`
    ).join('');

    const defaultSeason = defaults.season !== null && defaults.season !== undefined ? defaults.season : currentTvContext.seasons[0].season_number;
    seasonSelector.value = defaultSeason;
    currentTvContext.seasonNumber = defaultSeason;

    await loadAnimeEpisodes(animeId, defaultSeason, defaults.episode);
}

async function loadAnimeEpisodes(animeId, seasonNumber, defaultEpisode = null) {
    if (!episodesList) return;

    episodesList.innerHTML = '<div class="loading">Loading episodes...</div>';

    try {
        const seasonData = await getTVSeasonDetails(animeId, seasonNumber);

        if (!seasonData || !seasonData.episodes || seasonData.episodes.length === 0) {
            // If TMDB fails, create default episodes (typical anime has 12-24 episodes per season)
            console.warn('TMDB episode data unavailable, using default episode list');
            const defaultEpisodeCount = 12;
            const mockEpisodes = [];

            for (let i = 1; i <= defaultEpisodeCount; i++) {
                mockEpisodes.push({
                    episode_number: i,
                    name: `Episode ${i}`,
                    runtime: 24
                });
            }

            currentTvContext.seasonNumber = seasonNumber;
            currentTvContext.seasonDetails = { episodes: mockEpisodes };

            episodesList.innerHTML = mockEpisodes.map(episode => {
                const runtime = episode.runtime ? `${episode.runtime}min` : '24min';

                return `
                    <div class="episode-item" 
                         data-season="${seasonNumber}" 
                         data-episode="${episode.episode_number}"
                         data-name="${episode.name}"
                         data-runtime="${runtime}">
                        <div class="episode-number">E${episode.episode_number}</div>
                        <div class="episode-details">
                            <div class="episode-name">${episode.name}</div>
                            <div class="episode-meta">
                                <span class="episode-duration">
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                    </svg>
                                    ${runtime}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            const episodeToPlay = defaultEpisode || 1;
            await playAnimeEpisode(animeId, seasonNumber, episodeToPlay, {
                name: `Episode ${episodeToPlay}`,
                runtime: '24min'
            });
            return;
        }

        currentTvContext.seasonNumber = seasonNumber;
        currentTvContext.seasonDetails = seasonData;

        episodesList.innerHTML = seasonData.episodes.map(episode => {
            const runtime = episode.runtime ? `${episode.runtime}min` : '24min';

            return `
                <div class="episode-item" 
                     data-season="${seasonNumber}" 
                     data-episode="${episode.episode_number}"
                     data-name="${episode.name || 'Episode ' + episode.episode_number}"
                     data-runtime="${runtime}">
                    <div class="episode-number">E${episode.episode_number}</div>
                    <div class="episode-details">
                        <div class="episode-name">${episode.name || 'Episode ' + episode.episode_number}</div>
                        <div class="episode-meta">
                            <span class="episode-duration">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                </svg>
                                ${runtime}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const episodeToPlay = defaultEpisode || 1;
        const firstEpisode = seasonData.episodes.find(e => e.episode_number === episodeToPlay) || seasonData.episodes[0];

        if (firstEpisode) {
            await playAnimeEpisode(animeId, seasonNumber, firstEpisode.episode_number, {
                name: firstEpisode.name,
                runtime: firstEpisode.runtime
            });
        }

    } catch (error) {
        console.error('Error loading anime episodes:', error);
        // Fallback to default episodes
        const defaultEpisodeCount = 12;
        const mockEpisodes = [];

        for (let i = 1; i <= defaultEpisodeCount; i++) {
            mockEpisodes.push({
                episode_number: i,
                name: `Episode ${i}`,
                runtime: 24
            });
        }

        episodesList.innerHTML = mockEpisodes.map(episode => {
            return `
                <div class="episode-item" 
                     data-season="${seasonNumber}" 
                     data-episode="${episode.episode_number}"
                     data-name="${episode.name}"
                     data-runtime="24min">
                    <div class="episode-number">E${episode.episode_number}</div>
                    <div class="episode-details">
                        <div class="episode-name">${episode.name}</div>
                        <div class="episode-meta">
                            <span class="episode-duration">
                                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                                </svg>
                                24min
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const episodeToPlay = defaultEpisode || 1;
        await playAnimeEpisode(animeId, seasonNumber, episodeToPlay, {
            name: `Episode ${episodeToPlay}`,
            runtime: '24min'
        });
    }
}

async function playAnimeEpisode(animeId, seasonNumber, episodeNumber, episodeData = {}) {
    const videoWrapper = document.getElementById('videoWrapper');
    const videoTitle = document.getElementById('videoTitle');

    if (!videoWrapper || !videoTitle) return;

    const embedUrl = getVideasyEmbedUrl(animeId, 'anime', seasonNumber, episodeNumber);

    videoWrapper.innerHTML = `<iframe 
        src="${embedUrl}" 
        frameborder="0" 
        allowfullscreen 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="origin"
        scrolling="no"
        style="border: none;"></iframe>`;

    const showTitle = document.getElementById('movieTitle')?.textContent || 'Anime';
    const episodeName = episodeData.name || `Episode ${episodeNumber}`;
    videoTitle.textContent = `${showTitle} — S${seasonNumber}E${episodeNumber}: ${episodeName}`;

    document.querySelectorAll('.episode-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeEpisode = episodesList.querySelector(`[data-season="${seasonNumber}"][data-episode="${episodeNumber}"]`);
    if (activeEpisode) {
        activeEpisode.classList.add('active');
        activeEpisode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    currentTvContext.episodeNumber = episodeNumber;

    const url = new URL(window.location);
    url.searchParams.set('season', seasonNumber);
    url.searchParams.set('episode', episodeNumber);
    window.history.replaceState({}, '', url);
}

async function playEpisode(tvId, seasonNumber, episodeNumber, episodeData = {}) {
    const videoWrapper = document.getElementById('videoWrapper');
    const videoTitle = document.getElementById('videoTitle');

    if (!videoWrapper || !videoTitle) return;

    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');

    // Use appropriate embed URL based on content type
    const embedUrl = type === 'anime' 
        ? getVideasyEmbedUrl(tvId, 'anime', seasonNumber, episodeNumber)
        : getVideasyEmbedUrl(tvId, 'tv', seasonNumber, episodeNumber);

    videoWrapper.innerHTML = `<iframe 
        src="${embedUrl}" 
        frameborder="0" 
        allowfullscreen 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="origin"
        scrolling="no"
        style="border: none;"></iframe>`;

    const showTitle = document.getElementById('movieTitle')?.textContent || (type === 'anime' ? 'Anime' : 'TV Show');
    const episodeName = episodeData.name || `Episode ${episodeNumber}`;
    videoTitle.textContent = `${showTitle} — S${seasonNumber}E${episodeNumber}: ${episodeName}`;

    document.querySelectorAll('.episode-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeEpisode = episodesList.querySelector(`[data-season="${seasonNumber}"][data-episode="${episodeNumber}"]`);
    if (activeEpisode) {
        activeEpisode.classList.add('active');
        activeEpisode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    currentTvContext.episodeNumber = episodeNumber;

    const url = new URL(window.location);
    url.searchParams.set('season', seasonNumber);
    url.searchParams.set('episode', episodeNumber);
    window.history.replaceState({}, '', url);
}
