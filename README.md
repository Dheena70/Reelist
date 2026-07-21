# Reelist — Movie Explorer

A responsive movie search app built with React, the TMDB API, and Bootstrap.
Browse what's trending this week, search any title, and open a detail view
with rating, overview, genres, and cast.

## Features

- Trending movies on load (TMDB `/trending/movie/week`)
- Real-time title search (TMDB `/search/movie`)
- Detail modal with rating, overview, genres, runtime, and top cast
- Responsive grid, from phone to desktop
- Loading skeletons and empty/error states
- Cinema-marquee visual theme (film-sprocket borders, stamped rating badges)

## Tech

React 18, Vite, Bootstrap 5, TMDB API, CSS.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Get a free TMDB API key at https://www.themoviedb.org/settings/api
   (the "API Read Access Token" page — use the **API Key (v3 auth)** value).
3. Copy `.env.example` to `.env` and paste your key:
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_TMDB_API_KEY=your_key_here
   ```
   No `.env`? No problem — the app will prompt you to paste a key on first
   load and remember it in your browser instead.
4. Run it:
   ```bash
   npm run dev
   ```

## Project structure

```
src/
  api/tmdb.js            TMDB fetch wrapper + image URL helpers
  components/
    SearchBar.jsx         Marquee-style search input
    MovieGrid.jsx         Grid + loading/empty/error states
    MovieCard.jsx         Poster card with rating badge
    RatingBadge.jsx       Color-coded score badge
    MovieModal.jsx        Full detail view (overview, genres, cast)
    ApiKeyGate.jsx        First-run screen for entering a TMDB key
  App.jsx                 Page composition + data fetching
  App.css                 Theme and layout styles
```

## Build for production

```bash
npm run build
npm run preview
```
