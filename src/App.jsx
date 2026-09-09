import { useEffect, useMemo, useState } from 'react';
import {
  Clapperboard,
  BarChart3,
  Crown,
  LogOut,
  Eye,
  Calendar,
  Search,
} from 'lucide-react';
import { tmdb } from './api/tmdb.js';
import { analytics } from './api/analytics.js';
import SearchBar from './components/SearchBar.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import MovieModal from './components/MovieModal.jsx';
import InTheatersSection from './components/InTheatersSection.jsx';
import ShowtimesModal from './components/ShowtimesModal.jsx';
import ApiKeyGate from './components/ApiKeyGate.jsx';
import MonsterAuth from './components/MonsterAuth.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import TheaterScreen from './components/TheaterScreen.jsx';

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
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showtimesMovie, setShowtimesMovie] = useState(null);

  const syncAdminState = () => {
    const user = analytics.getCurrentUser();
    setCurrentUser(user);
    const admin = analytics.isAdminLoggedIn();
    setIsAdmin(admin);
    setVisitorCount(analytics.getStats().totalVisitors);
  };

  const handleLogout = () => {
    analytics.logout();
    setCurrentUser(null);
    setIsAdmin(false);
    setShowAdmin(false);
    setShowCurtain(false);
  };

  // Track visitor on mount (exclude administrators)
  useEffect(() => {
    const user = analytics.getCurrentUser();
    if (user && !analytics.isAdminLoggedIn()) {
      analytics.recordVisit();
    }
    syncAdminState();
  }, []);

  const mode = activeQuery ? 'search' : 'trending';

  const heading = useMemo(() => {
    if (mode === 'search') return `Results for "${activeQuery}"`;
    return 'Trending this week';
  }, [mode, activeQuery]);

  const stats = useMemo(() => analytics.getStats(), [visitorCount, reloadTrigger, showAdmin]);

  const handleRetry = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  const handleSearchSubmit = (val) => {
    const trimmed = val.trim();
    if (trimmed) {
      analytics.recordSearch(trimmed);
    }
    if (trimmed === activeQuery) {
      // Force refetch if submitting same query
      setReloadTrigger((prev) => prev + 1);
    } else {
      setActiveQuery(trimmed);
    }
  };

  useEffect(() => {
    if (!currentUser || !hasKey) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const request = activeQuery ? tmdb.search(activeQuery) : tmdb.trending();

    request
      .then((data) => {
        if (cancelled) return;
        setMovies(data.results || []);
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
  }, [activeQuery, hasKey, reloadTrigger, currentUser]);

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
      <>
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
      </>
    );
  }

  return (
    <div className="app">
      {showCurtain && <TheaterScreen onEnter={() => setShowCurtain(false)} />}
      <nav className="top-nav">
        <div className="top-nav__brand">
          <span className="top-nav__logo">REELIST</span>
          {isAdmin && (
            <div className="top-nav__visitor-capsule" title="Live Audience Visitors (Admin Only)">
              <span className="live-ping">
                <span className="live-ping__circle" />
                <span className="live-ping__dot" />
              </span>
              <span className="visitor-capsule__label">Live Visitors:</span>
              <span className="visitor-capsule__count">{visitorCount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="top-nav__actions">
          {isAdmin && (
            <button
              type="button"
              className={`top-nav__btn ${showAdmin ? 'top-nav__btn--active-admin' : 'top-nav__btn--admin'}`}
              onClick={() => setShowAdmin((prev) => !prev)}
              title={showAdmin ? 'Switch to Movie Marquee' : 'Switch to Admin Dashboard'}
            >
              {showAdmin ? (
                <>
                  <Clapperboard size={15} />
                  <span>Movie Marquee</span>
                </>
              ) : (
                <>
                  <BarChart3 size={15} />
                  <span>Admin Dashboard ({visitorCount})</span>
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
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </nav>

      {/* Prominent Admin Status Strip for the Administrator on Movie Marquee */}
      {isAdmin && !showAdmin && (
        <div className="admin-status-strip">
          <div className="admin-status-strip__inner">
            <div className="admin-status-strip__left">
              <span className="admin-badge">
                <span className="admin-badge__pulse" />
                ADMIN PROJECTION MODE
              </span>
              <span className="admin-status-strip__stat">
                <Eye size={14} className="stat-strip-icon" />
                <span>Live Visitors:</span> <strong>{visitorCount.toLocaleString()}</strong>
              </span>
              <span className="admin-status-strip__stat">
                <Calendar size={14} className="stat-strip-icon" />
                <span>Today:</span> <strong>{stats.todayVisitors.toLocaleString()}</strong>
              </span>
              <span className="admin-status-strip__stat">
                <Search size={14} className="stat-strip-icon" />
                <span>Searches:</span> <strong>{stats.totalSearches.toLocaleString()}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {showAdmin && isAdmin ? (
        <AdminDashboard onSwitchToMovies={() => setShowAdmin(false)} />
      ) : (
        <>
          <header className="hero">
            <div className="hero__sprockets" aria-hidden="true">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>
            <p className="hero__eyebrow">Now screening</p>
            <h1 className="hero__title">REELIST</h1>
            <p className="hero__subtitle">Find what's trending, or search the whole marquee.</p>
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearchSubmit}
            />
            {(activeQuery || isAdmin) && (
              <div className="hero__actions">
                {activeQuery && (
                  <button
                    type="button"
                    className="hero__action-btn"
                    onClick={() => {
                      setQuery('');
                      setActiveQuery('');
                    }}
                  >
                    ← Back to trending
                  </button>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    className="hero__action-btn hero__action-btn--admin"
                    onClick={() => setShowAdmin(true)}
                    title="Admin Account — Click to view visitor dashboard"
                  >
                    <Eye size={14} />
                    <span>{visitorCount.toLocaleString()} Visitors (Admin Dashboard)</span>
                  </button>
                )}
              </div>
            )}
            <div className="hero__sprockets hero__sprockets--bottom" aria-hidden="true">
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>
          </header>

          <main className="container">
            <h2 className="section-heading">{heading}</h2>
            <MovieGrid
              movies={movies}
              loading={loading}
              error={error}
              emptyLabel="Try another title, or check the spelling."
              onSelect={(movie) => {
                analytics.recordMovieView();
                setSelectedId(movie.id);
              }}
              onRetry={handleRetry}
            />

            {/* Dedicated Theatrical Showcase Section matching user screenshots */}
            <InTheatersSection
              onSelectMovie={(movie) => {
                analytics.recordMovieView();
                setSelectedId(movie.id);
              }}
              onOpenShowtimes={(movie) => setShowtimesMovie(movie)}
            />
          </main>
        </>
      )}

      {selectedId && (
        <MovieModal
          movieId={selectedId}
          onClose={() => setSelectedId(null)}
          onSelectMovie={(movie) => setSelectedId(movie.id)}
        />
      )}

      {showtimesMovie && (
        <ShowtimesModal
          movie={showtimesMovie}
          onClose={() => setShowtimesMovie(null)}
          onWatchTrailer={(movie) => {
            setShowtimesMovie(null);
            setSelectedId(movie.id);
          }}
        />
      )}
    </div>
  );
}
