import { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import {
  tmdb,
  posterUrl,
  THEATRICAL_NOW_PLAYING,
  THEATRICAL_COMING_SOON,
} from '../api/tmdb.js';

export default function InTheatersSection({ onSelectMovie, onOpenShowtimes }) {
  const [activeTab, setActiveTab] = useState('now_playing'); // 'now_playing' | 'upcoming'
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
          // Merge API results while preserving curated regional showcase
          const apiMovies = nowRes.value.results.map((m) => ({
            ...m,
            release_label: m.release_date ? `IN THEATERS • ${m.release_date.slice(5)}` : 'IN THEATERS',
          }));
          const existingIds = new Set(THEATRICAL_NOW_PLAYING.map((c) => c.id));
          const combined = [
            ...THEATRICAL_NOW_PLAYING,
            ...apiMovies.filter((m) => !existingIds.has(m.id)),
          ];
          setNowPlayingMovies(combined);
        }

        if (upRes.status === 'fulfilled' && upRes.value?.results?.length > 0) {
          const apiUpcoming = upRes.value.results.map((m) => ({
            ...m,
            release_label: m.release_date ? m.release_date.slice(5) : 'COMING SOON',
          }));
          const existingUpIds = new Set(THEATRICAL_COMING_SOON.map((c) => c.id));
          const combinedUp = [
            ...THEATRICAL_COMING_SOON,
            ...apiUpcoming.filter((m) => !existingUpIds.has(m.id)),
          ];
          setUpcomingMovies(combinedUp);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const currentList = activeTab === 'now_playing' ? nowPlayingMovies : upcomingMovies;

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
            Showtimes & Current Theatrical Releases Near You
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

      {/* Horizontal Scrolling Theatrical Showcase */}
      <div className="in-theaters-carousel" ref={scrollRef}>
        {currentList.map((movie) => {
          const poster = posterUrl(movie.poster_path, 'w342');
          const releaseText = movie.release_label || (movie.release_date ? movie.release_date : 'IN THEATERS');

          return (
            <div key={movie.id} className="theater-card">
              {/* Card Poster with Date Chip and Rating */}
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
