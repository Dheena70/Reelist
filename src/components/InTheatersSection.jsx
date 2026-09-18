import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Film,
  Ticket,
  Play,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Globe2,
  MapPin,
} from 'lucide-react';
import MovieCard from './MovieCard.jsx';
import {
  tmdb,
  posterUrl,
  THEATRICAL_NOW_PLAYING,
  THEATRICAL_COMING_SOON,
} from '../api/tmdb.js';
import {
  TAMIL_NADU_CITIES,
  getSavedCity,
  saveCity,
  getCityDetails,
  getTheatersForCity,
} from '../data/theaters.js';

const LANGUAGE_FILTERS = [
  { id: 'all', label: 'All Releases' },
  { id: 'ta', label: 'Tamil (தமிழ்)' },
  { id: 'te', label: 'Telugu (తెలుగు)' },
  { id: 'hi', label: 'Hindi (हिंदी)' },
  { id: 'ml', label: 'Malayalam (മലയാളം)' },
  { id: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { id: 'en', label: 'English / Global' },
];

function getLanguageLabel(code) {
  const map = {
    ta: 'Tamil',
    te: 'Telugu',
    hi: 'Hindi',
    ml: 'Malayalam',
    kn: 'Kannada',
    en: 'English',
  };
  return map[code] || (code ? code.toUpperCase() : 'Cinema');
}

function formatDateBadge(dateStr, label) {
  if (label && /^[A-Z]{3}\s+\d{1,2}$/.test(label.trim())) {
    return label.trim();
  }
  if (!dateStr) return label || 'In theaters';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (m >= 0 && m < 12 && !isNaN(d)) {
      return `${months[m]} ${String(d).padStart(2, '0')}`;
    }
  }
  return label || dateStr;
}

