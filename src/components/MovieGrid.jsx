import { useState } from 'react';
import { Film, RotateCcw } from 'lucide-react';
import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies, loading, error, emptyLabel, onSelect, onRetry }) {
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="movie-grid" role="status" aria-busy="true" aria-label="Loading movies">
        {Array.from({ length: 10 }).map((_, i) => (
          <div className="movie-card movie-card--skeleton" key={i}>
            <div className="skeleton-poster" />
            <div className="skeleton-meta">
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--sub" />
            </div>
          </div>
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
          <button type="button" className="btn-outline btn-retry" onClick={onRetry}>
            ↻ Try again
          </button>
        )}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="state-panel state-panel--empty" role="status">
        <div className="state-panel__icon" aria-hidden="true">
          <Film size={36} color="var(--gold)" />
        </div>
        <p className="state-panel__title">Nothing on this reel yet</p>
        <p className="state-panel__body">
          {emptyLabel || 'No movies or series found matching your active filter. Try exploring our other language channels or clearing your search.'}
        </p>
        {onRetry && (
          <button type="button" className="btn-outline btn-retry" onClick={onRetry}>
            <RotateCcw size={14} />
            <span>Reset Search & Filters</span>
          </button>
        )}
      </div>
    );
  }

  // Display initial 10 items (2 complete 5-column rows) to eliminate ragged bottom edge
  const displayedMovies = showAll || movies.length <= 10 ? movies : movies.slice(0, 10);

  return (
    <div className="movie-grid-container">
      <div className="movie-grid">
        {displayedMovies.map((movie, i) => (
          <MovieCard movie={movie} key={movie.id} onSelect={onSelect} index={i} />
        ))}
      </div>

      {movies.length > 10 && (
        <div className="movie-grid__view-more">
          <button
            type="button"
            className="btn-secondary btn-view-more"
            onClick={() => setShowAll((prev) => !prev)}
            aria-expanded={showAll}
          >
            {showAll ? 'Show Fewer Titles' : `View More Titles (+${movies.length - 10})`}
          </button>
        </div>
      )}
    </div>
  );
}
