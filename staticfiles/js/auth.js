const USERS_KEY = 'pirateone_users';
const CURRENT_USER_KEY = 'pirateone_current_user';

const AVATAR_STYLES = ['avataaars', 'bottts', 'personas', 'lorelei', 'adventurer', 'pixel-art', 'fun-emoji'];

function generateAvatarUrl(seed) {
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(seed)}`;
}

function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function register(name, email, password) {
    if (window.djangoAPI) {
        try {
            const response = await window.djangoAPI.register(email, password, name);
            return response.success;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    }
    
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        return false;
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        avatar: generateAvatarUrl(email + Date.now()),
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    return true;
}

async function login(email, password) {
    if (window.djangoAPI) {
        try {
            const response = await window.djangoAPI.login(email, password);
            return response.success;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }
    
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        if (!user.avatar) {
            user.avatar = generateAvatarUrl(email + user.id);
            saveUsers(users);
        }

        const userSession = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            createdAt: user.createdAt
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
        return true;
    }
    return false;
}

async function logout() {
    if (window.djangoAPI) {
        try {
            await window.djangoAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('pirateone_user');
    localStorage.removeItem('pirateone_logged_in');
}

function getCurrentUser() {
    if (window.djangoAPI) {
        const djangoUser = window.djangoAPI.getCurrentUser();
        if (djangoUser) {
            return {
                id: djangoUser.id,
                name: djangoUser.username || djangoUser.email.split('@')[0],
                email: djangoUser.email,
                avatar: generateAvatarUrl(djangoUser.avatar_seed || djangoUser.email),
                createdAt: djangoUser.created_at
            };
        }
    }
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
    if (window.djangoAPI) {
        return window.djangoAPI.isLoggedIn();
    }
    return getCurrentUser() !== null;
}

function checkAuth() {
    return isLoggedIn();
}

function updateUserName(newName) {
    const users = getUsers();
    const currentUser = getCurrentUser();

    if (currentUser) {
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].name = newName;
            saveUsers(users);

            currentUser.name = newName;
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        }
    }
}

async function getWatchHistory() {
    if (window.djangoAPI && window.djangoAPI.isLoggedIn()) {
        try {
            const response = await window.djangoAPI.getHistory();
            return response.history || [];
        } catch (error) {
            console.error('Get history error:', error);
        }
    }
    const history = localStorage.getItem('watchHistory');
    return history ? JSON.parse(history) : [];
}

async function addToWatchHistory(item) {
    if (window.djangoAPI && window.djangoAPI.isLoggedIn()) {
        try {
            await window.djangoAPI.addToHistory({
                content_id: item.id,
                content_type: item.type || 'movie',
                title: item.title,
                poster_path: item.poster_path || item.posterPath || '',
                vote_average: item.vote_average || item.rating || 0,
                progress: item.progress || 0,
                season: item.season,
                episode: item.episode,
            });
            return;
        } catch (error) {
            console.error('Add history error:', error);
        }
    }
    
    const history = await getWatchHistory();
    const existingIndex = history.findIndex(h => h.id === item.id && h.type === item.type);

    if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
    }

    history.unshift({
        ...item,
        watchedAt: new Date().toISOString()
    });

    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem('watchHistory', JSON.stringify(history));
}

async function getRatings() {
    if (window.djangoAPI && window.djangoAPI.isLoggedIn()) {
        try {
            const response = await window.djangoAPI.getRatings();
            return response.ratings || [];
        } catch (error) {
            console.error('Get ratings error:', error);
        }
    }
    const ratings = localStorage.getItem('ratings');
    return ratings ? JSON.parse(ratings) : [];
}

async function addRating(item, rating) {
    if (window.djangoAPI && window.djangoAPI.isLoggedIn()) {
        try {
            await window.djangoAPI.addRating({
                content_id: item.id,
                content_type: item.type || 'movie',
                title: item.title,
                rating: rating,
            });
            return;
        } catch (error) {
            console.error('Add rating error:', error);
        }
    }
    
    const ratings = await getRatings();
    const existingIndex = ratings.findIndex(r => r.id === item.id && r.type === item.type);

    if (existingIndex !== -1) {
        ratings[existingIndex].rating = rating;
    } else {
        ratings.push({
            ...item,
            rating,
            ratedAt: new Date().toISOString()
        });
    }

    localStorage.setItem('ratings', JSON.stringify(ratings));
}

async function getRating(id, type) {
    const ratings = await getRatings();
    const rating = ratings.find(r => r.id === id || r.content_id === id);
    return rating ? rating.rating : 0;
}

async function getWatchlist() {
    if (window.djangoAPI && window.djangoAPI.isLoggedIn()) {
        try {
            const response = await window.djangoAPI.getWatchlist();
            return response.watchlist || [];
        } catch (error) {
            console.error('Get watchlist error:', error);
        }
    }
    const watchlist = localStorage.getItem('watchlist');
    return watchlist ? JSON.parse(watchlist) : [];
}

async function addToWatchlist(item) {
    if (window.djangoAPI && window.djangoAPI.isLoggedIn()) {
        try {
            await window.djangoAPI.addToWatchlist({
                content_id: item.id,
                content_type: item.type || 'movie',
                title: item.title,
                poster_path: item.poster_path || item.posterPath || '',
                vote_average: item.vote_average || item.rating || 0,
            });
            return true;
        } catch (error) {
            console.error('Add to watchlist error:', error);
            return false;
        }
    }
    
    const watchlist = await getWatchlist();
    if (!watchlist.find(w => w.id === item.id && w.type === item.type)) {
        watchlist.push({
            ...item,
            addedAt: new Date().toISOString()
        });
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }
    return true;
}

async function removeFromWatchlist(id, type) {
    if (window.djangoAPI && window.djangoAPI.isLoggedIn()) {
        try {
            await window.djangoAPI.removeFromWatchlist(id, type || 'movie');
            return true;
        } catch (error) {
            console.error('Remove from watchlist error:', error);
            return false;
        }
    }
    
    const watchlist = await getWatchlist();
    const filtered = watchlist.filter(w => !(w.id === id && w.type === type));
    localStorage.setItem('watchlist', JSON.stringify(filtered));
    return true;
}

async function isInWatchlist(id, type) {
    if (window.djangoAPI && window.djangoAPI.isLoggedIn()) {
        try {
            const response = await window.djangoAPI.checkWatchlist(id, type || 'movie');
            return response.in_watchlist;
        } catch (error) {
            console.error('Check watchlist error:', error);
            return false;
        }
    }
    
    const watchlist = await getWatchlist();
    return watchlist.some(w => w.id === id && w.type === type);
}