export default function InTheatersSection({ onSelectMovie, onOpenShowtimes }) {
  const [activeTab, setActiveTab] = useState('now_playing'); // 'now_playing' | 'upcoming'
  const [selectedLang, setSelectedLang] = useState('all');
  const [nowPlayingMovies, setNowPlayingMovies] = useState(THEATRICAL_NOW_PLAYING);
  const [upcomingMovies, setUpcomingMovies] = useState(THEATRICAL_COMING_SOON);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState({ city: 'Chennai', country: 'IN', regionName: 'Tamil Nadu' });
  const [selectedCityId, setSelectedCityId] = useState(() => getSavedCity());
  const currentCity = useMemo(() => getCityDetails(selectedCityId), [selectedCityId]);
  const cityTheaters = useMemo(() => getTheatersForCity(selectedCityId), [selectedCityId]);
  const scrollRef = useRef(null);

  // 1. Live Free IP-based Geolocation Lookup (100% Free, zero cost)
  useEffect(() => {
    let cancelled = false;
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.city && data?.country_code) {
          setUserLocation({
            city: data.city,
            country: data.country_code,
            regionName: data.region || 'India',
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Fetch live now playing and upcoming from TMDB on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.allSettled([
      tmdb.nowPlaying(1, 'IN'),
      tmdb.nowPlaying(1, 'US'),
      tmdb.discoverTheatrical({ region: 'IN' }),
      tmdb.upcoming(1, 'IN'),
      tmdb.upcoming(1, 'US'),
    ])
      .then(([nowInRes, nowUsRes, discInRes, upInRes, upUsRes]) => {
        if (cancelled) return;

        const collectedNow = [];
        if (nowInRes.status === 'fulfilled' && nowInRes.value?.results) {
          collectedNow.push(...nowInRes.value.results);
        }
        if (nowUsRes.status === 'fulfilled' && nowUsRes.value?.results) {
          collectedNow.push(...nowUsRes.value.results);
        }
        if (discInRes.status === 'fulfilled' && discInRes.value?.results) {
          collectedNow.push(...discInRes.value.results);
        }

        if (collectedNow.length > 0) {
          const apiMovies = collectedNow
            .filter((m) => m.poster_path && m.title)
            .map((m) => ({
              ...m,
              release_label: formatDateBadge(m.release_date, 'In theaters'),
            }));
          if (apiMovies.length > 0) {
            // Keep curated Indian movies while merging live additions without duplicate IDs
            const existingIds = new Set(THEATRICAL_NOW_PLAYING.map((c) => c.id));
            const seenNewIds = new Set();
            const uniqueApiMovies = [];
            for (const m of apiMovies) {
              if (!existingIds.has(m.id) && !seenNewIds.has(m.id)) {
                seenNewIds.add(m.id);
                uniqueApiMovies.push(m);
              }
            }
            setNowPlayingMovies([...THEATRICAL_NOW_PLAYING, ...uniqueApiMovies]);
          }
        }

        const collectedUp = [];
        if (upInRes.status === 'fulfilled' && upInRes.value?.results) {
          collectedUp.push(...upInRes.value.results);
        }
        if (upUsRes.status === 'fulfilled' && upUsRes.value?.results) {
          collectedUp.push(...upUsRes.value.results);
        }

        if (collectedUp.length > 0) {
          const apiUpcoming = collectedUp
            .filter((m) => m.poster_path && m.title)
            .map((m) => ({
              ...m,
              release_label: formatDateBadge(m.release_date, 'Coming soon'),
            }));
          if (apiUpcoming.length > 0) {
            const existingUpIds = new Set(THEATRICAL_COMING_SOON.map((c) => c.id));
            const seenUpIds = new Set();
            const uniqueApiUp = [];
            for (const m of apiUpcoming) {
              if (!existingUpIds.has(m.id) && !seenUpIds.has(m.id)) {
                seenUpIds.add(m.id);
                uniqueApiUp.push(m);
              }
            }
            setUpcomingMovies([...THEATRICAL_COMING_SOON, ...uniqueApiUp]);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 3. Dynamic Real-Time Theatrical Discovery when language changes
  useEffect(() => {
    if (selectedLang === 'all') return;
    let cancelled = false;

    tmdb.discoverTheatrical({
      region: userLocation.country || 'IN',
      language: selectedLang,
    })
      .then((res) => {
        if (cancelled || !res?.results?.length) return;
        const liveItems = res.results
          .filter((m) => m.poster_path && m.title)
          .map((m) => ({
            ...m,
            release_label: formatDateBadge(m.release_date, 'In theaters'),
          }));

        if (liveItems.length > 0) {
          setNowPlayingMovies((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newUnique = liveItems.filter((m) => !existingIds.has(m.id));
            return newUnique.length > 0 ? [...prev, ...newUnique] : prev;
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [selectedLang, userLocation.country]);

  const currentList = useMemo(() => {
    const base = activeTab === 'now_playing' ? nowPlayingMovies : upcomingMovies;
    if (selectedLang === 'all') return base;
    return base.filter((m) => (m.original_language || 'en').toLowerCase() === selectedLang);
  }, [activeTab, nowPlayingMovies, upcomingMovies, selectedLang]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -380 : 380;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="in-theaters-section">
      {/* Section Header */}
      <div className="in-theaters-section__header">
        <div className="in-theaters-section__title-wrap">
          <div className="in-theaters-section__headline">
            <span className="theaters-badge-indicator" />
            <h2 className="in-theaters-section__title">
              In Theaters
            </h2>
            <button
              type="button"
              className="theaters-location-chip theaters-location-chip--interactive"
              onClick={() => onOpenShowtimes && onOpenShowtimes(currentList[0] || THEATRICAL_NOW_PLAYING[0])}
              title={`View showtimes for ${cityTheaters.length} cinemas in ${currentCity.name} (${currentCity.tamilName})`}
            >
              <MapPin size={11} />
              <span>{currentCity.tamilName} ({currentCity.name}) • {cityTheaters.length} Cinemas Active</span>
              <span className="location-chip__action">View Showtimes →</span>
            </button>
          </div>
          <p className="in-theaters-section__subtitle">
            Tamil, Telugu, Hindi, Malayalam, Kannada & Global Theatrical Releases
          </p>
        </div>

        {/* Action Controls: Tabs & Carousel Navigation */}
        <div className="in-theaters-section__controls">
          <div className="in-theaters-tabs">
            <button
              type="button"
              className={`theater-tab-btn ${activeTab === 'now_playing' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('now_playing')}
            >
              <Clapperboard size={13} />
              <span>Now In Theaters</span>
              <span className="tab-count">{nowPlayingMovies.length}</span>
            </button>
            <button
              type="button"
              className={`theater-tab-btn ${activeTab === 'upcoming' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <Calendar size={13} />
              <span>Coming Soon</span>
              <span className="tab-count">{upcomingMovies.length}</span>
            </button>
          </div>

          {/* Dedicated Header Carousel Controls (Issue 4: Eliminates poster occlusion) */}
          <div className="carousel-nav-group" aria-label="Carousel scroll navigation">
            <button
              type="button"
              className="btn-icon carousel-arrow-btn carousel-arrow-btn--header"
              onClick={() => handleScroll('left')}
              title="Scroll left"
              aria-label="Scroll carousel left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="btn-icon carousel-arrow-btn carousel-arrow-btn--header"
              onClick={() => handleScroll('right')}
              title="Scroll right"
              aria-label="Scroll carousel right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Tamil Nadu District / City Filter Bar */}
      <div className="theaters-district-bar-wrapper">
        <div className="theaters-district-bar">
          <div className="theaters-district-bar__title">
            <MapPin size={13} />
            <span>Select District / ஊர்:</span>
          </div>
          <div className="theaters-district-chips-container" role="region" aria-label="District selection">
            <div className="theaters-district-chips">
              {TAMIL_NADU_CITIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`district-filter-chip ${selectedCityId === c.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedCityId(c.id);
                    saveCity(c.id);
                  }}
                  title={`Show theaters & movies for ${c.name} (${c.tamilName})`}
                >
                  <span className="district-chip-tamil">{c.tamilName}</span>
                  <span className="district-chip-en">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Cinema Language Filter Bar */}
      <div className="theaters-lang-bar-wrapper">
        <div className="theaters-lang-bar">
          <div className="theaters-lang-bar__title">
            <Globe2 size={13} />
            <span>Filter by Language:</span>
          </div>
          <div className="theaters-lang-chips-container" role="region" aria-label="Language filter options">
            <div className="theaters-lang-chips">
              {LANGUAGE_FILTERS.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  className={`lang-filter-chip ${selectedLang === lang.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedLang(lang.id)}
                >
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
            <div className="theaters-lang-chips__fade-end" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Theatrical Showcase (Clean, un-occluded poster view) */}
      <div className="in-theaters-carousel-wrapper">
        <div
          className="in-theaters-carousel"
          ref={scrollRef}
          tabIndex={0}
          role="region"
          aria-label="Theatrical movie carousel"
        >
          {currentList.map((movie, i) => (
            <MovieCard
              key={`${movie.id}-${i}`}
              movie={movie}
              index={i}
              className="theater-card"
              onSelect={onSelectMovie}
              onOpenShowtimes={onOpenShowtimes}
              showShowtimes={activeTab === 'now_playing'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}


