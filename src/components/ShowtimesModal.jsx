import { useEffect, useRef, useState, useMemo } from 'react';
import {
  X,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Building2,
  Film,
  Navigation,
  Search,
} from 'lucide-react';
import { posterUrl, THEATRICAL_NOW_PLAYING } from '../api/tmdb.js';
import {
  TAMIL_NADU_CITIES,
  getTheatersForCity,
  getCityDetails,
  getSavedCity,
  saveCity,
} from '../data/theaters.js';

function getUpcomingDateTabs() {
  const tabs = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  for (let i = 0; i < 4; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dayName = days[d.getDay()];
    const monthName = months[d.getMonth()];
    const dateNum = d.getDate();
    let label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName;
    tabs.push({
      id: `day_${i}`,
      label,
      date: `${dayName}, ${monthName} ${dateNum}`,
    });
  }
  return tabs;
}

export default function ShowtimesModal({
  movie,
  onClose,
  onWatchTrailer,
  onSelectMovie,
  initialCityId,
}) {
  const dateTabs = useMemo(() => getUpcomingDateTabs(), []);
  const [selectedDate, setSelectedDate] = useState('day_0');
  const [bookedSlot, setBookedSlot] = useState(null);
  const [viewMode, setViewMode] = useState('by_movie'); // 'by_movie' | 'by_theater'
  const [selectedCityId, setSelectedCityId] = useState(() => initialCityId || getSavedCity());
  const [districtSearch, setDistrictSearch] = useState('');

  const cityDetails = useMemo(() => getCityDetails(selectedCityId), [selectedCityId]);
  const theaters = useMemo(() => getTheatersForCity(selectedCityId), [selectedCityId]);

  const [selectedTheaterId, setSelectedTheaterId] = useState(() => theaters[0]?.id || '');
  const [currentMovie, setCurrentMovie] = useState(movie || THEATRICAL_NOW_PLAYING[0]);
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
  const releaseLabel =
    currentMovie.release_label ||
    (currentMovie.release_date ? `In Theaters: ${currentMovie.release_date}` : 'Now in Theaters');

  const selectedTheater = theaters.find((t) => t.id === selectedTheaterId) || theaters[0];

  const handleSwitchMovie = (movieRef) => {
    const matched =
      THEATRICAL_NOW_PLAYING.find(
        (m) =>
          m.id === movieRef.id ||
          (m.title && movieRef.title && m.title.toLowerCase() === movieRef.title.toLowerCase())
      ) || movieRef;

    setCurrentMovie(matched);
    setViewMode('by_movie');
    setBookedSlot(null);
    if (onSelectMovie) onSelectMovie(matched);
  };

  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    saveCity(cityId);
    setBookedSlot(null);
  };

  const bmsCitySlug = cityDetails?.bmsSlug || 'salem';
  const bmsSearchUrl = `https://in.bookmyshow.com/explore/movies-${bmsCitySlug}?search=${encodeURIComponent(
    currentMovie.title || ''
  )}`;

  return (
    <div
      className="showtimes-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="showtimes-modal-title"
    >
      <div className="showtimes-modal" ref={modalRef}>
        {/* Close Button */}
        <button
          type="button"
          className="showtimes-modal__close"
          onClick={onClose}
          aria-label="Close Showtimes"
        >
          <X size={18} />
        </button>

        {/* City / District Selector Bar (Covers all 38 Districts in Tamil Nadu with live search) */}
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
                    THEATRICAL SHOWTIMES • {cityDetails.name.toUpperCase()} ({cityDetails.tamilName})
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

            {/* Date Selector Tabs */}
            <div className="showtimes-modal__dates">
              {dateTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`showtimes-date-btn ${selectedDate === tab.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedDate(tab.id);
                    setBookedSlot(null);
                  }}
                >
                  <span className="date-btn__label">{tab.label}</span>
                  <span className="date-btn__day">{tab.date}</span>
                </button>
              ))}
            </div>

            {/* Selected Slot Notification Banner */}
            {bookedSlot && (
              <div className="showtimes-booking-banner">
                <CheckCircle2 size={16} className="booking-icon" />
                <div>
                  <strong>Showtime Selected: {bookedSlot.time}</strong> at {bookedSlot.theater} (
                  {bookedSlot.dateLabel})
                  <div className="booking-sub">
                    Box office and online reservations active for {currentMovie.title} in {cityDetails.name}.
                  </div>
                </div>
              </div>
            )}

            {/* Theaters in Selected City */}
            <div className="showtimes-theaters-list">
              {theaters.map((theater) => {
                const movieEntry = theater.screeningMovies?.find(
                  (m) =>
                    m.id === currentMovie.id ||
                    (m.title && m.title.toLowerCase() === currentMovie.title.toLowerCase())
                );
                const slotsToRender = movieEntry?.shows || theater.shows;
                const otherMovies = (theater.screeningMovies || []).filter(
                  (m) =>
                    m.id !== currentMovie.id &&
                    m.title.toLowerCase() !== currentMovie.title.toLowerCase()
                );

                return (
                  <div key={theater.id} className="theater-schedule-card">
                    <div className="theater-schedule-card__info">
                      <div className="theater-schedule-card__name-row">
                        <div className="theater-title-group">
                          <h3 className="theater-name">{theater.name}</h3>
                          <span className="theater-distance-pill">
                            <Navigation size={10} />
                            <span>{theater.distance}</span>
                          </span>
                        </div>
                        <span className="theater-format-badge">
                          {movieEntry?.format || theater.format}
                        </span>
                      </div>
                      <div className="theater-location">
                        <MapPin size={12} />
                        <span>{theater.location}</span>
                      </div>
                    </div>

                    {/* Showtime Slots Grid */}
                    <div className="theater-slots-grid">
                      {slotsToRender.map((show, sIdx) => {
                        const isSelected =
                          bookedSlot &&
                          bookedSlot.theater === theater.name &&
                          bookedSlot.time === show.time &&
                          bookedSlot.date === selectedDate;

                        return (
                          <button
                            key={sIdx}
                            type="button"
                            className={`show-slot-btn ${
                              isSelected ? 'is-chosen' : ''
                            } show-slot--${show.status}`}
                            onClick={() =>
                              setBookedSlot({
                                theater: theater.name,
                                time: show.time,
                                date: selectedDate,
                                dateLabel: dateTabs.find((d) => d.id === selectedDate)?.date,
                              })
                            }
                            title={`Select ${show.time} show at ${theater.name}`}
                          >
                            <Clock size={11} className="slot-clock" />
                            <span className="slot-time">{show.time}</span>
                            <span className="slot-pill">
                              {show.status === 'filling'
                                ? 'Filling Fast'
                                : show.status === 'almost_full'
                                ? 'Few Seats'
                                : 'Available'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Also Playing at this Theater */}
                    {otherMovies.length > 0 && (
                      <div className="theater-other-movies-row">
                        <span className="other-movies-label">
                          <Film size={11} />
                          <span>Also screening at this cinema today:</span>
                        </span>
                        <div className="other-movies-chips">
                          {otherMovies.map((om) => (
                            <button
                              key={om.id}
                              type="button"
                              className="theater-other-chip"
                              onClick={() => handleSwitchMovie(om)}
                              title={`Switch to showtimes for ${om.title}`}
                            >
                              <span>{om.title}</span>
                              <span className="other-chip-lang">{om.lang}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* ================================================================
             VIEW MODE 2: BROWSE BY CINEMA (All movies playing at chosen theater)
             ================================================================ */
          <div className="showtimes-by-cinema-view">
            {/* Cinema Selection Tabs */}
            <div className="cinema-selector-bar" role="tablist" aria-label="Cinemas in selected city">
              {theaters.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`cinema-tab-chip ${selectedTheaterId === t.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedTheaterId(t.id);
                    setBookedSlot(null);
                  }}
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
                      <span className="spotlight-dot">•</span>
                      <span className="spotlight-dist">{selectedTheater.distance}</span>
                    </div>
                  </div>
                  <span className="cinema-spotlight-format">{selectedTheater.format}</span>
                </div>
                <div className="cinema-spotlight-screens">
                  <span>Auditoriums: <strong>{selectedTheater.screens}</strong></span>
                </div>
              </div>
            )}

            {/* Date Selector Tabs */}
            <div className="showtimes-modal__dates">
              {dateTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`showtimes-date-btn ${selectedDate === tab.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedDate(tab.id);
                    setBookedSlot(null);
                  }}
                >
                  <span className="date-btn__label">{tab.label}</span>
                  <span className="date-btn__day">{tab.date}</span>
                </button>
              ))}
            </div>

            {/* Selected Slot Notification Banner */}
            {bookedSlot && (
              <div className="showtimes-booking-banner">
                <CheckCircle2 size={16} className="booking-icon" />
                <div>
                  <strong>Showtime Selected: {bookedSlot.time}</strong> at {bookedSlot.theater} for{' '}
                  <em>{bookedSlot.movieTitle}</em>
                </div>
              </div>
            )}

            {/* List of All Movies Running at this Selected Theater */}
            {selectedTheater && (
              <div className="cinema-movies-schedule-list">
                <div className="cinema-schedule-section-header">
                  <h4>
                    Now Screening at {selectedTheater.name} Today ({selectedTheater.screeningMovies.length} Movies)
                  </h4>
                </div>

                {selectedTheater.screeningMovies.map((m) => {
                  const fullItem = THEATRICAL_NOW_PLAYING.find(
                    (tp) => tp.id === m.id || (tp.title && tp.title.toLowerCase() === m.title.toLowerCase())
                  );
                  const itemPoster = fullItem ? posterUrl(fullItem.poster_path, 'w185') : null;

                  return (
                    <div key={m.id} className="cinema-movie-card">
                      <div className="cinema-movie-card__top">
                        <div className="cinema-movie-card__poster-box">
                          {itemPoster ? (
                            <img
                              src={itemPoster}
                              alt={`${m.title} screening poster`}
                              className="cinema-movie-card__poster"
                              width="50"
                              height="75"
                            />
                          ) : (
                            <div className="cinema-movie-card__poster-fallback">
                              <Film size={20} />
                            </div>
                          )}
                        </div>

                        <div className="cinema-movie-card__details">
                          <div className="cinema-movie-title-row">
                            <h4 className="cinema-movie-title">{m.title}</h4>
                            <span className="cinema-movie-lang">{m.lang}</span>
                          </div>
                          <div className="cinema-movie-screen-format">
                            <Sparkles size={11} />
                            <span>{m.format}</span>
                          </div>
                          <div className="cinema-movie-actions">
                            <button
                              type="button"
                              className="cinema-view-details-link"
                              onClick={() => handleSwitchMovie(m)}
                            >
                              <span>Movie Synopsis & Details →</span>
                            </button>
                            <a
                              href={`https://in.bookmyshow.com/explore/movies-${bmsCitySlug}?search=${encodeURIComponent(
                                m.title
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cinema-bms-mini-btn"
                              title={`Book ${m.title} on BookMyShow`}
                            >
                              <Ticket size={11} />
                              <span>Book</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Showtimes for this movie at this theater */}
                      <div className="theater-slots-grid cinema-movie-slots">
                        {m.shows.map((show, sIdx) => {
                          const isSelected =
                            bookedSlot &&
                            bookedSlot.theater === selectedTheater.name &&
                            bookedSlot.movieTitle === m.title &&
                            bookedSlot.time === show.time &&
                            bookedSlot.date === selectedDate;

                          return (
                            <button
                              key={sIdx}
                              type="button"
                              className={`show-slot-btn ${
                                isSelected ? 'is-chosen' : ''
                              } show-slot--${show.status}`}
                              onClick={() =>
                                setBookedSlot({
                                  theater: selectedTheater.name,
                                  movieTitle: m.title,
                                  time: show.time,
                                  date: selectedDate,
                                  dateLabel: dateTabs.find((d) => d.id === selectedDate)?.date,
                                })
                              }
                              title={`Select ${show.time} show for ${m.title}`}
                            >
                              <Clock size={11} className="slot-clock" />
                              <span className="slot-time">{show.time}</span>
                              <span className="slot-pill">
                                {show.status === 'filling'
                                  ? 'Filling Fast'
                                  : show.status === 'almost_full'
                                  ? 'Few Seats'
                                  : 'Available'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
