import { useState } from 'react';
import { Play } from 'lucide-react';
import { posterUrl } from '../api/tmdb.js';
import RatingBadge from './RatingBadge.jsx';

export default function MovieCard({ movie, onSelect, index }) {
  const [imgError, setImgError] = useState(false);
  const title = movie.title || movie.original_title || 'Untitled';
  const year = movie.release_date && movie.release_date.length >= 4 ? movie.release_date.slice(0, 4) : '—';
  const poster = posterUrl(movie.poster_path, 'w342');

  return (
    <button
      type="button"
      className="movie-card"
      style={{ '--i': index }}
      onClick={() => onSelect(movie)}
      aria-label={`View details and trailer for ${title}`}
    >
      <div className="movie-card__poster">
        {poster && !imgError ? (
          <img
            src={poster}
            alt={`${title} poster`}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="movie-card__noposter">No Artwork</div>
        )}
        <RatingBadge value={movie.vote_average} />
        <div className="movie-card__action-hint">
          <Play size={11} fill="currentColor" />
          <span>Trailer</span>
        </div>
      </div>
      <div className="movie-card__meta">
        <span className="movie-card__title">{title}</span>
        <span className="movie-card__year">{year}</span>
      </div>
    </button>
  );
}
