import { useEffect, useRef, useState, useMemo } from 'react';
import {
  X,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ExternalLink,
  Building2,
  Film,
  Navigation,
  Search,
} from 'lucide-react';
import { posterUrl } from '../api/tmdb.js';
import {
  TAMIL_NADU_CITIES,
  getTheatersForCity,
  getCityDetails,
  getSavedCity,
  saveCity,
} from '../data/theaters.js';

export default function ShowtimesModal({
  movie,
  onClose,
  onWatchTrailer,
  _onSelectMovie,
  initialCityId,
}) {
  const [viewMode, setViewMode] = useState('by_movie'); // 'by_movie' | 'by_theater'
  const [selectedCityId, setSelectedCityId] = useState(() => initialCityId || getSavedCity());
  const [districtSearch, setDistrictSearch] = useState('');

  const cityDetails = useMemo(() => getCityDetails(selectedCityId), [selectedCityId]);
  const theaters = useMemo(() => getTheatersForCity(selectedCityId), [selectedCityId]);

  const [selectedTheaterId, setSelectedTheaterId] = useState(() => theaters[0]?.id || '');
  const [currentMovie, setCurrentMovie] = useState(movie || null);
  const modalRef = useRef(null);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return TAMIL_NADU_CITIES;
    const q = districtSearch.toLowerCase().trim();
    return TAMIL_NADU_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.tamilName.includes(q)
    );
  }, [districtSearch]);

  // Synchronize theater selection when city changes
  useEffect(() => {
    if (theaters.length > 0 && !theaters.some((t) => t.id === selectedTheaterId)) {
      setSelectedTheaterId(theaters[0].id);
    }
  }, [theaters, selectedTheaterId]);

  useEffect(() => {
    if (movie) setCurrentMovie(movie);
  }, [movie]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  if (!currentMovie) return null;

  const poster = posterUrl(currentMovie.poster_path, 'w342');
  const bmsCitySlug = cityDetails.bmsSlug || 'chennai';
  const bmsSearchUrl = `https://in.bookmyshow.com/explore/movies-${bmsCitySlug}?search=${encodeURIComponent(
    currentMovie.title || ''
  )}`;

  const releaseLabel =
    currentMovie.release_label ||
    (currentMovie.release_date ? `In Theaters: ${currentMovie.release_date}` : 'Now in Theaters');

  const selectedTheater = theaters.find((t) => t.id === selectedTheaterId) || theaters[0];

  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    saveCity(cityId);
    setDistrictSearch('');
  };

  const getMapsUrl = (theater) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${theater.name} ${theater.location} ${cityDetails.name}`
    )}`;
  };

  return (
    <div
      className="showtimes-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="showtimes-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="showtimes-modal-container" ref={modalRef}>
        {/* Close Button */}
        <button
          type="button"
          className="showtimes-modal__close"
          onClick={onClose}
          aria-label="Close Showtimes"
        >
          <X size={18} />
        </button>

        {/* City / District Selector Bar */}
        <div className="showtimes-city-selector-section">
          <div className="city-selector-header">
            <span className="city-selector-title">
              <MapPin size={13} className="city-pin-icon" />
              <span>Select District / மாவட்டம் ({TAMIL_NADU_CITIES.length} Districts):</span>
            </span>
            <span className="city-current-badge">
              📍 <strong>{cityDetails.tamilName}</strong> ({cityDetails.name}) • {theaters.length} Theaters
            </span>
          </div>

          <div className="city-search-row">
            <div className="city-search-input-wrap">
              <Search size={13} className="city-search-icon" />
              <input
                type="text"
                className="city-search-input"
                placeholder="Search any TN district... (கள்ளக்குறிச்சி, சேலம், கோவை, திருப்பூர்...)"
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
              />
              {districtSearch && (
                <button
                  type="button"
                  className="city-search-clear"
                  onClick={() => setDistrictSearch('')}
                  title="Clear district search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="city-chips-carousel" role="radiogroup" aria-label="Select City or District">
            {filteredDistricts.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`city-select-chip ${selectedCityId === c.id ? 'is-selected' : ''}`}
                onClick={() => handleCityChange(c.id)}
                title={`View theaters in ${c.name} (${c.tamilName})`}
              >
                <span className="city-chip-tamil">{c.tamilName}</span>
                <span className="city-chip-en">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Mode Selector: By Movie vs Browse by Cinema */}
        <div className="showtimes-view-toggle">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'by_movie' ? 'is-active' : ''}`}
            onClick={() => setViewMode('by_movie')}
          >
            <Film size={14} />
            <span>By Movie ({currentMovie.title})</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'by_theater' ? 'is-active' : ''}`}
            onClick={() => setViewMode('by_theater')}
          >
            <Building2 size={14} />
            <span>
              Browse {cityDetails.name} Theaters ({theaters.length})
            </span>
          </button>
        </div>

        {/* Transparent Showtimes Disclosure */}
        <div
          className="showtimes-disclosure-notice"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(235, 179, 58, 0.08)',
            border: '1px solid rgba(235, 179, 58, 0.22)',
            fontSize: '0.8rem',
            color: '#e2be78',
            marginBottom: '16px',
            lineHeight: '1.4',
          }}
        >
          <span style={{ fontSize: '1rem' }}>ℹ️</span>
          <span>
            <strong>Theater Directory Notice:</strong> Showtimes and live seat availability are on BookMyShow; Reelist provides the regional theater directory and quick links.
          </span>
        </div>

        {viewMode === 'by_movie' ? (
          /* ================================================================
             VIEW MODE 1: BY MOVIE (Shows movie header + cinemas in chosen city)
             ================================================================ */
          <>
            {/* Header with Movie Info */}
            <div className="showtimes-modal__header">
              <div className="showtimes-modal__poster-wrap">
                {poster ? (
                  <img
                    src={poster}
                    alt={`${currentMovie.title} theatrical poster`}
                    width="85"
                    height="128"
                    className="showtimes-modal__poster"
                  />
                ) : (
                  <div className="showtimes-modal__poster-placeholder">
                    <Ticket size={24} />
                  </div>
                )}
              </div>
              <div className="showtimes-modal__info">
                <span className="showtimes-modal__tag">
                  <Sparkles size={12} />
                  <span>
                    THEATRICAL DIRECTORY • {cityDetails.name.toUpperCase()} ({cityDetails.tamilName})
                  </span>
                </span>
                <h2 id="showtimes-modal-title" className="showtimes-modal__title">
                  {currentMovie.title}
                </h2>
                <div className="showtimes-modal__meta">
                  <span className="showtimes-modal__badge showtimes-modal__badge--date">
                    <Calendar size={12} />
                    <span>{currentMovie.full_release_date || releaseLabel}</span>
                  </span>
                  {currentMovie.duration && (
                    <span className="showtimes-modal__badge showtimes-modal__badge--date">
                      <Clock size={12} />
                      <span>{currentMovie.duration}</span>
                    </span>
                  )}
                  {currentMovie.original_language && (
                    <span className="showtimes-modal__badge showtimes-modal__badge--rating">
                      <span>Lang: {currentMovie.original_language.toUpperCase()}</span>
                    </span>
                  )}
                  {currentMovie.vote_average && (
                    <span className="showtimes-modal__badge showtimes-modal__badge--rating">
                      ★ {Number(currentMovie.vote_average).toFixed(1)} / 10
                    </span>
                  )}
                </div>
                <div className="showtimes-modal__actions-row">
                  <a
                    href={bmsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="showtimes-bms-btn"
                    title={`Book ${currentMovie.title} tickets in ${cityDetails.name} on BookMyShow`}
                  >
                    <Ticket size={13} />
                    <span>Book on BookMyShow ({cityDetails.name})</span>
                    <ExternalLink size={12} />
                  </a>

                  {onWatchTrailer && (
                    <button
                      type="button"
                      className="showtimes-modal__trailer-link"
                      onClick={() => {
                        onClose();
                        onWatchTrailer(currentMovie);
                      }}
                    >
                      <span>▶ Watch Official Trailer</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Theaters Directory in Selected City */}
            <div className="showtimes-theaters-list">
              <h3 style={{ fontSize: '1rem', color: '#f1f5f9', margin: '8px 0 12px', fontWeight: 600 }}>
                Cinemas in {cityDetails.name} ({theaters.length})
              </h3>
              {theaters.map((theater) => (
                <div key={theater.id} className="theater-schedule-card">
                  <div className="theater-schedule-card__info">
                    <div className="theater-schedule-card__name-row">
                      <div className="theater-title-group">
                        <h3 className="theater-name">{theater.name}</h3>
                        {theater.distance && (
                          <span className="theater-distance-pill">
                            <Navigation size={10} />
                            <span>{theater.distance}</span>
                          </span>
                        )}
                      </div>
                      <span className="theater-format-badge">{theater.format}</span>
                    </div>
                    <div className="theater-location">
                      <MapPin size={12} />
                      <span>{theater.location}</span>
                    </div>
                  </div>

                  {/* Actions: Book on BMS & Directions on Google Maps */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <a
                      href={bmsSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="showtimes-bms-btn"
                      style={{ flex: '1 1 180px', justifyContent: 'center' }}
                      title={`Book ${currentMovie.title} at ${theater.name} on BookMyShow`}
                    >
                      <Ticket size={13} />
                      <span>Book on BookMyShow</span>
                      <ExternalLink size={12} />
                    </a>
                    <a
                      href={getMapsUrl(theater)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        borderRadius: '8px',
                      }}
                      title={`Directions to ${theater.name} on Google Maps`}
                    >
                      <MapPin size={12} />
                      <span>Directions</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ================================================================
             VIEW MODE 2: BROWSE BY CINEMA (Directory of theaters in city)
             ================================================================ */
          <div className="showtimes-by-cinema-view">
            {/* Cinema Selection Tabs */}
            <div className="cinema-selector-bar" role="tablist" aria-label="Cinemas in selected city">
              {theaters.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`cinema-tab-chip ${selectedTheaterId === t.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedTheaterId(t.id)}
                >
                  <Building2 size={13} />
                  <span>{t.shortName}</span>
                </button>
              ))}
            </div>

            {/* Selected Cinema Spotlight Card */}
            {selectedTheater && (
              <div className="cinema-spotlight-card">
                <div className="cinema-spotlight-header">
                  <div>
                    <h3 className="cinema-spotlight-title">{selectedTheater.name}</h3>
                    <div className="cinema-spotlight-location">
                      <MapPin size={12} />
                      <span>{selectedTheater.location}</span>
                      {selectedTheater.distance && (
                        <>
                          <span className="spotlight-dot">•</span>
                          <span className="spotlight-dist">{selectedTheater.distance}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="cinema-spotlight-format">{selectedTheater.format}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <a
                    href={`https://in.bookmyshow.com/explore/cinemas-${bmsCitySlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="showtimes-bms-btn"
                    title={`View schedule & book tickets at ${selectedTheater.name} on BookMyShow`}
                  >
                    <Ticket size={14} />
                    <span>View Schedule & Book on BookMyShow</span>
                    <ExternalLink size={12} />
                  </a>
                  <a
                    href={getMapsUrl(selectedTheater)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      borderRadius: '8px',
                    }}
                    title={`Open ${selectedTheater.name} on Google Maps`}
                  >
                    <MapPin size={13} />
                    <span>Open in Google Maps</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
