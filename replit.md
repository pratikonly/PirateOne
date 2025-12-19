# PirateOne - Your Ultimate Streaming Platform

## Overview
PirateOne is a modern, Netflix-style streaming platform built with HTML, CSS, JavaScript frontend and Django backend. It features a dark theme, seamless API integration, and a user-friendly interface for browsing movies, TV shows, and anime.

## Features
- **Dark Theme UI**: Pure black (#000000) background with #d89d9d accent color
- **Modern Sidebar**: Dual-box sidebar layout (1:4 ratio) with smooth rounded corners
  - Upper box: Home and Search navigation
  - Lower box: Movies, TV Shows, Anime, Manga + History, WatchList, Settings
- **Hero Slideshow**: Dynamic featured content with movie description, rating, and action buttons
- **Search Bar**: Prominent top search bar with quick navigation
- **Account Management**: Full user authentication with Django backend
- **Homepage**: Trending Movies, Trending Shows, and Trending Anime sections
- **Browse Pages**: Dedicated pages for Movies, TV Shows, and Anime with pagination
- **Video Player**: Embedded video playback using Videasy.net API integration
- **Authentication**: Django-based authentication with PostgreSQL database
- **User Profile**: View watch history and ratings
- **Watchlist**: Save movies and shows to watch later
- **Watch History**: Track what you've watched
- **Settings**: Customize playback and display preferences
- **Rating System**: Rate content and track your ratings
- **Django Admin Panel**: Full admin access to manage users and data
- **Responsive Design**: Optimized for desktop and mobile devices
- **Custom Branding**: "Made by Pratik" tag with logo placeholder

## Django Admin Panel

### Access Admin Panel
- **URL**: `/admin/`
- **Username**: `admin`
- **Email**: `admin@cineverse.com`
- **Password**: `admin123`

### Admin Features
You can view and manage:
- **Users**: All registered users with their email, username, creation date
- **Watchlist Items**: See what content users have saved to watch later
- **Watch History**: Track what content users have watched
- **Ratings**: View user ratings for movies and shows

## Data Storage
All user data is stored in a PostgreSQL database:
- User accounts and authentication
- Watchlist items
- Watch history
- Content ratings

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
4. Request an API key (select "Developer" option)
5. Fill out the form (you can say it's for educational/personal use)
6. Copy your API Key (v3 auth)

### 2. Add API Key to Secrets
The TMDB_API_KEY needs to be added to your Replit Secrets:
1. Open the Secrets panel in Replit
2. Add TMDB_API_KEY with your TMDb API key value
3. Restart the workflow

### 3. Using the Application
The Django server is automatically running on port 5000. Just open the webview to access PirateOne!

**First-time users**: You'll need to register an account to use PirateOne. Click "Sign up now" on the login page.

## Vercel Deployment

### Required Environment Variables for Vercel
When deploying to Vercel, add these environment variables:
- `DATABASE_URL`: Your production PostgreSQL database URL (recommend Neon, Supabase, or Railway)
- `DJANGO_SECRET_KEY`: A secure random string for Django
- `TMDB_API_KEY`: Your TMDb API key
- `DEBUG`: Set to `False` for production

### Running Migrations on Production
After deploying to Vercel, you'll need to run migrations on your production database. You can do this by:
1. Running `python manage.py migrate` locally with your production DATABASE_URL
2. Or using Vercel's build command to run migrations

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
├── watchlist.html      # User watchlist
├── history.html        # Watch history
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   ├── api.js          # API integration (TMDb, AniList, Videasy)
│   ├── auth.js         # Authentication logic with avatar generation
│   ├── django-api.js   # Django backend API client
│   ├── layout.js       # Shared UI components (avatars, branding)
│   ├── main.js         # Homepage functionality
│   ├── player.js       # Video player logic
│   ├── browse.js       # Browse pages logic
│   ├── search.js       # Search functionality
│   └── search-suggestions.js  # Search autocomplete
├── api/                # Django app
│   ├── models.py       # User, WatchlistItem, WatchHistory, Rating models
│   ├── views.py        # API endpoints
│   ├── admin.py        # Admin panel configuration
│   └── urls.py         # API URL routing
├── pirateone_backend/  # Django project settings
│   ├── settings.py     # Django configuration
│   ├── urls.py         # Main URL routing
│   └── wsgi.py         # WSGI for deployment
├── manage.py           # Django management script
├── start_server.sh     # Server startup script
└── vercel.json         # Vercel deployment configuration
```

## How It Works
1. **User Flow**:
   - Register/Login → Browse content → Search/Select content → Watch video → Rate content

2. **Video Playback**:
   - User searches for content → TMDb API fetches data and IDs → IDs passed to Videasy.net API → Video plays in embedded player

3. **Data Storage**:
   - All user data stored in PostgreSQL database via Django ORM
   - Authentication handled by Django session management
   - Data persists across devices when logged in

## Technologies Used
- **Backend**: Django 5.2, PostgreSQL, WhiteNoise
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: 
  - TMDb API (movies & TV shows data)
  - AniList GraphQL API (anime data)
  - Videasy.net Embed API (video playback)
  - DiceBear Avatars API (user profile pictures)
- **Database**: PostgreSQL (Replit/Neon)
- **Deployment**: Vercel (configured)

## Recent Changes
- 2025-12-19: Fixed static file serving and admin panel styling
  - Fixed DEBUG setting to True for development static file serving
  - Collected Django static files (137 files) for admin panel
  - Added /static/ route to serve admin CSS and JS files
  - Admin panel now displays with perfect styling
  - Build script now includes collectstatic for Vercel deployment
- 2025-12-18: Added Django backend with admin panel
  - Implemented Django backend with PostgreSQL database
  - Created admin panel to manage users, watchlists, history, and ratings
  - Admin credentials: admin@cineverse.com / admin123
  - Updated frontend to use Django API for authentication
  - Configured Vercel deployment for Django
- 2025-11-07: Avatar and branding enhancements
  - Integrated DiceBear Avatars API for unique user profile pictures
  - Each user gets a random, unique avatar based on their email/ID
  - Avatars display in profile dropdown and account circle
  - Made "Made by Pratik" branding clickable to redirect to portfolio
  - Created layout.js for shared UI components across all pages
  - Search page now fully functional with auto-redirect and filters
- 2025-11-07: Complete UI/UX redesign with new layout
  - Implemented dark black (#000000) and #44BB91 color theme
  - Created dual-box sidebar layout with 1:4 ratio and smooth rounded corners
  - Added hero slideshow section for featured content
  - Redesigned top navigation with centered search bar and account options
  - Added footer disclaimer and "made by pratik" branding
  - All navigation items now include SVG icons
- 2024-01-07: Initial project creation
  - Complete frontend implementation with all features
  - API integration for TMDb, AniList, and Videasy.net
  - Responsive design and mobile optimization

## User Preferences
- Dark theme with Netflix-inspired design
- Django backend with PostgreSQL database
- Admin panel for data management
- Vercel-compatible deployment

## Attribution
**Made by Pratik**

## Notes
- This is a demo/educational project
- API keys should be kept secure in production
- Change the admin password before deploying to production!
- Videasy.net API may have usage limits
- Anime playback through Videasy may be limited (depends on Videasy's anime support)
