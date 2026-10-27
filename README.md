# Reelist — Cinema & Theater Explorer

A high-performance cinematic discovery and theater directory single-page application built with React 18, Vite, Lucide React, and the TMDB API.

Browse what's trending, filter by regional languages (Tamil, Telugu, Hindi, Malayalam, Kannada), view trailer spotlights, and discover theater schedules across all 38 districts of Tamil Nadu.

## Features

- **Regional & Global Discovery**: Trending movies, TV shows, and regional catalog filters (Tamil, Telugu, Hindi, Malayalam, Kannada).
- **Comprehensive Theaters Directory**: Browse cinema halls across all 38 Tamil Nadu districts with BookMyShow quick-booking links.
- **Privacy-First YouTube Trailers**: Trailers loaded securely via `youtube-nocookie.com` with `strict-origin-when-cross-origin` referrer policy.
- **GDPR & Privacy Consent**: Built-in cookie and telemetry banner with default-denied analytics storage until explicit user consent.
- **Secure Client Architecture**: PBKDF2 credential hashing, allowlisted backup import/export, and zero synthetic metric inflation.
- **Cinema-Marquee Design**: Custom CSS styling with retro film-sprocket borders, responsive modal sheets, and smooth sliding blade authentication.

## Tech Stack

- **Framework**: React 18
- **Bundler & Tooling**: Vite 5
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library + jsdom
- **Data**: TMDB API + Regional Theater Directory
- **CI**: GitHub Actions (Lint, Test, Build)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure TMDB API Key**:
   Get a free TMDB API key at [themoviedb.org](https://www.themoviedb.org/settings/api).
   Copy `.env.example` to `.env` and set your key:
   ```bash
   cp .env.example .env
   ```
   ```env
   VITE_TMDB_API_KEY=your_key_here
   ```
   *(If no `.env` is provided, Reelist provides an on-screen gate to paste your key into browser storage.)*

3. **Development Server**:
   ```bash
   npm run dev
   ```

4. **Run Unit Tests**:
   ```bash
   npm test
   ```

5. **Linting**:
   ```bash
   npm run lint
   ```

6. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

## Directory Structure

```text
src/
  api/
    analytics.js          Client-side security, consent, and user preferences
    tmdb.js               TMDB API client and regional fallback catalog
  components/
    CookieBanner.jsx      Privacy consent banner (analytics storage control)
    MonsterAuth.jsx       Sliding blade authentication modal
    MovieModal.jsx        Movie details, cast, crew, and privacy trailer player
    ShowtimesModal.jsx    38-district Tamil Nadu theater directory & BMS shortcuts
    SearchBar.jsx         Marquee search bar with quick filters
    MovieGrid.jsx         Responsive posters grid with lazy loading
  data/
    theaters.js           Tamil Nadu 38-district cinema directory data
  test/
    analytics.test.js     Vitest unit tests for security and import validation
```

## Security & Disclosures

- **Showtimes & Ticketing**: Live seat maps, dynamic pricing, and seat allocation are powered by BookMyShow. Reelist indexes theater directories and provides direct booking shortcuts.
- **Local Storage**: User profiles, custom ratings, and watchlists are kept in client storage unless connected to a cloud database.
- **API Protection**: For high-volume production deployments, route TMDB requests through a serverless proxy (Cloudflare Worker or Vercel function) to prevent key exposure.
