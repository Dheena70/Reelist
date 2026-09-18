import { useEffect, useMemo, useState, useRef, useCallback, lazy, Suspense } from 'react';
import {
  Clapperboard,
  BarChart3,
  Crown,
  DoorOpen,
  Film,
  Tv,
  Globe,
} from 'lucide-react';
import { tmdb } from './api/tmdb.js';
import { analytics } from './api/analytics.js';
import SearchBar from './components/SearchBar.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import MonsterAuth from './components/MonsterAuth.jsx';
import SearchSpotlight from './components/SearchSpotlight.jsx';
import ArtistSpotlight from './components/ArtistSpotlight.jsx';

const MovieModal = lazy(() => import('./components/MovieModal.jsx'));
const ShowtimesModal = lazy(() => import('./components/ShowtimesModal.jsx'));
const ApiKeyGate = lazy(() => import('./components/ApiKeyGate.jsx'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard.jsx'));
const TheaterScreen = lazy(() => import('./components/TheaterScreen.jsx'));

function getUserInitials(user) {
  if (!user) return 'U';
  const name = (user.name || '').trim();
  const email = (user.email || '').trim();

  // If user has a customized name, use it; else parse email username
  const raw =
    name && name !== 'Administrator' && name !== 'Viewer' && name !== 'Guest Viewer'
      ? name
      : (email.includes('@') ? email.split('@')[0] : email);

  const clean = raw.toLowerCase().trim();

  // Handle specific cases requested by user: e.g. "rdheena" -> "RD"
  if (clean.startsWith('rdheena') || clean.startsWith('rd')) {
    return 'RD';
  }

  // Handle multi-word names: e.g. "R Dheena" -> "RD"
  const parts = raw.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2 && parts[0].length === 1 && parts[1].length >= 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Single letter initial: e.g. "deepa" -> "D"
  return (raw.charAt(0) || 'U').toUpperCase();
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => analytics.getCurrentUser());
  const [showCurtain, setShowCurtain] = useState(false);
  const [hasKey, setHasKey] = useState(!!tmdb.getApiKey());
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => analytics.isAdminLoggedIn());
  const [showAdmin, setShowAdmin] = useState(() => analytics.isAdminLoggedIn());
  const [visitorCount, setVisitorCount] = useState(() => analytics.getStats().totalVisitors);
  const [keyError, setKeyError] = useState('');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [matchedArtist, setMatchedArtist] = useState(null);
  const [similarArtists, setSimilarArtists] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [mediaType, setMediaType] = useState('movie'); // 'movie' | 'tv'
  const [catalogLanguage, setCatalogLanguage] = useState('all');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showtimesMovie, setShowtimesMovie] = useState(null);

  const displayedCatalogMovies = useMemo(() => {
    if (catalogLanguage === 'all') return movies;
    return movies.filter((m) => (m.original_language || '').toLowerCase() === catalogLanguage.toLowerCase());
  }, [movies, catalogLanguage]);

  const syncAdminState = () => {
    const user = analytics.getCurrentUser();
    setCurrentUser(user);
    const admin = analytics.isAdminLoggedIn();
    setIsAdmin(admin);
    setVisitorCount(analytics.getStats().totalVisitors);
  };

  const handleLogout = useCallback(() => {
    analytics.logout();
    setCurrentUser(null);
    setIsAdmin(false);
    setShowAdmin(false);
    setShowCurtain(false);
  }, []);

  // Track visitor on mount (exclude administrators)
  useEffect(() => {
    const user = analytics.getCurrentUser();
    if (user && !analytics.isAdminLoggedIn()) {
      analytics.recordVisit();
    }
    syncAdminState();
  }, []);

  // Smart auto-hiding navbar on scroll ("vanthu pora maari")
  const [navVisible, setNavVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(currentScrollY > 20);

          if (currentScrollY <= 60) {
            // Near top: always visible
            setNavVisible(true);
          } else if (currentScrollY > lastScrollY.current + 8) {
            // Scrolling down: hide header
            setNavVisible(false);
          } else if (currentScrollY < lastScrollY.current - 8) {
            // Scrolling up: show header
            setNavVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mode = activeQuery ? 'search' : 'trending';

  const heading = useMemo(() => {
    if (mode === 'search') return `Results for "${activeQuery}"`;
    return mediaType === 'tv' ? 'Trending TV Shows & Web Series' : 'Trending Movies This Week';
  }, [mode, activeQuery, mediaType]);

  const handleRetry = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const handleSearchSubmit = useCallback((val) => {
    const trimmed = val.trim();
    if (trimmed) {
      analytics.recordSearch(trimmed);
    }
    setMatchedArtist(null);
    setSimilarArtists([]);
    if (trimmed === activeQuery) {
      // Force refetch if submitting same query
      setReloadTrigger((prev) => prev + 1);
    } else {
      setActiveQuery(trimmed);
    }
  }, [activeQuery]);

  const handleSelectMovie = useCallback((movie) => {
    analytics.recordMovieView();
    setSelectedId(movie.id);
  }, []);

  const handleOpenShowtimes = useCallback((movie) => {
    setShowtimesMovie(movie);
  }, []);

  const handleSelectArtist = useCallback(async (artistSummary) => {
    if (!artistSummary) return;
    setLoading(true);
    try {
      const full = await tmdb.personDetails(artistSummary.id || artistSummary.tmdb_id);
      if (full) {
        setMatchedArtist(full);
      }
    } catch (err) {
      console.error('Failed to load artist details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser || !hasKey) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const request = activeQuery
      ? tmdb.search(activeQuery)
      : (mediaType === 'tv' ? tmdb.trendingTv('week') : tmdb.trending('week'));

    request
      .then((data) => {
        if (cancelled) return;
        setMovies(data.results || []);
        setMatchedArtist(data.artist || null);
        setSimilarArtists(data.similarArtists || []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.code === 'INVALID_API_KEY' || err.code === 'MISSING_API_KEY') {
          setKeyError('Your TMDB key was rejected (401 Unauthorized). Please check or re-enter it.');
          setHasKey(false);
        } else {
          setError('Something went wrong reaching TMDB. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeQuery, hasKey, reloadTrigger, currentUser, mediaType]);

  // Gatekeeper: Website front door MUST be the MonsterAuth login screen
  if (!currentUser) {
    return (
      <div className="auth-landing-screen">
        <MonsterAuth
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            const admin = user.role === 'admin';
            setIsAdmin(admin);
            setShowAdmin(admin);
            setVisitorCount(analytics.getStats().totalVisitors);
            setShowCurtain(true);
          }}
        />
      </div>
    );
  }

  if (!hasKey || isEditingKey) {
    return (
      <Suspense fallback={<div className="modal-loading-gate" />}>
        {showCurtain && <TheaterScreen onEnter={() => setShowCurtain(false)} />}
        <ApiKeyGate
          errorMessage={keyError}
          canCancel={hasKey && isEditingKey}
          onCancel={() => {
            setKeyError('');
            setIsEditingKey(false);
          }}
          onSaved={() => {
            setHasKey(true);
            setKeyError('');
            setIsEditingKey(false);
            setReloadTrigger((prev) => prev + 1);
          }}
          onOpenAdmin={isAdmin ? () => setShowAdmin(true) : null}
        />
      </Suspense>
    );
  }

  return (
    <div className="app">
      {showCurtain && (
        <Suspense fallback={null}>
          <TheaterScreen onEnter={() => setShowCurtain(false)} />
        </Suspense>
      )}
      <nav
        className={`top-nav ${navVisible ? 'top-nav--visible' : 'top-nav--hidden'} ${
          isScrolled ? 'top-nav--scrolled' : ''
        } ${selectedId || showtimesMovie ? 'top-nav--modal-open' : ''}`}
      >
        <div className="top-nav__brand">
          <span className="top-nav__logo">REELIST</span>
        </div>

        <div className="top-nav__actions">
          {isAdmin && (
            <button
              type="button"
              className={`top-nav__btn ${showAdmin ? 'top-nav__btn--active-admin' : 'top-nav__btn--admin'}`}
              onClick={() => setShowAdmin((prev) => !prev)}
              title={showAdmin ? 'Switch to Movie Marquee' : 'Open Admin Dashboard'}
            >
              {showAdmin ? (
                <>
                  <Clapperboard size={15} />
                  <span>Movie Marquee</span>
                </>
              ) : (
                <>
                  <BarChart3 size={15} />
                  <span>Admin Dashboard</span>
                </>
              )}
            </button>
          )}
          <div
            className={`top-nav__user-avatar ${isAdmin ? 'top-nav__user-avatar--admin' : ''}`}
            title={currentUser.email ? `${isAdmin ? 'Admin: ' : 'User: '}${currentUser.email}` : 'User Profile'}
          >
            {isAdmin && (
              <span className="top-nav__avatar-crown">
                <Crown size={12} />
              </span>
            )}
            <span className="top-nav__avatar-text">{getUserInitials(currentUser)}</span>
          </div>
          <button
            type="button"
            className="top-nav__btn top-nav__btn--logout"
            onClick={handleLogout}
            title="Log out and return to login screen"
          >
            <DoorOpen size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </nav>

      {showAdmin && isAdmin ? (
        <Suspense fallback={<div className="container"><p className="state-panel__title">Loading Admin Dashboard…</p></div>}>
          <AdminDashboard onSwitchToMovies={() => setShowAdmin(false)} />
        </Suspense>
      ) : (
        <>
          <header className="hero">
            <p className="hero__eyebrow">Now screening</p>
            <h1 className="hero__title">Explore Cinema</h1>
            <p className="hero__subtitle">Find what's trending, or search the whole marquee.</p>
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearchSubmit}
            />
            {activeQuery && (
              <div className="hero__actions">
                <button
                  type="button"
                  className="hero__action-btn"
                  onClick={() => {
                    setQuery('');
                    setActiveQuery('');
                    setMatchedArtist(null);
                    setSimilarArtists([]);
                  }}
                >
                  ← Back to trending
                </button>
              </div>
            )}
          </header>

          <main className="container">
            {mode === 'search' ? (
              /* Search Results View */
              <section className="search-results-section" aria-label="Search results">
                {matchedArtist ? (
                  /* Dedicated Artist Spotlight & Complete Multilingual Filmography */
                  <ArtistSpotlight
                    artist={matchedArtist}
                    similarArtists={similarArtists}
                    onSelectArtist={handleSelectArtist}
                    onSelectMovie={handleSelectMovie}
                  />
                ) : (
                  <>
                    <h2 className="section-heading">{heading}</h2>

                    {/* Google Search Spotlight Knowledge Card for top match */}
                    {!loading && movies.length > 0 && (
                      <SearchSpotlight
                        movie={movies[0]}
                        onSelectMovie={handleSelectMovie}
                        onOpenShowtimes={handleOpenShowtimes}
                      />
                    )}

                    <MovieGrid
                      movies={movies}
                      loading={loading}
                      error={error}
                      emptyLabel="Try another title, series, or artist name, or check the spelling."
                      onSelect={handleSelectMovie}
                      onRetry={handleRetry}
                    />
                  </>
                )}
              </section>
            ) : (
              /* Home / Explore View */
              <>
                {/* Global Trending & Acclaimed Catalog Section */}
                <section className="trending-catalog-section" aria-labelledby="trending-heading">
                  <div className="section-header-wrap section-header-wrap--with-toggle">
                    <div className="section-header-left">
                      <h2 id="trending-heading" className="section-heading">
                        {mediaType === 'tv' ? 'Trending TV Shows & Series' : 'Trending Movies This Week'}
                      </h2>
                      <p className="section-subheading">
                        {mediaType === 'tv'
                          ? 'Binge-worthy web series, critically acclaimed dramas & fan-favorite TV shows'
                          : 'Now Screening — July to September 2026 Blockbusters'}
                      </p>
                    </div>

                    <div className="media-format-switcher" role="tablist" aria-label="Media format switcher">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={mediaType === 'movie'}
                        className={`format-switch-btn ${mediaType === 'movie' ? 'is-active' : ''}`}
                        onClick={() => setMediaType('movie')}
                      >
                        <Film size={15} />
                        <span>All Movies</span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={mediaType === 'tv'}
                        className={`format-switch-btn ${mediaType === 'tv' ? 'is-active' : ''}`}
                        onClick={() => setMediaType('tv')}
                      >
                        <Tv size={15} />
                        <span>TV Shows & Web Series</span>
                      </button>
                    </div>
                  </div>

                  <div className="catalog-language-bar-wrap">
                    <div className="catalog-language-bar" role="tablist" aria-label="Filter by language">
                      {[
                        { code: 'all', label: 'All Releases', isAll: true },
                        { code: 'ta', label: 'Tamil (தமிழ்)' },
                        { code: 'te', label: 'Telugu (తెలుగు)' },
                        { code: 'hi', label: 'Hindi (हिंदी)' },
                        { code: 'ml', label: 'Malayalam (മലയാളം)' },
                        { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
                        { code: 'en', label: 'English / Global' },
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          role="tab"
                          aria-selected={catalogLanguage === lang.code}
                          className={`catalog-lang-chip ${catalogLanguage === lang.code ? 'is-active' : ''}`}
                          onClick={() => setCatalogLanguage(lang.code)}
                        >
                          {lang.isAll && <Globe size={13} className="catalog-lang-icon" />}
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <MovieGrid
                    movies={displayedCatalogMovies}
                    loading={loading}
                    error={error}
                    emptyLabel="No titles found in this language. Try another filter."
                    onSelect={handleSelectMovie}
                    onRetry={handleRetry}
                  />
                </section>
              </>
            )}
          </main>
        </>
      )}

      {selectedId && (
        <Suspense fallback={null}>
          <MovieModal
            movieId={selectedId}
            onClose={() => setSelectedId(null)}
            onSelectMovie={(movie) => setSelectedId(movie.id)}
          />
        </Suspense>
      )}

      {showtimesMovie && (
        <Suspense fallback={null}>
          <ShowtimesModal
            movie={showtimesMovie}
            onClose={() => setShowtimesMovie(null)}
            onSelectMovie={(movie) => setShowtimesMovie(movie)}
            onWatchTrailer={(movie) => {
              setShowtimesMovie(null);
              setSelectedId(movie.id);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
