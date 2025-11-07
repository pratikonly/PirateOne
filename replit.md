# CineVerse - Your Ultimate Streaming Platform

## Overview
CineVerse is a modern, Netflix-style streaming platform built entirely with HTML, CSS, and JavaScript. It features a dark theme, seamless API integration, and a user-friendly interface for browsing movies, TV shows, and anime.

## Features
- **Dark Theme UI**: Netflix-inspired design with custom CineVerse branding
- **Custom Logo**: Cinematic gradient logo with animated play icons
- **Homepage**: Featured content carousel with trending movies, TV shows, and anime
- **Search**: Advanced search with filters for Movies, TV Shows, and Anime
- **Browse Pages**: Dedicated pages for Movies, TV Shows, and Anime with pagination
- **Video Player**: Embedded video playback using Videasy.net API integration
- **Authentication**: Client-side login/register system using localStorage
- **User Profile**: View watch history and ratings
- **Settings**: Customize playback and display preferences
- **Rating System**: Rate content and track your ratings
- **Responsive Design**: Optimized for desktop and mobile devices

## API Integration
1. **TMDb API** (themoviedb.org)
   - Fetches movie and TV show data
   - Provides movie/TV show IDs for video playback
   - Search functionality

2. **AniList API** (anilist.co)
   - Fetches anime data using GraphQL
   - Trending, popular, and top-rated anime

3. **Videasy.net API**
   - Embeds videos using TMDb IDs
   - Seamless playback integration

## Setup Instructions

### 1. Get TMDb API Key
1. Visit https://www.themoviedb.org/
2. Create a free account
3. Go to Settings > API
4. Request an API key (v3 auth)
5. Copy your API key

### 2. Update API Key
Open `js/api.js` and replace `YOUR_TMDB_API_KEY` with your actual TMDb API key:
```javascript
const TMDB_API_KEY = 'your_actual_api_key_here';
```

### 3. Run the Server
The server is automatically running on port 5000. Just open the webview to access CineVerse!

## Project Structure
```
/
├── index.html          # Homepage
├── login.html          # Login page
├── register.html       # Registration page
├── profile.html        # User profile
├── settings.html       # Settings page
├── player.html         # Video player
├── movies.html         # Browse movies
├── tvshows.html        # Browse TV shows
├── anime.html          # Browse anime
├── search.html         # Search page
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   ├── api.js          # API integration (TMDb, AniList, Videasy)
│   ├── auth.js         # Authentication logic
│   ├── main.js         # Homepage functionality
│   ├── player.js       # Video player logic
│   ├── browse.js       # Browse pages logic
│   └── search.js       # Search functionality
└── server.py           # Python HTTP server

```

## How It Works
1. **User Flow**:
   - Register/Login → Browse content → Search/Select content → Watch video → Rate content

2. **Video Playback**:
   - User searches for content → TMDb API fetches data and IDs → IDs passed to Videasy.net API → Video plays in embedded player

3. **Data Storage**:
   - All user data (auth, history, ratings) stored in browser's localStorage
   - No backend database required

## Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: TMDb API, AniList GraphQL API, Videasy.net Embed API
- **Storage**: Browser localStorage
- **Server**: Python HTTP Server

## Recent Changes
- 2024-01-07: Initial project creation
- Complete frontend implementation with all features
- API integration for TMDb, AniList, and Videasy.net
- Responsive design and mobile optimization

## User Preferences
- Dark theme with Netflix-inspired design
- Static frontend-only implementation
- No backend server or database
- All features client-side with localStorage

## Attribution
**Made by Pratik**

## Notes
- This is a demo/educational project
- API keys should be kept secure in production
- Videasy.net API may have usage limits
- Anime playback through Videasy may be limited (depends on Videasy's anime support)
