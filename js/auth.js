const CURRENT_USER_KEY = 'cineverse_current_user';

const AVATAR_STYLES = ['avataaars', 'bottts', 'personas', 'lorelei', 'adventurer', 'pixel-art', 'fun-emoji'];

const API_BASE_URL = window.location.protocol + '//' + window.location.hostname + ':3000';

function generateAvatarUrl(seed) {
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(seed)}`;
}

async function register(name, email, password) {
    try {
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password,
            avatar: generateAvatarUrl(email + Date.now())
        };

        const response = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Registration error:', error);
        return false;
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function checkAuth() {
    return isLoggedIn();
}

async function updateUserName(newName) {
    const currentUser = getCurrentUser();

    if (currentUser) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });

            if (response.ok) {
                currentUser.name = newName;
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
            }
        } catch (error) {
            console.error('Update user error:', error);
        }
    }
}

async function getWatchHistory() {
    const user = getCurrentUser();
    if (!user) return [];

    try {
        const response = await fetch(`${API_BASE_URL}/api/watch-history/${user.id}`);
        return await response.json();
    } catch (error) {
        console.error('Get watch history error:', error);
        return [];
    }
}

async function addToWatchHistory(item) {
    const user = getCurrentUser();
    if (!user) return;

    try {
        await fetch(`${API_BASE_URL}/api/watch-history/${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
    } catch (error) {
        console.error('Add to watch history error:', error);
    }
}

async function getRatings() {
    const user = getCurrentUser();
    if (!user) return [];

    try {
        const response = await fetch(`${API_BASE_URL}/api/ratings/${user.id}`);
        return await response.json();
    } catch (error) {
        console.error('Get ratings error:', error);
        return [];
    }
}

async function addRating(item, rating) {
    const user = getCurrentUser();
    if (!user) return;

    try {
        await fetch(`${API_BASE_URL}/api/ratings/${user.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, rating })
        });
    } catch (error) {
        console.error('Add rating error:', error);
    }
}

async function getRating(id, type) {
    const user = getCurrentUser();
    if (!user) return 0;

    try {
        const response = await fetch(`${API_BASE_URL}/api/rating/${user.id}/${id}/${type}`);
        const data = await response.json();
        return data.rating;
    } catch (error) {
        console.error('Get rating error:', error);
        return 0;
    }
}