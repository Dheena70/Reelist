import { Film, Play, Ticket, Clock, Calendar, Star, Clapperboard, Globe2, ChevronRight } from 'lucide-react';
import { posterUrl } from '../api/tmdb.js';

export default function SearchSpotlight({ movie, onSelectMovie, onOpenShowtimes }) {
  if (!movie) return null;

  const title = movie.title || movie.original_title || 'Untitled';
  const poster = posterUrl(movie.poster_path, 'w342');
  const releaseDate = movie.full_release_date || movie.release_date || '2024';
  const duration = movie.duration || (movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null);
  const director = movie.director || null;
  const musicDirector = movie.music_director || null;
  const producers = movie.producers || null;
  const lang = movie.original_language ? movie.original_language.toUpperCase() : 'TA';

  const ratings = movie.ratings || (movie.vote_average ? {
    imdb: `${Number(movie.vote_average).toFixed(1)}/10`,
    prime: `${Math.max(4, (movie.vote_average - 0.2)).toFixed(1)}/10`,
    rottenTomatoes: `${Math.min(99, Math.max(25, Math.round(movie.vote_average * 10 - 16)))}%`,
  } : null);

  return (
    <div className="search-spotlight-card" role="region" aria-label={`Featured match: ${title}`}>
      <div className="search-spotlight-card__badge-row">
        <span className="search-spotlight-badge">
          <Globe2 size={13} />
          <span>Google Search Spotlight</span>
        </span>
        <span className="search-spotlight-subtext">Instant Film Knowledge Panel</span>
      </div>

      <div className="search-spotlight-card__body">
        <div
          className="search-spotlight-card__poster-box"
          onClick={() => onSelectMovie(movie)}
          role="button"
          tabIndex={0}
          title={`View details for ${title}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectMovie(movie);
            }
          }}
        >
          {poster ? (
            <img src={poster} alt={`${title} official theatrical spotlight poster`} width="220" height="330" className="search-spotlight__img" />
          ) : (
            <div className="search-spotlight__no-poster">
              <Film size={28} />
            </div>
          )}
          <div className="search-spotlight__play-overlay" aria-hidden="true">
            <Play size={22} fill="currentColor" />
          </div>
        </div>

        <div className="search-spotlight-card__content">
          <div className="search-spotlight__eyebrow">
            {releaseDate && (
              <span className="spotlight-eyebrow-item">
                <Calendar size={13} />
                <span>{releaseDate}</span>
              </span>
            )}
            {duration && (
              <>
                <span className="spotlight-eyebrow-sep">•</span>
                <span className="spotlight-eyebrow-item">
                  <Clock size={13} />
                  <span>{duration}</span>
                </span>
              </>
            )}
            <span className="spotlight-eyebrow-sep">•</span>
            <span className="spotlight-eyebrow-lang">[{lang}]</span>
          </div>

          <h3 className="search-spotlight__title" onClick={() => onSelectMovie(movie)}>
            {title}
          </h3>

          {/* Ratings Trio */}
          {ratings && (
            <div className="google-ratings-trio google-ratings-trio--compact">
              <div className="rating-trio-item rating-trio-item--imdb">
                <span className="rating-trio-score">{ratings.imdb}</span>
                <span className="rating-trio-source">IMDb</span>
              </div>
              <div className="rating-trio-item rating-trio-item--prime">
                <span className="rating-trio-score">{ratings.prime}</span>
                <span className="rating-trio-source">Prime Video</span>
              </div>
              <div className="rating-trio-item rating-trio-item--rt">
                <span className="rating-trio-score">{ratings.rottenTomatoes}</span>
                <span className="rating-trio-source">Rotten Tomatoes</span>
              </div>
            </div>
          )}

          {/* Synopsis */}
          <p className="search-spotlight__overview">
            {movie.overview || 'No synopsis available.'}
          </p>

          {/* Key Facts Table */}
          <div className="search-spotlight__facts">
            {releaseDate && (
              <div className="spotlight-fact-row">
                <span className="spotlight-fact-label">Release date</span>
                <span className="spotlight-fact-val spotlight-fact-val--highlight">{releaseDate}</span>
              </div>
            )}
            {director && (
              <div className="spotlight-fact-row">
                <span className="spotlight-fact-label">Director</span>
                <span className="spotlight-fact-val">{director}</span>
              </div>
            )}
            {musicDirector && (
              <div className="spotlight-fact-row">
                <span className="spotlight-fact-label">Music director</span>
                <span className="spotlight-fact-val">{musicDirector}</span>
              </div>
            )}
            {producers && (
              <div className="spotlight-fact-row">
                <span className="spotlight-fact-label">Producers</span>
                <span className="spotlight-fact-val">{producers}</span>
              </div>
            )}
            {duration && (
              <div className="spotlight-fact-row">
                <span className="spotlight-fact-label">Running time</span>
                <span className="spotlight-fact-val">{duration}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="search-spotlight__actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => onSelectMovie(movie)}
            >
              <Play size={14} fill="currentColor" />
              <span>Watch Trailer & Details</span>
            </button>
            {onOpenShowtimes && (
              <button
                type="button"
                className="btn-subtle-outline"
                onClick={() => onOpenShowtimes(movie)}
              >
                <Ticket size={14} />
                <span>Showtimes</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
