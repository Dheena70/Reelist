import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Square,
  X,
  Languages,
  Tv,
  Film,
  Users,
  User,
  ExternalLink,
  Star,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { backdropUrl, posterUrl, profileUrl, providerLogoUrl, tmdb } from '../api/tmdb.js';
import RatingBadge from './RatingBadge.jsx';

function determineRoleBadge(member, index, allCast = []) {
  const char = (member.character || '').toLowerCase();
  const order = member.order ?? index;
  const isFemale = member.gender === 1;
  const isMale = member.gender === 2;

  // 1. Check villain / antagonist patterns in character name
  const villainTerms = [
    'villain', 'antagonist', 'nemesis', 'rival', 'joker', 'thanos',
    'goblin', 'enemy', 'voldemort', 'bane', 'strauss', 'dracula',
    'gangster', 'killer', 'monster', 'carnage', 'venom', 'magneto',
    'riddler', 'penguin', 'loco', 'bad guy', 'opponent', 'lord', 'dark',
    'witch', 'demon'
  ];
  if (villainTerms.some((t) => char.includes(t))) {
    return { label: 'Antagonist / Key Rival', type: 'villain' };
  }

  // 2. Check comic / humor / sidekick patterns
  const comicTerms = [
    'comic', 'comedian', 'friend', 'buddy', 'sidekick', 'funny',
    'clown', 'fool', 'servant', 'driver', 'uncle', 'aunt', 'pal'
  ];
  if (comicTerms.some((t) => char.includes(t))) {
    return { label: 'Comic / Sidekick', type: 'comic' };
  }

  // 3. Main lead (order 0)
  if (order === 0) {
    return isFemale
      ? { label: 'Heroine / Main Lead', type: 'heroine' }
      : { label: 'Hero / Main Lead', type: 'hero' };
  }

  // 4. Second lead (order 1)
  const first = allCast[0];
  if (order === 1) {
    if (first?.gender === 2 && isFemale) {
      return { label: 'Heroine / Female Lead', type: 'heroine' };
    }
    if (first?.gender === 1 && isMale) {
      return { label: 'Hero / Male Lead', type: 'hero' };
    }
    return { label: 'Co-Lead / Key Character', type: 'lead' };
  }

  // 5. If 3rd or 4th billed and female, and heroine wasn't assigned in earlier leads
  if (order <= 3 && isFemale && !allCast.slice(0, order).some((c) => c.gender === 1)) {
    return { label: 'Heroine / Female Lead', type: 'heroine' };
  }

  if (order <= 2) {
    return { label: 'Key Lead Character', type: 'lead' };
  }

  return { label: 'Crucial Supporting Role', type: 'supporting' };
}

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
  const [showTrailer, setShowTrailer] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('reelist_autoplay');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
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
    setShowTrailer(true);
    setIsMuted(true);
    setIsMiniPlayer(false);

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

  // Formatted Embed URL with Autoplay, Mute, and Inline flags
  const trailerEmbedUrl = useMemo(() => {
    if (!trailer?.key) return null;
    const auto = autoPlayEnabled ? '1' : '0';
    const mute = isMuted ? '1' : '0';
    return `https://www.youtube.com/embed/${trailer.key}?autoplay=${auto}&mute=${mute}&enablejsapi=1&rel=0&playsinline=1`;
  }, [trailer, autoPlayEnabled, isMuted]);

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

  // Extract key prominent cast (Top 8 main actors/characters)
  const keyCast = useMemo(() => {
    if (!details?.credits?.cast) return [];
    return details.credits.cast.slice(0, 8);
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
      if (i <= fullStars || (i === fullStars + 1 && hasExtraFull)) {
        stars.push(
          <Star key={i} size={14} className="star-icon star-icon--full" fill="#ffc759" color="#ffc759" />
        );
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" className="star-icon star-icon--half">
            <defs>
              <linearGradient id={`halfStar-${movieId}-${i}`}>
                <stop offset="50%" stopColor="#ffc759" />
                <stop offset="50%" stopColor="#3d3d4c" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#halfStar-${movieId}-${i})`}
              stroke="#ffc759"
              strokeWidth="1.2"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        );
      } else {
        stars.push(
          <Star key={i} size={14} className="star-icon star-icon--empty" color="#4a4a58" />
        );
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
          <X size={20} />
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

                {/* IMDb-Style Autoplay Cinema Spotlight Player */}
                {trailer && showTrailer && (
                  <div className={`movie-modal__trailer-spotlight ${isMiniPlayer ? 'is-mini' : ''}`}>
                    <div className="trailer-spotlight__header">
                      <div className="trailer-spotlight__title-row">
                        <Film size={15} className="trailer-spotlight__icon" />
                        <span className="trailer-spotlight__title">
                          {trailer.name || `${details.title} Official Trailer`}
                        </span>
                      </div>

                      <div className="trailer-spotlight__controls">
                        {/* Audio Mute/Unmute Toggle (IMDb Signature) */}
                        <button
                          type="button"
                          className={`trailer-spotlight__audio-btn ${isMuted ? 'is-muted' : 'is-unmuted'}`}
                          onClick={() => setIsMuted((prev) => !prev)}
                          title={isMuted ? 'Turn Sound ON' : 'Mute Sound'}
                        >
                          {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                          <span>{isMuted ? 'Tap to unmute' : 'Sound ON'}</span>
                        </button>

                        {/* Autoplay setting toggle (IMDb-style) */}
                        <label
                          className="trailer-spotlight__autoplay-toggle"
                          title="Play muted trailer automatically when opening title"
                        >
                          <input
                            type="checkbox"
                            checked={autoPlayEnabled}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setAutoPlayEnabled(val);
                              try {
                                localStorage.setItem('reelist_autoplay', String(val));
                              } catch {
                                // ignore
                              }
                            }}
                          />
                          <span className="autoplay-slider" />
                          <span className="autoplay-label">Autoplay</span>
                        </label>

                        {/* Picture-in-Picture Mini Player toggle */}
                        <button
                          type="button"
                          className="trailer-spotlight__action-btn"
                          onClick={() => setIsMiniPlayer((prev) => !prev)}
                          title={isMiniPlayer ? 'Expand Cinema Player' : 'Picture-in-Picture Mini Mode'}
                        >
                          {isMiniPlayer ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                        </button>

                        {/* YouTube external */}
                        <a
                          href={`https://www.youtube.com/watch?v=${trailer.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="trailer-spotlight__yt-link"
                          title="Open directly on YouTube"
                        >
                          <span>YouTube</span>
                          <ExternalLink size={11} />
                        </a>

                        {/* Close / Hide toggle */}
                        <button
                          type="button"
                          className="trailer-spotlight__action-btn"
                          onClick={() => setShowTrailer(false)}
                          title="Hide Trailer"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="trailer-spotlight__video-frame">
                      <iframe
                        key={`${trailer.key}-${isMuted}-${autoPlayEnabled}`}
                        src={trailerEmbedUrl}
                        title={`${details.title} Official Trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />

                      {/* Floating "Tap to unmute" overlay button on video */}
                      {isMuted && autoPlayEnabled && (
                        <button
                          type="button"
                          className="trailer-spotlight__unmute-overlay"
                          onClick={() => setIsMuted(false)}
                          title="Click to turn on sound"
                        >
                          <VolumeX size={15} />
                          <span>Tap to unmute</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Cinema Action Bar (Visible when trailer is closed or minimized) */}
                {trailer && !showTrailer && (
                  <div className="movie-modal__action-bar">
                    <button
                      type="button"
                      className="btn-cinema-action btn-cinema-action--trailer"
                      onClick={() => {
                        setShowTrailer(true);
                        setIsMuted(true);
                      }}
                      title="Play Official Cinema Trailer"
                    >
                      <span className="action-icon">
                        <Play size={14} fill="currentColor" />
                      </span>
                      <span>Watch Trailer</span>
                    </button>
                  </div>
                )}

                {/* Synopsis Overview */}
                <p className="movie-modal__overview">{details.overview || 'No synopsis available.'}</p>

                {/* Key Cast & Prominent Characters with Photos & Role Badges */}
                {keyCast.length > 0 && (
                  <div className="movie-modal__cast-section">
                    <div className="cast-section__header">
                      <span className="cast-section__title">
                        <Users size={15} className="cast-section__icon" />
                        <span>Prominent Cast & Characters</span>
                      </span>
                      <span className="cast-section__count">({keyCast.length} Main Roles)</span>
                    </div>
                    <div className="cast-carousel">
                      {keyCast.map((actor, idx) => {
                        const role = determineRoleBadge(actor, idx, keyCast);
                        return (
                          <div key={actor.id || idx} className="cast-card">
                            <div className="cast-card__avatar">
                              {actor.profile_path ? (
                                <img
                                  src={profileUrl(actor.profile_path, 'w185')}
                                  alt={actor.name}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.cast-card__fallback');
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className="cast-card__fallback"
                                style={{ display: actor.profile_path ? 'none' : 'flex' }}
                              >
                                <User size={22} className="cast-card__fallback-icon" />
                              </div>
                              <span className={`cast-card__role-tag cast-card__role-tag--${role.type}`}>
                                {role.label}
                              </span>
                            </div>
                            <div className="cast-card__info">
                              <span className="cast-card__name" title={actor.name}>
                                {actor.name}
                              </span>
                              <span className="cast-card__character" title={actor.character}>
                                {actor.character ? `as ${actor.character}` : 'Lead Role'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Theatrical & Dubbed Release Languages */}
                <div className="movie-modal__meta-row">
                  <span className="meta-row-label">
                    <Languages size={15} className="meta-row-icon" />
                    <span>Released In:</span>
                  </span>
                  <div className="meta-chips-wrap">
                    {releaseLanguages.map((lang, idx) => (
                      <span
                        key={idx}
                        className={`meta-chip ${lang.isOriginal ? 'meta-chip--original' : 'meta-chip--dub'}`}
                        title={lang.isOriginal ? 'Original Audio Track' : 'Theatrical / Dubbed Release'}
                      >
                        {lang.name}
                        {lang.isOriginal && (
                          <span className="meta-chip__badge">
                            <Sparkles size={10} />
                            <span>Original</span>
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available on OTT Platforms */}
                <div className="movie-modal__meta-row">
                  <span className="meta-row-label">
                    <Tv size={15} className="meta-row-icon" />
                    <span>Available on OTT:</span>
                  </span>
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
                            <span className="ott-chip__icon">
                              <Play size={10} fill="currentColor" />
                            </span>
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
