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

2. **Configure TMDB Read Access Token**:
   Get an **API Read Access Token** (v4) at [themoviedb.org](https://www.themoviedb.org/settings/api).
   Copy `.env.example` to `.env` and set your token:
   ```bash
   cp .env.example .env
   ```
   ```env
   TMDB_TOKEN=your_read_access_token_here
   ```
   *(All requests are routed securely through the `/api/tmdb` serverless proxy with 1-hour caching. The token is never exposed to client browsers).*

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
api/
  tmdb.js                 Serverless API proxy (Vercel / Node) injecting TMDB_TOKEN
src/
  api/
    analytics.js          Client-side security, consent, and user preferences
    tmdb.js               TMDB dynamic client with Map + sessionStorage caching
  components/
    CookieBanner.jsx      Privacy consent banner (analytics storage control)
    MonsterAuth.jsx       Sliding blade authentication modal
    MovieModal.jsx        Movie details, cast, crew, and privacy trailer player
    ShowtimesModal.jsx    38-district Tamil Nadu theater directory & BMS shortcuts
    SearchBar.jsx         Marquee search bar with quick filters
    MovieGrid.jsx         Responsive posters grid with lazy loading
  config/
    constants.js          Shared application constants (CONTACT_EMAIL)
  data/
    overrides.json        Manual movie metadata overrides
    theaters.js           Tamil Nadu 38-district cinema directory data
  utils/
    tmdbCache.js          In-memory Map + sessionStorage TTL cache helper
    tmdbValidation.js     Safe path validation and SSRF prevention
  test/
    analytics.test.js     Unit tests for auth security and import allowlisting
    tmdbValidation.test.js Path validation and prefix security tests
    tmdbCache.test.js     Cache TTL and expiration unit tests
```

## Security & Disclosures

- **Showtimes & Ticketing**: Live seat maps, dynamic pricing, and seat allocation are powered by BookMyShow. Reelist indexes theater directories and provides direct booking shortcuts.
- **Local Storage**: User profiles, custom ratings, and watchlists are kept in client storage unless connected to a cloud database.
- **Server-Side API Token**: All TMDB requests are routed through `/api/tmdb` serverless proxy using `TMDB_TOKEN`. No API keys or tokens are embedded in client bundles.
