import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies, loading, error, emptyLabel, onSelect }) {
  if (loading) {
    return (
      <div className="movie-grid">
        {Array.from({ length: 10 }).map((_, i) => (
          <div className="movie-card movie-card--skeleton" key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-panel state-panel--error">
        <p className="state-panel__title">Reel jammed</p>
        <p className="state-panel__body">{error}</p>
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
