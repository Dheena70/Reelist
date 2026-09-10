import { useState } from 'react';
import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies, loading, error, emptyLabel, onSelect, onRetry }) {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="movie-grid" role="status" aria-busy="true" aria-label="Loading movies">
        {Array.from({ length: 12 }).map((_, i) => (
          <div className="movie-card movie-card--skeleton" key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-panel state-panel--error" role="alert">
        <p className="state-panel__title">Reel jammed</p>
        <p className="state-panel__body">{error}</p>
        {onRetry && (
          <button type="button" className="btn-retry" onClick={onRetry}>
            ↻ Try again
          </button>
        )}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="state-panel">
        <p className="state-panel__title">Nothing on this reel yet</p>
        <p className="state-panel__body">{emptyLabel}</p>
      </div>
    );
  }

  // Display initial 12 items (2 complete 6-column rows) to eliminate incomplete row whitespace (Heuristic 9 Fix)
  const displayedMovies = showAll || movies.length <= 12 ? movies : movies.slice(0, 12);

  return (
    <div className="movie-grid-container">
      <div className="movie-grid">
        {displayedMovies.map((movie, i) => (
          <MovieCard movie={movie} key={movie.id} onSelect={onSelect} index={i} />
        ))}
      </div>

      {movies.length > 12 && (
        <div className="movie-grid__view-more">
          <button
            type="button"
            className="btn-view-more"
            onClick={() => setShowAll((prev) => !prev)}
            aria-expanded={showAll}
          >
            {showAll ? 'Show Fewer Titles' : `View More Titles (+${movies.length - 12})`}
          </button>
        </div>
      )}
    </div>
  );
}
