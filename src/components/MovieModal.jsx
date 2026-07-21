import { useEffect, useState } from 'react';
import { backdropUrl, posterUrl, tmdb } from '../api/tmdb.js';
import RatingBadge from './RatingBadge.jsx';

export default function MovieModal({ movieId, onClose }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setDetails(null);
    setError(null);
    tmdb
      .details(movieId)
      .then((data) => {
        if (!cancelled) setDetails(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load details for this title.');
      });
    return () => {
      cancelled = true;
    };
  }, [movieId]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="movie-modal__close" onClick={onClose} aria-label="Close details">
          ✕
        </button>

        {!details && !error && (
          <div className="movie-modal__loading">Rewinding the reel…</div>
        )}

        {error && <div className="state-panel state-panel--error">{error}</div>}

        {details && (
          <>
            <div
              className="movie-modal__backdrop"
              style={{
                backgroundImage: details.backdrop_path
                  ? `linear-gradient(180deg, rgba(11,11,15,0.2), rgba(11,11,15,0.96)), url(${backdropUrl(
                      details.backdrop_path
                    )})`
                  : 'none',
              }}
            />
            <div className="movie-modal__content">
              <div className="movie-modal__poster">
                {details.poster_path ? (
                  <img src={posterUrl(details.poster_path)} alt={`${details.title} poster`} />
                ) : (
                  <div className="movie-card__noposter">No Artwork</div>
                )}
              </div>
              <div className="movie-modal__info">
                <p className="movie-modal__eyebrow">
                  {details.release_date ? details.release_date.slice(0, 4) : 'Unknown year'} ·{' '}
                  {details.runtime ? `${details.runtime} min` : 'Runtime N/A'}
                </p>
                <h2>{details.title}</h2>
                {details.tagline && <p className="movie-modal__tagline">"{details.tagline}"</p>}

                <div className="movie-modal__row">
                  <RatingBadge value={details.vote_average} />
                  <div className="movie-modal__genres">
                    {details.genres?.map((g) => (
                      <span className="genre-chip" key={g.id}>
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="movie-modal__overview">{details.overview || 'No synopsis available.'}</p>

                {details.credits?.cast?.length > 0 && (
                  <p className="movie-modal__cast">
                    <span>Starring </span>
                    {details.credits.cast
                      .slice(0, 4)
                      .map((c) => c.name)
                      .join(', ')}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
