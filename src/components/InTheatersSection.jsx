import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Film,
  Ticket,
  Play,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clapperboard,
  Clock,
  Globe2,
} from 'lucide-react';
import {
  tmdb,
  posterUrl,
  THEATRICAL_NOW_PLAYING,
  THEATRICAL_COMING_SOON,
} from '../api/tmdb.js';

const LANGUAGE_FILTERS = [
  { id: 'all', label: 'All Releases' },
  { id: 'ta', label: 'Tamil (தமிழ்)' },
  { id: 'te', label: 'Telugu (తెలుగు)' },
  { id: 'hi', label: 'Hindi (हिंदी)' },
  { id: 'ml', label: 'Malayalam (മലയാളം)' },
  { id: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { id: 'en', label: 'English / Global' },
];

function getLanguageLabel(code) {
  const map = {
    ta: 'Tamil',
    te: 'Telugu',
    hi: 'Hindi',
    ml: 'Malayalam',
    kn: 'Kannada',
    en: 'English',
  };
  return map[code] || (code ? code.toUpperCase() : 'Cinema');
}

function formatDateBadge(dateStr, label) {
  if (label && /^[A-Z]{3}\s+\d{1,2}$/.test(label.trim())) {
    return label.trim();
  }
  if (!dateStr) return label || 'IN THEATERS';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (m >= 0 && m < 12 && !isNaN(d)) {
      return `${months[m]} ${String(d).padStart(2, '0')}`;
    }
  }
  return label || dateStr;
}

