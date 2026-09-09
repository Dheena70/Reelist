import { useEffect, useRef, useState } from 'react';
import { X, Ticket, Calendar, Clock, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { posterUrl } from '../api/tmdb.js';

const THEATERS = [
  {
    name: 'PVR INOX: Luxe Cinema',
    location: 'Phoenix Marketcity • Screen 1',
    format: 'IMAX 4K Laser • Dolby Atmos',
    shows: [
      { time: '10:30 AM', status: 'filling' },
      { time: '02:15 PM', status: 'available' },
      { time: '06:45 PM', status: 'almost_full' },
      { time: '10:15 PM', status: 'available' },
    ],
  },
  {
    name: 'SPI Cinemas: Sathyam',
    location: 'Main Auditorium • Dolby Atmos',
    format: 'Barco 4K RGB • RDX Sound',
    shows: [
      { time: '11:00 AM', status: 'available' },
      { time: '02:45 PM', status: 'filling' },
      { time: '07:15 PM', status: 'almost_full' },
      { time: '10:45 PM', status: 'available' },
    ],
  },
  {
    name: 'AGS Cinemas',
    location: 'Cinemas Screen 3 • OMR Road',
    format: 'RealD 3D • 7.1 Surround',
    shows: [
      { time: '09:45 AM', status: 'available' },
      { time: '01:15 PM', status: 'available' },
      { time: '05:30 PM', status: 'filling' },
      { time: '09:15 PM', status: 'available' },
    ],
  },
  {
    name: 'Cinépolis VIP Recliner Lounge',
    location: 'VIP Screen 2 • Dolby Vision',
    format: 'Dolby Atmos • VIP Dine-In',
    shows: [
      { time: '12:00 PM', status: 'available' },
      { time: '03:30 PM', status: 'filling' },
      { time: '08:00 PM', status: 'almost_full' },
      { time: '11:15 PM', status: 'available' },
    ],
  },
];

const DATE_TABS = [
  { id: 'today', label: 'Today', date: 'Thu, Sep 10' },
  { id: 'tomorrow', label: 'Tomorrow', date: 'Fri, Sep 11' },
  { id: 'sat', label: 'Saturday', date: 'Sat, Sep 12' },
  { id: 'sun', label: 'Sunday', date: 'Sun, Sep 13' },
];

export default function ShowtimesModal({ movie, onClose, onWatchTrailer }) {
  const [selectedDate, setSelectedDate] = useState('today');
  const [bookedSlot, setBookedSlot] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const poster = posterUrl(movie.poster_path, 'w342');
  const releaseLabel = movie.release_label || (movie.release_date ? `In Theaters: ${movie.release_date}` : 'Now in Theaters');

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

        {/* Header with Movie Info */}
        <div className="showtimes-modal__header">
          <div className="showtimes-modal__poster-wrap">
            {poster ? (
              <img src={poster} alt={movie.title} className="showtimes-modal__poster" />
            ) : (
              <div className="showtimes-modal__poster-placeholder">
                <Ticket size={24} />
              </div>
            )}
          </div>
          <div className="showtimes-modal__info">
            <span className="showtimes-modal__tag">
              <Sparkles size={12} />
              <span>THEATRICAL SHOWTIMES</span>
            </span>
            <h2 id="showtimes-modal-title" className="showtimes-modal__title">
              {movie.title}
            </h2>
            <div className="showtimes-modal__meta">
              <span className="showtimes-modal__badge showtimes-modal__badge--date">
                <Calendar size={12} />
                <span>{releaseLabel}</span>
              </span>
              {movie.vote_average && (
                <span className="showtimes-modal__badge showtimes-modal__badge--rating">
                  ★ {Number(movie.vote_average).toFixed(1)} / 10
                </span>
              )}
            </div>
            {onWatchTrailer && (
              <button
                type="button"
                className="showtimes-modal__trailer-link"
                onClick={() => {
                  onClose();
                  onWatchTrailer(movie);
                }}
              >
                <span>▶ Watch Official Trailer</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Selector Tabs */}
        <div className="showtimes-modal__dates">
          {DATE_TABS.map((tab) => (
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
              <strong>Showtime Selected: {bookedSlot.time}</strong> at {bookedSlot.theater} ({bookedSlot.dateLabel})
              <div className="booking-sub">Fast-track cinema kiosk / box office ticket reservations available.</div>
            </div>
          </div>
        )}

        {/* Theaters & Showtime Slots */}
        <div className="showtimes-theaters-list">
          {THEATERS.map((theater, idx) => (
            <div key={idx} className="theater-schedule-card">
              <div className="theater-schedule-card__info">
                <div className="theater-schedule-card__name-row">
                  <h3 className="theater-name">{theater.name}</h3>
                  <span className="theater-format-badge">{theater.format}</span>
                </div>
                <div className="theater-location">
                  <MapPin size={12} />
                  <span>{theater.location}</span>
                </div>
              </div>

              <div className="theater-slots-grid">
                {theater.shows.map((show, sIdx) => {
                  const isSelected =
                    bookedSlot &&
                    bookedSlot.theater === theater.name &&
                    bookedSlot.time === show.time &&
                    bookedSlot.date === selectedDate;

                  return (
                    <button
                      key={sIdx}
                      type="button"
                      className={`show-slot-btn ${isSelected ? 'is-chosen' : ''} show-slot--${show.status}`}
                      onClick={() =>
                        setBookedSlot({
                          theater: theater.name,
                          time: show.time,
                          date: selectedDate,
                          dateLabel: DATE_TABS.find((d) => d.id === selectedDate)?.date,
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
