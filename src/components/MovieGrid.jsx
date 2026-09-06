import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies, loading, error, emptyLabel, onSelect, onRetry }) {
  if (loading) {
    return (
      <div className="movie-grid" role="status" aria-busy="true" aria-label="Loading movies">
        {Array.from({ length: 10 }).map((_, i) => (
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

  return (
    <div className="movie-grid">
      {movies.map((movie, i) => (
        <MovieCard movie={movie} key={movie.id} onSelect={onSelect} index={i} />
      ))}
    </div>
  );
}
