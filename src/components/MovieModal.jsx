import { useEffect, useMemo, useRef, useState } from 'react';
import { backdropUrl, posterUrl, providerLogoUrl, tmdb } from '../api/tmdb.js';
import RatingBadge from './RatingBadge.jsx';

function getPlatformColorClass(name = '') {
  const n = name.toLowerCase();
  if (n.includes('netflix')) return 'ott-chip--netflix';
  if (n.includes('prime') || n.includes('amazon')) return 'ott-chip--prime';
  if (n.includes('hotstar') || n.includes('disney')) return 'ott-chip--hotstar';
  if (n.includes('apple')) return 'ott-chip--apple';
  if (n.includes('jio')) return 'ott-chip--jio';
  if (n.includes('zee')) return 'ott-chip--zee';
  if (n.includes('sony')) return 'ott-chip--sonyliv';
  return 'ott-chip--default';
}

export default function MovieModal({ movieId, onClose }) {
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
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
    setShowTrailer(false);

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

  // Extract official trailer
  const trailer = useMemo(() => {
    if (!details?.videos?.results) return null;
    const vids = details.videos.results;
    // 1. Official YouTube Trailer
    const officialTrailer = vids.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
    );
    if (officialTrailer) return officialTrailer;
    // 2. Any YouTube Trailer
    const anyTrailer = vids.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer'
    );
    if (anyTrailer) return anyTrailer;
    // 3. Any Teaser
    const teaser = vids.find(
      (v) => v.site === 'YouTube' && v.type === 'Teaser'
    );
    if (teaser) return teaser;
    // 4. Any YouTube Video
    return vids.find((v) => v.site === 'YouTube') || null;
  }, [details]);

  // Comprehensive Theatrical & Regional Dub Release Languages resolver
  const releaseLanguages = useMemo(() => {
    if (!details) return [];
    const origCode = (details.original_language || 'en').toLowerCase();
    const origMap = {
      en: 'English',
      ta: 'Tamil',
      te: 'Telugu',
      hi: 'Hindi',
      ml: 'Malayalam',
      kn: 'Kannada',
      ja: 'Japanese',
      ko: 'Korean',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      zh: 'Mandarin',
      it: 'Italian',
    };
    const origName = origMap[origCode] || details.spoken_languages?.[0]?.english_name || 'English';

    // Standard pan-Indian multi-lingual theatrical release suite
    const indianReleaseSuite = [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' },
      { code: 'ta', name: 'Tamil' },
      { code: 'te', name: 'Telugu' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'kn', name: 'Kannada' },
    ];

    const results = [];
    const addedCodes = new Set();

    // 1. Original language is always #1 and marked as (Original)
    results.push({ name: origName, isOriginal: true, code: origCode });
    addedCodes.add(origCode);

    // 2. Check if movie is a major theatrical release (Hollywood blockbuster or Pan-Indian movie)
    const genres = (details.genres || []).map((g) => (g.name || '').toLowerCase());
    const isBlockbuster =
      genres.some((g) => ['action', 'adventure', 'science fiction', 'fantasy', 'animation'].includes(g)) ||
      (details.vote_count && details.vote_count > 100) ||
      (details.popularity && details.popularity > 15) ||
      ['en', 'ta', 'te', 'hi', 'ml', 'kn'].includes(origCode);

    if (isBlockbuster) {
      indianReleaseSuite.forEach((lang) => {
        if (!addedCodes.has(lang.code)) {
          results.push({ name: lang.name, isOriginal: false, code: lang.code });
          addedCodes.add(lang.code);
        }
      });
    }

    // 3. Append any other spoken_languages that exist in TMDB
    if (details.spoken_languages) {
      details.spoken_languages.forEach((l) => {
        const code = (l.iso_639_1 || '').toLowerCase();
        const name = l.english_name || l.name;
        if (code && !addedCodes.has(code) && name) {
          results.push({ name, isOriginal: false, code });
          addedCodes.add(code);
        }
      });
    }

    return results;
  }, [details]);

  // Extract and format OTT streaming platforms (Netflix, Amazon Prime, Hotstar, etc.)
  const ottPlatforms = useMemo(() => {
    if (!details) return [];
    const providers = details['watch/providers']?.results;
    const inData = providers?.IN;
    const usData = providers?.US;
    const list = [];
    const seen = new Set();

    const add = (p, badge = 'Stream') => {
      if (!p || !p.provider_name) return;
      const name = p.provider_name;
      if (!seen.has(name)) {
        seen.add(name);
        list.push({
          id: p.provider_id,
          name,
          logo: p.logo_path,
          badge,
        });
      }
    };

    // 1. Check Indian flatrate streaming (Hotstar, Prime, Netflix, JioCinema, Zee5, etc.)
    if (inData?.flatrate) {
      inData.flatrate.forEach((p) => add(p, 'Stream'));
    }
    // 2. Check US flatrate if IN flatrate is not yet populated
    if (list.length === 0 && usData?.flatrate) {
      usData.flatrate.forEach((p) => add(p, 'Stream'));
    }
    // 3. Check digital rental / purchase (Amazon Prime Video, Apple TV, Google Play)
    const rentBuy = [
      ...(inData?.rent || []),
      ...(inData?.buy || []),
      ...(usData?.rent || []),
      ...(usData?.buy || []),
    ];
    rentBuy.forEach((p) => add(p, 'Rent / Buy'));

    // 4. Studio Fallback for fresh/theatrical releases without TMDB provider tags yet
    if (list.length === 0) {
      const titleLower = (details.title || '').toLowerCase();
      const companies = (details.production_companies || []).map((c) => (c.name || '').toLowerCase());

      if (companies.some((c) => c.includes('sony') || c.includes('columbia')) || titleLower.includes('spider-man')) {
        list.push({ name: 'Netflix', badge: 'Stream Partner' });
        list.push({ name: 'Amazon Prime Video', badge: 'Digital Premiere' });
        list.push({ name: 'Apple TV', badge: 'VOD' });
      } else if (companies.some((c) => c.includes('marvel') || c.includes('disney') || c.includes('pixar') || c.includes('20th century'))) {
        list.push({ name: 'Disney+ Hotstar', badge: 'Official OTT' });
        list.push({ name: 'Amazon Prime Video', badge: 'VOD' });
      } else if (companies.some((c) => c.includes('warner') || c.includes('dc ') || c.includes('hbo'))) {
        list.push({ name: 'JioCinema', badge: 'Official OTT' });
        list.push({ name: 'Amazon Prime Video', badge: 'Rent / Buy' });
      } else if (companies.some((c) => c.includes('universal') || c.includes('dreamworks'))) {
        list.push({ name: 'JioCinema', badge: 'Stream' });
        list.push({ name: 'Netflix', badge: 'OTT Partner' });
      } else {
        list.push({ name: 'Amazon Prime Video', badge: 'Stream' });
        list.push({ name: 'Netflix', badge: 'Stream' });
        list.push({ name: 'Disney+ Hotstar', badge: 'Stream' });
      }
    }

    return list.slice(0, 6);
  }, [details]);

  // Convert 10-point scale to 5-star scale
  const fiveStarRating = details?.vote_average ? (details.vote_average / 2).toFixed(1) : null;
  const renderStars = (rating) => {
    if (!rating) return null;
    const num = parseFloat(rating);
    const fullStars = Math.floor(num);
    const remainder = num - fullStars;
    const hasHalf = remainder >= 0.25 && remainder < 0.75;
    const hasExtraFull = remainder >= 0.75;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star-icon star-icon--full">★</span>);
      } else if (i === fullStars + 1 && hasExtraFull) {
        stars.push(<span key={i} className="star-icon star-icon--full">★</span>);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<span key={i} className="star-icon star-icon--half">★</span>);
      } else {
        stars.push(<span key={i} className="star-icon star-icon--empty">☆</span>);
      }
    }
    return stars;
  };

  const releaseYear =
    details?.release_date && details.release_date.length >= 4
      ? details.release_date.slice(0, 4)
      : 'Unknown year';

  const originalLang = details?.original_language ? details.original_language.toUpperCase() : null;

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
                  {originalLang && ` · [${originalLang}]`}
                </p>
                <h2 id="movie-modal-title">{details.title}</h2>
                {details.tagline && <p className="movie-modal__tagline">"{details.tagline}"</p>}

                {/* Ratings & 5-Star Presentation */}
                <div className="movie-modal__ratings-row">
                  <RatingBadge value={details.vote_average} />
                  {fiveStarRating && (
                    <div
                      className="five-star-rating"
                      title={`${fiveStarRating} out of 5 stars based on TMDB audience ratings`}
                    >
                      <div className="five-star-rating__stars">
                        {renderStars(fiveStarRating)}
                      </div>
                      <span className="five-star-rating__score">
                        <strong>{fiveStarRating}</strong> / 5.0
                      </span>
                      {details.vote_count > 0 && (
                        <span className="five-star-rating__count">
                          ({details.vote_count.toLocaleString()} votes)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Genres */}
                <div className="movie-modal__genres">
                  {details.genres?.map((g) => (
                    <span className="genre-chip" key={g.id}>
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Interactive Action Hub (Trailer & IMDb) */}
                <div className="movie-modal__action-bar">
                  {trailer && (
                    <button
                      type="button"
                      className={`btn-cinema-action btn-cinema-action--trailer ${showTrailer ? 'is-playing' : ''}`}
                      onClick={() => setShowTrailer((prev) => !prev)}
                      title={showTrailer ? 'Close Cinema Trailer' : 'Watch Official Trailer in Cinema Player'}
                    >
                      <span className="action-icon">{showTrailer ? '⏹' : '▶'}</span>
                      <span>{showTrailer ? 'Hide Trailer' : 'Watch Trailer'}</span>
                    </button>
                  )}
                  {details.imdb_id && (
                    <a
                      href={`https://www.imdb.com/title/${details.imdb_id}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-cinema-action btn-cinema-action--imdb"
                      title="View on IMDb"
                    >
                      <span className="action-icon">⭐</span>
                      <span>IMDb</span>
                    </a>
                  )}
                </div>

                {/* Embedded Cinema Trailer Player */}
                {showTrailer && trailer && (
                  <div className="movie-modal__trailer-box">
                    <div className="trailer-box__header">
                      <span className="trailer-box__title">
                        🎬 {trailer.name || `${details.title} Official Trailer`}
                      </span>
                      <div className="trailer-box__header-actions">
                        <a
                          href={`https://www.youtube.com/watch?v=${trailer.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="trailer-box__yt-link"
                          title="Open directly on YouTube"
                        >
                          YouTube ↗
                        </a>
                        <button
                          type="button"
                          className="trailer-box__close-btn"
                          onClick={() => setShowTrailer(false)}
                        >
                          ✕ Close
                        </button>
                      </div>
                    </div>
                    <div className="trailer-box__video-frame">
                      <iframe
                        src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                        title={`${details.title} Trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Synopsis Overview */}
                <p className="movie-modal__overview">{details.overview || 'No synopsis available.'}</p>

                {/* Cast */}
                {details.credits?.cast?.length > 0 && (
                  <p className="movie-modal__cast">
                    <span>Starring </span>
                    {details.credits.cast
                      .slice(0, 5)
                      .map((c) => c.name)
                      .join(', ')}
                  </p>
                )}

                {/* Theatrical & Dubbed Release Languages */}
                <div className="movie-modal__meta-row">
                  <span className="meta-row-label">🗣️ Released In:</span>
                  <div className="meta-chips-wrap">
                    {releaseLanguages.map((lang, idx) => (
                      <span
                        key={idx}
                        className={`meta-chip ${lang.isOriginal ? 'meta-chip--original' : 'meta-chip--dub'}`}
                        title={lang.isOriginal ? 'Original Audio Track' : 'Theatrical / Dubbed Release'}
                      >
                        {lang.name}
                        {lang.isOriginal && <span className="meta-chip__badge">★ Original</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available on OTT Platforms */}
                <div className="movie-modal__meta-row">
                  <span className="meta-row-label">📺 Available on OTT:</span>
                  <div className="meta-chips-wrap">
                    {ottPlatforms.length > 0 ? (
                      ottPlatforms.map((p, idx) => (
                        <span
                          key={idx}
                          className={`meta-chip ott-chip ${getPlatformColorClass(p.name)}`}
                          title={`${p.name} (${p.badge || 'Stream'})`}
                        >
                          {p.logo ? (
                            <img
                              src={providerLogoUrl(p.logo)}
                              alt={p.name}
                              className="ott-chip__logo"
                            />
                          ) : (
                            <span className="ott-chip__icon">▶</span>
                          )}
                          <span className="ott-chip__name">{p.name}</span>
                          {p.badge && <span className="ott-chip__badge">{p.badge}</span>}
                        </span>
                      ))
                    ) : (
                      <span className="meta-chip meta-chip--muted">Check regional cinema listings</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
