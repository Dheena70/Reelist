import { useEffect, useMemo, useState, useRef, useCallback, lazy, Suspense } from 'react';
import {
  DoorOpen,
  Film,
  Tv,
  Globe,
  Ticket,
  Sparkles,
  Search,
  Mail,
  Calendar,
} from 'lucide-react';
import { tmdb, getLanguageLabel } from './api/tmdb.js';
import { analytics } from './api/analytics.js';
import { updatePageMeta } from './utils/meta.js';
import SearchBar from './components/SearchBar.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import MonsterAuth from './components/MonsterAuth.jsx';
import SearchSpotlight from './components/SearchSpotlight.jsx';
import ArtistSpotlight from './components/ArtistSpotlight.jsx';
import Footer from './components/Footer.jsx';
import CookieBanner from './components/CookieBanner.jsx';

const MovieModal = lazy(() => import('./components/MovieModal.jsx'));
const ShowtimesModal = lazy(() => import('./components/ShowtimesModal.jsx'));
const TheaterScreen = lazy(() => import('./components/TheaterScreen.jsx'));
const NotFound = lazy(() => import('./components/NotFound.jsx'));
const PrivacyPolicyModal = lazy(() => import('./components/PrivacyPolicyModal.jsx'));
const TermsModal = lazy(() => import('./components/TermsModal.jsx'));
const ContactModal = lazy(() => import('./components/ContactModal.jsx'));
const ThankYouModal = lazy(() => import('./components/ThankYouModal.jsx'));
const UserProfileModal = lazy(() => import('./components/UserProfileModal.jsx'));

