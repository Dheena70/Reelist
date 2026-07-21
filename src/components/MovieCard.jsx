import { posterUrl } from '../api/tmdb.js';
import RatingBadge from './RatingBadge.jsx';

export default function MovieCard({ movie, onSelect, index }) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—';
  const poster = posterUrl(movie.poster_path, 'w342');

  return (
    <button
      className="movie-card"
      style={{ '--i': index }}
      onClick={() => onSelect(movie)}
      aria-label={`View details for ${movie.title}`}
    >
      <div className="movie-card__poster">
        {poster ? (
          <img src={poster} alt={`${movie.title} poster`} loading="lazy" />
        ) : (
          <div className="movie-card__noposter">No Artwork</div>
        )}
        <RatingBadge value={movie.vote_average} />
      </div>
      <div className="movie-card__meta">
        <h3 className="movie-card__title">{movie.title}</h3>
        <span className="movie-card__year">{year}</span>
      </div>
    </button>
  );
}
