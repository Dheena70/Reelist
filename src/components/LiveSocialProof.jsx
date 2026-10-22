import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { posterUrl } from '../api/tmdb.js';

const CITIES = [
  'Chennai',
  'Bengaluru',
  'Hyderabad',
  'Coimbatore',
  'Madurai',
  'Mumbai',
  'Kochi',
  'Trichy',
  'Salem',
  'Tirunelveli',
  'Vellore',
  'Thiruvananthapuram',
];

const ACTIVITY_TEMPLATES = [
  { action: 'just watched the official HD trailer', tag: 'Trailer Stream', emoji: '🎬' },
  { action: 'checked today\'s theater showtimes', tag: 'Showtimes', emoji: '🎟️' },
  { action: 'added this title to Watchlist', tag: 'Watchlist', emoji: '🔖' },
  { action: 'rated this movie 9.4/10', tag: 'Top Rated', emoji: '⭐' },
  { action: 'reacted 🩷 to the theatrical trailer', tag: 'Trending', emoji: '🔥' },
  { action: 'checking ticket availability in Chennai', tag: 'Fast Selling', emoji: '🍿' },
  { action: 'viewed cast & OTT streaming details', tag: 'Premiere', emoji: '✨' },
];

const TIME_AGOS = ['Just now', '1m ago', '2m ago', '3m ago', 'A moment ago'];

export default function LiveSocialProof({ movies = [], onSelectMovie }) {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissedByUser, setIsDismissedByUser] = useState(false);
  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const generateRandomEvent = useCallback(() => {
    if (!movies || movies.length === 0) return null;

    // Pick a random movie from top 15 trending
    const pool = movies.slice(0, 15);
    const movie = pool[Math.floor(Math.random() * pool.length)];
    if (!movie) return null;

    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const tmpl = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)];
    const timeAgo = TIME_AGOS[Math.floor(Math.random() * TIME_AGOS.length)];

    return {
      id: `${Date.now()}-${Math.random()}`,
      movie,
      city,
      action: tmpl.action,
      tag: tmpl.tag,
      emoji: tmpl.emoji,
      timeAgo,
    };
  }, [movies]);

  useEffect(() => {
    if (isDismissedByUser || !movies || movies.length === 0) return;

    // Schedule next notification cycle
    const scheduleNext = (delay) => {
      timerRef.current = setTimeout(() => {
        const ev = generateRandomEvent();
        if (ev) {
          setCurrentEvent(ev);
          setIsVisible(true);

          // Auto-hide after 4.6 seconds
          hideTimerRef.current = setTimeout(() => {
            setIsVisible(false);
            // Schedule next event in 8-13 seconds
            const nextDelay = 8000 + Math.random() * 5000;
            scheduleNext(nextDelay);
          }, 4600);
        } else {
          scheduleNext(6000);
        }
      }, delay);
    };

    // First toast appears in 3.5 seconds after load
    scheduleNext(3500);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, [movies, isDismissedByUser, generateRandomEvent]);

  if (!currentEvent || !isVisible || isDismissedByUser) {
    return null;
  }

  const movie = currentEvent.movie;
  const title = movie.title || movie.name || 'Blockbuster Movie';
  const poster = posterUrl(movie.poster_path, 'w92');

  return (
    <div
      className="live-social-proof-toast"
      role="status"
      aria-live="polite"
      onClick={() => {
        if (onSelectMovie && movie) {
          onSelectMovie(movie);
        }
      }}
      title={`Click to open ${title} and watch official trailer`}
    >
      <div className="live-social-proof__poster">
        {poster ? (
          <img src={poster} alt={`${title} poster thumbnail`} width="44" height="66" loading="lazy" />
        ) : (
          <div className="live-social-proof__noposter">🎬</div>
        )}
        <span className="live-social-proof__live-dot" />
      </div>

      <div className="live-social-proof__content">
        <div className="live-social-proof__header">
          <span className="live-social-proof__tag">
            <span className="live-social-proof__emoji">{currentEvent.emoji}</span>
            <span>{currentEvent.tag}</span>
          </span>
          <span className="live-social-proof__time">{currentEvent.timeAgo}</span>
        </div>

        <p className="live-social-proof__desc">
          Someone in <strong>{currentEvent.city}</strong> {currentEvent.action}
        </p>

        <p className="live-social-proof__movie-title" title={title}>
          {title}
        </p>
      </div>

      <button
        type="button"
        className="live-social-proof__close-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
          // Snooze for 45s on explicit close
          clearTimeout(timerRef.current);
          clearTimeout(hideTimerRef.current);
          timerRef.current = setTimeout(() => {
            setIsDismissedByUser(false);
          }, 45000);
        }}
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  );
}
