import { useEffect, useRef, useState } from 'react';
import { backdropUrl, posterUrl, tmdb } from '../api/tmdb.js';
import RatingBadge from './RatingBadge.jsx';

export default function MovieModal({ movieId, onClose }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Lock body scroll while modal is active
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Fetch movie details
  useEffect(() => {
    let cancelled = false;
    setDetails(null);
    setError(null);
    setImgError(false);

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

  // Keyboard accessibility: Escape to close and Tab focus trapping
  useEffect(() => {
    // Focus the close button once modal appears
    closeBtnRef.current?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, details]);

  const releaseYear =
    details?.release_date && details.release_date.length >= 4
      ? details.release_date.slice(0, 4)
      : 'Unknown year';

  return (
    <div className="modal-scrim" onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="movie-modal__close"
          onClick={onClose}
          aria-label="Close details"
        >
          ✕
        </button>

        {!details && !error && (
          <div className="movie-modal__loading" role="status">
            Rewinding the reel…
          </div>
        )}

        {error && (
          <div className="state-panel state-panel--error" role="alert">
            {error}
          </div>
        )}

        {details && (
          <>
            <div
              className="movie-modal__backdrop"
              style={{
                backgroundImage: details.backdrop_path
                  ? `linear-gradient(180deg, rgba(11,11,15,0.2), rgba(11,11,15,0.96)), url("${backdropUrl(
                      details.backdrop_path
                    )}")`
                  : undefined,
              }}
            />
            <div className="movie-modal__content">
              <div className="movie-modal__poster">
                {details.poster_path && !imgError ? (
                  <img
                    src={posterUrl(details.poster_path)}
                    alt={`${details.title} poster`}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="movie-card__noposter">No Artwork</div>
                )}
              </div>
              <div className="movie-modal__info">
                <p className="movie-modal__eyebrow">
                  {releaseYear} ·{' '}
                  {details.runtime ? `${details.runtime} min` : 'Runtime N/A'}
                </p>
                <h2 id="movie-modal-title">{details.title}</h2>
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