function getUserInitials(user) {
  if (!user) return 'U';
  const name = (user.name || '').trim();
  const email = (user.email || '').trim();

  // If user has a customized name, use it; else parse email username
  const raw =
    name && name !== 'Administrator' && name !== 'Viewer' && name !== 'Guest Viewer'
      ? name
      : (email.includes('@') ? email.split('@')[0] : email);

  const parts = raw.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Single letter initial
  return (raw.charAt(0) || 'U').toUpperCase();
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => analytics.getCurrentUser());
  const [showCurtain, setShowCurtain] = useState(false);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [matchedArtist, setMatchedArtist] = useState(null);
  const [similarArtists, setSimilarArtists] = useState([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [activeSection, setActiveSection] = useState('trending'); // 'trending' | 'now_playing' | 'upcoming'
  const [mediaType, setMediaType] = useState('movie'); // 'movie' | 'tv'
  const [catalogLanguage, setCatalogLanguage] = useState('all');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showtimesMovie, setShowtimesMovie] = useState(null);
  const [show404Page, setShow404Page] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.includes('404') || window.location.hash.includes('404');
  });
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'privacy' | 'terms' | 'contact' | 'thank-you'
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem('reelist_onboarded_dismissed');
    } catch {
      return false;
    }
  });
  const [lastInquiry, setLastInquiry] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Synchronize URL hash for routing and SPA fallback navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/404' || hash === '#404') {
        setShow404Page(true);
      } else if (hash === '#/privacy' || hash === '#privacy') {
        setActiveLegalModal('privacy');
      } else if (hash === '#/terms' || hash === '#terms') {
        setActiveLegalModal('terms');
      } else if (hash === '#/contact' || hash === '#contact') {
        setActiveLegalModal('contact');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Synchronize dynamic meta tags and titles per view / modal
  useEffect(() => {
    if (show404Page) {
      updatePageMeta({
        title: '404 — Scene Not Found',
        description: 'The requested scene or page was cut from the marquee. Return to our September, August & July 2026 blockbusters.',
        path: '404',
      });
    } else if (activeLegalModal === 'privacy') {
      updatePageMeta({
        title: 'Privacy Policy',
        description: 'Learn how Reelist Cinema Technologies protects your privacy, watchlist storage, and personal credentials.',
        path: 'privacy',
      });
    } else if (activeLegalModal === 'terms') {
      updatePageMeta({
        title: 'Terms and Conditions',
        description: 'Review Reelist service terms, intellectual property standards, cinema ticketing notices, and TMDB attributions.',
        path: 'terms',
      });
    } else if (activeLegalModal === 'contact') {
      updatePageMeta({
        title: 'Contact Reelist Cinema Concierge',
        description: 'Get in touch with Reelist Cinema Technologies headquarters in Chennai for inquiries, movie suggestions, or support.',
        path: 'contact',
      });
    } else if (activeLegalModal === 'thank-you') {
      updatePageMeta({
        title: 'Thank You — Message Received',
        description: 'Thank you for reaching out to Reelist. Our concierge desk will review your inquiry shortly.',
        path: 'thank-you',
      });
    } else if (selectedId) {
      const activeMovie = movies.find((m) => m.id === selectedId);
      const title = activeMovie?.title || 'Movie Details';
      const year = activeMovie?.release_date ? activeMovie.release_date.slice(0, 4) : '2026';
      updatePageMeta({
        title: `${title} (${year}) — Official 4K Trailer & Ratings`,
        description: `Watch the official trailer for ${title} (${year}), view cast, streaming OTT platforms, and cinema showtimes on Reelist.`,
        path: `movie/${selectedId}`,
      });
    } else if (activeQuery) {
      updatePageMeta({
        title: `Search: "${activeQuery}"`,
        description: `Explore search results for "${activeQuery}" across 2026 theatrical releases, cast, and artists on Reelist.`,
        path: `search?q=${encodeURIComponent(activeQuery)}`,
      });
    } else {
      updatePageMeta({
        title: 'Reelist — Explore September, August & July 2026 Blockbusters',
        description: 'Discover the freshest theatrical blockbusters released in September, August & July 2026 across Tamil, Telugu, Hindi, Malayalam, Kannada & Global cinema with official 4K trailers.',
        path: '',
      });
    }
  }, [show404Page, activeLegalModal, selectedId, activeQuery, movies]);

  const displayedCatalogMovies = useMemo(() => {
    return movies;
  }, [movies]);

  const syncUserState = () => {
    const user = analytics.getCurrentUser();
    setCurrentUser(user);
  };

  const handleLogout = useCallback(() => {
    analytics.logout();
    setCurrentUser(null);
    setShowCurtain(false);
  }, []);

  // Track visitor on mount
  useEffect(() => {
    const user = analytics.getCurrentUser();
    if (user) {
      analytics.recordVisit();
    }
    syncUserState();
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

  const requireAuth = useCallback((reason, action = null) => {
    setAuthModalReason(reason || 'Sign in to your Reelist account');
    setPendingAction(action);
    setShowAuthModal(true);
  }, []);

  const handleAuthSuccess = useCallback((user) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    setShowCurtain(true);

    if (pendingAction) {
      if (pendingAction.type === 'search' && pendingAction.query) {
        setQuery(pendingAction.query);
        setActiveQuery(pendingAction.query);
        analytics.recordSearch(pendingAction.query);
      } else if (pendingAction.type === 'rate' && pendingAction.movieId && pendingAction.score) {
        try {
          localStorage.setItem(`reelist_rating_${pendingAction.movieId}`, String(pendingAction.score));
        } catch {
          // ignore
        }
      } else if (pendingAction.type === 'reaction' && pendingAction.movieId && pendingAction.key) {
        try {
          const currentMy = JSON.parse(localStorage.getItem(`reelist_my_reactions_${pendingAction.movieId}`) || '{}');
          currentMy[pendingAction.key] = true;
          localStorage.setItem(`reelist_my_reactions_${pendingAction.movieId}`, JSON.stringify(currentMy));
        } catch {
          // ignore
        }
      } else if (pendingAction.type === 'watchlist' && pendingAction.movieId) {
        try {
          const list = JSON.parse(localStorage.getItem('reelist_watchlist') || '[]');
          if (!list.includes(pendingAction.movieId)) {
            list.push(pendingAction.movieId);
            localStorage.setItem('reelist_watchlist', JSON.stringify(list));
          }
        } catch {
          // ignore
        }
      }
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handleSearchSubmit = useCallback((val) => {
    const trimmed = val.trim();
    if (!currentUser) {
      requireAuth('Sign in to search for movies, web series, and artists', {
        type: 'search',
        query: trimmed,
      });
      return;
    }
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
  }, [currentUser, activeQuery, requireAuth]);

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
    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setError(null);

    async function fetchCatalog() {
      try {
        if (activeQuery) {
          const data = await tmdb.search(activeQuery, 1, signal);
          setMovies(data?.results || []);
          setMatchedArtist(data?.artist || null);
          setSimilarArtists(data?.similarArtists || []);
          return;
        }

        let data;
        if (catalogLanguage !== 'all') {
          data = await tmdb.regional(catalogLanguage, 1, signal);
        } else if (activeSection === 'now_playing') {
          data = await tmdb.nowPlaying(1, 'IN', signal);
        } else if (activeSection === 'upcoming') {
          data = await tmdb.upcoming(1, 'IN', signal);
        } else {
          data = mediaType === 'tv'
            ? await tmdb.trendingTv('week', signal)
            : await tmdb.trending('week', signal);
        }

        setMovies(data?.results || []);
        setMatchedArtist(null);
        setSimilarArtists([]);
      } catch (err) {
        if (signal.aborted) return;
        setError(err.message || 'Something went wrong reaching TMDB. Check your connection and try again.');
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCatalog();

    return () => {
      controller.abort();
    };
  }, [activeQuery, activeSection, mediaType, catalogLanguage, reloadTrigger]);

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
          {currentUser ? (
            <>
              <button
                type="button"
                className="top-nav__user-avatar-btn"
                onClick={() => setShowProfileModal(true)}
                title={currentUser.email ? `User: ${currentUser.email} (Manage Profile & Data Backups)` : 'User Profile'}
                aria-label="Open User Profile and Data Backups"
              >
                <div className="top-nav__user-avatar">
                  <span className="top-nav__avatar-text">{getUserInitials(currentUser)}</span>
                </div>
              </button>
              <button
                type="button"
                className="top-nav__btn top-nav__btn--logout"
                onClick={handleLogout}
                title="Log out and return to guest mode"
              >
                <DoorOpen size={15} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              className="top-nav__btn top-nav__btn--login"
              onClick={() => requireAuth('Sign in to your Reelist account')}
              title="Sign in to your Reelist account"
            >
              <Sparkles size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {show404Page ? (
        <Suspense fallback={<div className="container"><p className="state-panel__title">Loading Page…</p></div>}>
          <NotFound
            onReturnHome={() => {
              setShow404Page(false);
              window.location.hash = '';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSearchClick={() => {
              setShow404Page(false);
              window.location.hash = '';
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const inp = document.querySelector('.marquee-search input');
                if (inp) inp.focus();
              }, 150);
            }}
          />
        </Suspense>
      ) : (
        <>
          <header className="hero">
            <p className="hero__eyebrow">Now screening</p>
            <h1 className="hero__title">Explore Cinema</h1>
            <p className="hero__subtitle">Find what&apos;s trending, or search the whole marquee.</p>
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={handleSearchSubmit}
              currentUser={currentUser}
              onRequireAuth={requireAuth}
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
                {showOnboarding && (
                  <div className="onboarding-guide-card" role="region" aria-label="Welcome Guide">
                    <div className="onboarding-guide-content">
                      <div className="onboarding-guide-badge">
                        <Sparkles size={14} />
                        <span>Quick Tour</span>
                      </div>
                      <p className="onboarding-guide-text">
                        <strong>Welcome to Reelist!</strong> 🎬 Browse trending cinema, now showing and upcoming releases &bull; Filter across regional languages &bull; Tap any movie poster to stream official HD trailers.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-primary onboarding-guide-dismiss"
                      onClick={() => {
                        setShowOnboarding(false);
                        try {
                          localStorage.setItem('reelist_onboarded_dismissed', 'true');
                        } catch {
                          // ignore
                        }
                      }}
                      aria-label="Dismiss quick tour"
                    >
                      Got It!
                    </button>
                  </div>
                )}
                {/* Global Trending & Theatrical Catalog Section */}
                <section className="trending-catalog-section" aria-labelledby="trending-heading">
                  <div className="section-header-wrap section-header-wrap--with-toggle">
                    <div className="section-header-left">
                      <h2 id="trending-heading" className="section-heading">
                        {catalogLanguage !== 'all'
                          ? `${getLanguageLabel(catalogLanguage)} Releases`
                          : activeSection === 'now_playing'
                          ? 'In Theatres Now'
                          : activeSection === 'upcoming'
                          ? 'Coming Soon to Theatres'
                          : mediaType === 'tv'
                          ? 'Trending TV Shows & Series'
                          : 'Trending Movies This Week'}
                      </h2>
                      <p className="section-subheading">
                        {catalogLanguage !== 'all'
                          ? `Fresh Theatrical & Streaming Releases in ${getLanguageLabel(catalogLanguage)}`
                          : activeSection === 'now_playing'
                          ? 'Now Showing in Theatres across India & Tamil Nadu'
                          : activeSection === 'upcoming'
                          ? 'Upcoming Theatrical Releases & Advance Premieres'
                          : mediaType === 'tv'
                          ? 'Binge-worthy web series, critically acclaimed dramas & fan favorites'
                          : 'Popular & Trending Blockbusters This Week'}
                      </p>
                    </div>

                    <div className="media-format-switcher" role="tablist" aria-label="Catalog section switcher">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeSection === 'trending'}
                        className={`format-switch-btn ${activeSection === 'trending' ? 'is-active' : ''}`}
                        onClick={() => {
                          setActiveSection('trending');
                          setCatalogLanguage('all');
                        }}
                      >
                        <Sparkles size={14} />
                        <span>Trending</span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeSection === 'now_playing'}
                        className={`format-switch-btn ${activeSection === 'now_playing' ? 'is-active' : ''}`}
                        onClick={() => {
                          setActiveSection('now_playing');
                          setMediaType('movie');
                        }}
                      >
                        <Ticket size={14} />
                        <span>In Theatres</span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeSection === 'upcoming'}
                        className={`format-switch-btn ${activeSection === 'upcoming' ? 'is-active' : ''}`}
                        onClick={() => {
                          setActiveSection('upcoming');
                          setMediaType('movie');
                        }}
                      >
                        <Calendar size={14} />
                        <span>Coming Soon</span>
                      </button>
                      {activeSection === 'trending' && (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={mediaType === 'tv'}
                          className={`format-switch-btn ${mediaType === 'tv' ? 'is-active' : ''}`}
                          onClick={() => setMediaType((prev) => (prev === 'tv' ? 'movie' : 'tv'))}
                        >
                          <Tv size={14} />
                          <span>{mediaType === 'tv' ? 'TV Shows' : 'Movies'}</span>
                        </button>
                      )}
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
          <Footer
            onOpenPrivacy={() => setActiveLegalModal('privacy')}
            onOpenTerms={() => setActiveLegalModal('terms')}
            onOpenContact={() => setActiveLegalModal('contact')}
            onOpen404={() => setShow404Page(true)}
          />
        </>
      )}

      {/* Sticky Mobile CTA Navigation Bar */}
      <nav className="sticky-mobile-cta" aria-label="Mobile quick actions">
        <button
          type="button"
          className="sticky-mobile-cta__item"
          onClick={() => {
            if (!currentUser) {
              requireAuth('Sign in to search for movies, web series, and artists');
              return;
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const inp = document.querySelector('.marquee-search input');
            if (inp) inp.focus();
          }}
          title="Search marquee"
        >
          <Search size={18} />
          <span>Search</span>
        </button>
        <button
          type="button"
          className="sticky-mobile-cta__item"
          onClick={() => {
            if (show404Page) setShow404Page(false);
            setMediaType('movie');
            setActiveSection('trending');
            setCatalogLanguage('all');
            if (activeQuery) {
              setQuery('');
              setActiveQuery('');
              setMatchedArtist(null);
              setSimilarArtists([]);
            }
            const el = document.querySelector('.trending-catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          title="Trending Cinema"
        >
          <Film size={18} />
          <span>Trending</span>
        </button>
        <button
          type="button"
          className="sticky-mobile-cta__item"
          onClick={() => {
            const topMovie = displayedCatalogMovies[0] || movies[0];
            if (topMovie) setShowtimesMovie(topMovie);
          }}
          title="Check showtimes"
        >
          <Ticket size={18} />
          <span>Showtimes</span>
        </button>
        <button
          type="button"
          className="sticky-mobile-cta__item"
          onClick={() => setActiveLegalModal('contact')}
          title="Contact concierge"
        >
          <Mail size={18} />
          <span>Concierge</span>
        </button>
      </nav>

      {/* Legal & Support Modals */}
      {activeLegalModal === 'privacy' && (
        <Suspense fallback={null}>
          <PrivacyPolicyModal onClose={() => setActiveLegalModal(null)} />
        </Suspense>
      )}

      {activeLegalModal === 'terms' && (
        <Suspense fallback={null}>
          <TermsModal onClose={() => setActiveLegalModal(null)} />
        </Suspense>
      )}

      {activeLegalModal === 'contact' && (
        <Suspense fallback={null}>
          <ContactModal
            onClose={() => setActiveLegalModal(null)}
            onSuccess={(data) => {
              setLastInquiry(data);
              setActiveLegalModal('thank-you');
            }}
          />
        </Suspense>
      )}

      {activeLegalModal === 'thank-you' && (
        <Suspense fallback={null}>
          <ThankYouModal
            submissionData={lastInquiry}
            onClose={() => setActiveLegalModal(null)}
            onReturnHome={() => {
              setActiveLegalModal(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Suspense>
      )}

      {/* User Profile & Security Center Modal */}
      {showProfileModal && currentUser && (
        <Suspense fallback={null}>
          <UserProfileModal
            currentUser={currentUser}
            onClose={() => setShowProfileModal(false)}
            onLogout={handleLogout}
          />
        </Suspense>
      )}

      {selectedId && (
        <Suspense fallback={null}>
          <MovieModal
            movieId={selectedId}
            onClose={() => setSelectedId(null)}
            onSelectMovie={(movie) => setSelectedId(movie.id)}
            currentUser={currentUser}
            onRequireAuth={requireAuth}
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

      {showAuthModal && (
        <div
          className="auth-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Sign In"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAuthModal(false);
              setPendingAction(null);
            }
          }}
        >
          <div className="auth-modal-container">
            <MonsterAuth
              isModal={true}
              reason={authModalReason}
              onClose={() => {
                setShowAuthModal(false);
                setPendingAction(null);
              }}
              onLoginSuccess={(user) => {
                handleAuthSuccess(user);
              }}
            />
          </div>
        </div>
      )}

      {/* Cookie & Analytics Privacy Banner */}
      <CookieBanner />
    </div>
  );
}
