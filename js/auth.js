const USERS_KEY = 'cineverse_users';
const CURRENT_USER_KEY = 'cineverse_current_user';

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

function register(name, email, password) {
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

function login(email, password) {
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
    // Authentication is now optional, just return user status
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

function getWatchHistory() {
    const history = localStorage.getItem('watchHistory');
    return history ? JSON.parse(history) : [];
}

function addToWatchHistory(item) {
    const history = getWatchHistory();
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

function getRatings() {
    const ratings = localStorage.getItem('ratings');
    return ratings ? JSON.parse(ratings) : [];
}

function addRating(item, rating) {
    const ratings = getRatings();
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

function getRating(id, type) {
    const ratings = getRatings();
    const rating = ratings.find(r => r.id === id && r.type === type);
    return rating ? rating.rating : 0;
}
