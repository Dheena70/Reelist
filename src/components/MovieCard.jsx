import { useState, memo } from 'react';
import { Play, Ticket } from 'lucide-react';
import { posterUrl } from '../api/tmdb.js';
import RatingBadge from './RatingBadge.jsx';

function MovieCard({
  movie,
  onSelect,
  index,
  onOpenShowtimes,
  showShowtimes = false,
  className = '',
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const isTv = movie.media_type === 'tv' || !!movie.first_air_date || !!movie.number_of_seasons;
  const title = movie.title || movie.name || movie.original_title || movie.original_name || 'Untitled';
  const rawDate = movie.release_date || movie.first_air_date;
  const rawYear =
    movie.release_label ||
    (rawDate && rawDate.length >= 4
      ? rawDate.slice(0, 4)
      : '—');
  const year = typeof rawYear === 'string'
    ? rawYear.replace(/\bIN THEATERS\b/gi, 'In theaters')
    : rawYear;
  const poster = posterUrl(movie.poster_path, 'w342');
  const lang = movie.original_language ? movie.original_language.toUpperCase() : null;
  const duration = movie.duration || (movie.number_of_seasons ? `${movie.number_of_seasons} Season${movie.number_of_seasons > 1 ? 's' : ''}` : (movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null));
  const director = movie.director || null;

  const isLcp = index === 0;
  const isAboveFold = typeof index === 'number' && index < 4;

  return (
    <div
      className={`movie-card ${className}`.trim()}
      style={{ '--i': index }}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(movie)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(movie);
        }
      }}
      title={`Play trailer and view details for ${title}`}
      aria-label={`Play trailer and view details for ${title} (${year})`}
    >
      <div className="movie-card__poster">
        {poster && !imgError ? (
          <img
            src={poster}
            alt={`${title} official theatrical poster`}
            width="342"
            height="513"
            loading={isAboveFold ? 'eager' : 'lazy'}
            decoding="async"
            fetchpriority={isLcp ? 'high' : undefined}
            className={`movie-card__img ${imgLoaded ? 'is-loaded' : 'is-loading'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="movie-card__noposter">No Artwork</div>
        )}
        <RatingBadge value={movie.vote_average} />
        <div className="movie-card__action-hint" aria-hidden="true">
          <Play size={11} fill="currentColor" />
          <span>Trailer</span>
        </div>
      </div>

      <div className="movie-card__meta">
        <h3 className="movie-card__title" title={title}>
          {title}
        </h3>
        {movie.character && (
          <p className="movie-card__character" title={`Role: ${movie.character}`}>
            as {movie.character}
          </p>
        )}
        <div className="movie-card__submeta">
          {isTv && (
            <>
              <span className="movie-card__tv-tag">Series</span>
              <span className="movie-card__sep">•</span>
            </>
          )}
          <span className="movie-card__year">{year}</span>
          {duration && (
            <>
              <span className="movie-card__sep">•</span>
              <span className="movie-card__duration">{duration}</span>
            </>
          )}
          {lang && (
            <>
              <span className="movie-card__sep">•</span>
              <span className="movie-card__lang">{lang}</span>
            </>
          )}
          {director && (
            <>
              <span className="movie-card__sep">•</span>
              <span className="movie-card__director" title={`Directed by ${director}`}>Dir: {director}</span>
            </>
          )}
        </div>

        {showShowtimes && onOpenShowtimes && (
          <div className="movie-card__actions">
            <button
              type="button"
              className="btn-subtle-outline movie-card__showtimes-btn"
              onClick={(e) => {
                e.stopPropagation();
                onOpenShowtimes(movie);
              }}
              title={`View theater showtimes for ${title}`}
            >
              <Ticket size={13} />
              <span>Showtimes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(MovieCard);

