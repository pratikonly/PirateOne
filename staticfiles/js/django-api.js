const API_BASE = '/api';

class DjangoAPI {
    constructor() {
        this.csrfToken = this.getCSRFToken();
    }

    getCSRFToken() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken') {
                return value;
            }
        }
        return '';
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.csrfToken,
            },
            credentials: 'include',
            ...options,
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async register(email, password, name) {
        const response = await this.request('/register/', {
            method: 'POST',
            body: { email, password, name },
        });
        
        if (response.success && response.user) {
            localStorage.setItem('pirateone_user', JSON.stringify(response.user));
            localStorage.setItem('pirateone_logged_in', 'true');
        }
        
        return response;
    }

    async login(email, password) {
        const response = await this.request('/login/', {
            method: 'POST',
            body: { email, password },
        });
        
        if (response.success && response.user) {
            localStorage.setItem('pirateone_user', JSON.stringify(response.user));
            localStorage.setItem('pirateone_logged_in', 'true');
        }
        
        return response;
    }

    async logout() {
        const response = await this.request('/logout/', {
            method: 'POST',
        });
        
        localStorage.removeItem('pirateone_user');
        localStorage.removeItem('pirateone_logged_in');
        
        return response;
    }

    async checkAuth() {
        try {
            const response = await this.request('/check-auth/', {
                method: 'GET',
            });
            
            if (response.authenticated && response.user) {
                localStorage.setItem('pirateone_user', JSON.stringify(response.user));
                localStorage.setItem('pirateone_logged_in', 'true');
            } else {
                localStorage.removeItem('pirateone_user');
                localStorage.removeItem('pirateone_logged_in');
            }
            
            return response;
        } catch (error) {
            localStorage.removeItem('pirateone_user');
            localStorage.removeItem('pirateone_logged_in');
            return { authenticated: false };
        }
    }

    async getWatchlist() {
        return await this.request('/watchlist/', {
            method: 'GET',
        });
    }

    async addToWatchlist(item) {
        return await this.request('/watchlist/', {
            method: 'POST',
            body: item,
        });
    }

    async removeFromWatchlist(contentId, contentType) {
        return await this.request('/watchlist/', {
            method: 'DELETE',
            body: { content_id: contentId, content_type: contentType },
        });
    }

    async checkWatchlist(contentId, contentType) {
        return await this.request(`/watchlist/check/?content_id=${contentId}&content_type=${contentType}`, {
            method: 'GET',
        });
    }

    async getHistory() {
        return await this.request('/history/', {
            method: 'GET',
        });
    }

    async addToHistory(item) {
        return await this.request('/history/', {
            method: 'POST',
            body: item,
        });
    }

    async clearHistory() {
        return await this.request('/history/', {
            method: 'DELETE',
        });
    }

    async getRatings() {
        return await this.request('/ratings/', {
            method: 'GET',
        });
    }

    async addRating(item) {
        return await this.request('/ratings/', {
            method: 'POST',
            body: item,
        });
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('pirateone_user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }

    isLoggedIn() {
        return localStorage.getItem('pirateone_logged_in') === 'true';
    }
}

window.djangoAPI = new DjangoAPI();