export default function InTheatersSection({ onSelectMovie, onOpenShowtimes }) {
  const [activeTab, setActiveTab] = useState('now_playing'); // 'now_playing' | 'upcoming'
  const [selectedLang, setSelectedLang] = useState('all');
  const [nowPlayingMovies, setNowPlayingMovies] = useState(THEATRICAL_NOW_PLAYING);
  const [upcomingMovies, setUpcomingMovies] = useState(THEATRICAL_COMING_SOON);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Fetch live now playing and upcoming from TMDB if available, merging with curated movies
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.allSettled([tmdb.nowPlaying(), tmdb.upcoming()])
      .then(([nowRes, upRes]) => {
        if (cancelled) return;

        if (nowRes.status === 'fulfilled' && nowRes.value?.results?.length > 0) {
          const apiMovies = nowRes.value.results
            .filter((m) => m.poster_path && m.title)
            .map((m) => ({
              ...m,
              release_label: m.release_date ? `IN THEATERS • ${m.release_date.slice(5)}` : 'IN THEATERS',
            }));
          if (apiMovies.length > 0) {
            // Keep regional Indian movies while merging live additions
            const existingIds = new Set(THEATRICAL_NOW_PLAYING.map((c) => c.id));
            setNowPlayingMovies([
              ...THEATRICAL_NOW_PLAYING,
              ...apiMovies.filter((m) => !existingIds.has(m.id)),
            ]);
          }
        }

        if (upRes.status === 'fulfilled' && upRes.value?.results?.length > 0) {
          const apiUpcoming = upRes.value.results
            .filter((m) => m.poster_path && m.title)
            .map((m) => ({
              ...m,
              release_label: m.release_date ? m.release_date.slice(5) : 'COMING SOON',
            }));
          if (apiUpcoming.length > 0) {
            const existingUpIds = new Set(THEATRICAL_COMING_SOON.map((c) => c.id));
            setUpcomingMovies([
              ...THEATRICAL_COMING_SOON,
              ...apiUpcoming.filter((m) => !existingUpIds.has(m.id)),
            ]);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const currentList = useMemo(() => {
    const base = activeTab === 'now_playing' ? nowPlayingMovies : upcomingMovies;
    if (selectedLang === 'all') return base;
    return base.filter((m) => (m.original_language || 'en').toLowerCase() === selectedLang);
  }, [activeTab, nowPlayingMovies, upcomingMovies, selectedLang]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -380 : 380;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="in-theaters-section">
      {/* Section Header */}
      <div className="in-theaters-section__header">
        <div className="in-theaters-section__title-wrap">
          <div className="in-theaters-section__headline">
            <span className="theaters-badge-indicator" />
            <h2 className="in-theaters-section__title">
              In Theaters <span className="theaters-arrow">›</span>
            </h2>
          </div>
          <p className="in-theaters-section__subtitle">
            Tamil, Telugu, Hindi, Malayalam, Kannada & Global Theatrical Releases
          </p>
        </div>

        {/* Action Controls: Tabs & Horizontal Carousel Arrows */}
        <div className="in-theaters-section__controls">
          <div className="in-theaters-tabs">
            <button
              type="button"
              className={`theater-tab-btn ${activeTab === 'now_playing' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('now_playing')}
            >
              <Clapperboard size={13} />
              <span>Now In Theaters</span>
              <span className="tab-count">{nowPlayingMovies.length}</span>
            </button>
            <button
              type="button"
              className={`theater-tab-btn ${activeTab === 'upcoming' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <Calendar size={13} />
              <span>Coming Soon</span>
              <span className="tab-count">{upcomingMovies.length}</span>
            </button>
          </div>

          <div className="carousel-nav-btns">
            <button
              type="button"
              className="carousel-arrow-btn"
              onClick={() => handleScroll('left')}
              title="Scroll left"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="carousel-arrow-btn"
              onClick={() => handleScroll('right')}
              title="Scroll right"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Regional Cinema Language Filter Bar */}
      <div className="theaters-lang-bar">
        <div className="theaters-lang-bar__title">
          <Globe2 size={13} />
          <span>Filter by Language:</span>
        </div>
        <div className="theaters-lang-chips">
          {LANGUAGE_FILTERS.map((lang) => (
            <button
              key={lang.id}
              type="button"
              className={`lang-filter-chip ${selectedLang === lang.id ? 'is-active' : ''}`}
              onClick={() => setSelectedLang(lang.id)}
            >
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Scrolling Theatrical Showcase */}
      <div className="in-theaters-carousel" ref={scrollRef}>
        {currentList.map((movie) => {
          const poster = posterUrl(movie.poster_path, 'w342');
          const releaseText = formatDateBadge(movie.release_date, movie.release_label);
          const langCode = (movie.original_language || 'en').toLowerCase();
          const langLabel = getLanguageLabel(langCode);

          return (
            <div key={movie.id} className="theater-card">
              {/* Card Poster with Date Chip, Language Pill and Rating */}
              <div
                className="theater-card__poster-box"
                onClick={() => onSelectMovie(movie)}
                title={`Open ${movie.title} trailer & details`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelectMovie(movie);
                }}
              >
                {poster ? (
                  <img
                    src={poster}
                    alt={`${movie.title} poster`}
                    className="theater-card__img"
                    loading="lazy"
                  />
                ) : (
                  <div className="theater-card__placeholder">
                    <Film size={32} />
                    <span>No Poster</span>
                  </div>
                )}

                {/* Floating Date Badge (Top Left - Matching Screenshot) */}
                <div className="theater-card__date-badge">
                  <Calendar size={10} />
                  <span>{releaseText}</span>
                </div>

                {/* Star Rating Badge (Top Right) */}
                {movie.vote_average && (
                  <div className="theater-card__rating-badge">
                    ★ {Number(movie.vote_average).toFixed(1)}
                  </div>
                )}

                {/* Language Pill Badge (Bottom Left) */}
                <div className={`theater-card__lang-badge theater-card__lang-badge--${langCode}`}>
                  {langLabel}
                </div>

                {/* Duration Badge for Upcoming (Screenshot 5) */}
                {movie.duration && (
                  <div className="theater-card__duration-badge">
                    <Clock size={10} />
                    <span>{movie.duration}</span>
                  </div>
                )}

                <div className="theater-card__overlay-glow" />
              </div>

              {/* Title & Metadata */}
              <div className="theater-card__body">
                <h3
                  className="theater-card__title"
                  title={movie.title}
                  onClick={() => onSelectMovie(movie)}
                >
                  {movie.title}
                </h3>

                {/* Dual Action Buttons (Matching IMDb Screenshot 3) */}
                <div className="theater-card__actions">
                  {activeTab === 'now_playing' && onOpenShowtimes && (
                    <button
                      type="button"
                      className="theater-action-btn theater-action-btn--showtimes"
                      onClick={() => onOpenShowtimes(movie)}
                      title={`View theater showtimes for ${movie.title}`}
                    >
                      <Ticket size={13} />
                      <span>Showtimes</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="theater-action-btn theater-action-btn--trailer"
                    onClick={() => onSelectMovie(movie)}
                    title={`Play official trailer for ${movie.title}`}
                  >
                    <Play size={12} fill="currentColor" />
                    <span>Trailer</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


