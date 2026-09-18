import { useState, useMemo } from 'react';
import {
  Sparkles,
  User,
  Users,
  Calendar,
  MapPin,
  Film,
  Globe2,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { profileUrl } from '../api/tmdb.js';
import MovieCard from './MovieCard.jsx';

export default function ArtistSpotlight({
  artist,
  similarArtists = [],
  onSelectArtist,
  onSelectMovie,
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filterQuery, setFilterQuery] = useState('');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!artist) return null;

  const portrait = profileUrl(artist.profile_path, 'h632');

  // Format birth date and calculate age
  const birthInfo = useMemo(() => {
    if (!artist.birthday) return null;
    try {
      const bDate = new Date(artist.birthday);
      if (isNaN(bDate.getTime())) return artist.birthday;
      const formatted = bDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (artist.deathday) {
        return `${formatted} (Deceased)`;
      }
      const ageDiff = Date.now() - bDate.getTime();
      const age = Math.abs(new Date(ageDiff).getUTCFullYear() - 1970);
      return `${formatted} (${age} years old)`;
    } catch {
      return artist.birthday;
    }
  }, [artist.birthday, artist.deathday]);

  // Languages tab list
  const languageTabs = artist.languages || [
    { code: 'all', name: 'All Languages', count: artist.filmography?.length || 0 },
  ];

  // Selected language name for headings
  const activeLangObj = languageTabs.find((l) => l.code === selectedLanguage);
  const activeLangName = activeLangObj?.name || 'All Languages';

  // Filter and sort the filmography
  const visibleFilms = useMemo(() => {
    let films = [...(artist.filmography || [])];

    // Filter by language
    if (selectedLanguage !== 'all') {
      films = films.filter(
        (f) => (f.original_language || '').toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

    // Filter by search query within filmography
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      films = films.filter((f) => {
        const titleMatch = (f.title || f.name || '').toLowerCase().includes(q);
        const charMatch = (f.character || '').toLowerCase().includes(q);
        const yearMatch = (f.year || '').includes(q);
        return titleMatch || charMatch || yearMatch;
      });
    }

    // Sort films
    films.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.vote_average || 0) - (a.vote_average || 0);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      // 'newest' default
      const yearA = parseInt(a.year, 10) || 0;
      const yearB = parseInt(b.year, 10) || 0;
      if (yearB !== yearA) return yearB - yearA;
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return films;
  }, [artist.filmography, selectedLanguage, filterQuery, sortBy]);

  // Bio truncation logic
  const bio = artist.biography || 'Acclaimed artist in world cinema.';
  const isBioLong = bio.length > 320;
  const displayedBio = isBioLong && !bioExpanded ? `${bio.slice(0, 320)}…` : bio;

  return (
    <section className="artist-spotlight" aria-label={`Artist Spotlight: ${artist.name}`}>
      {/* 0. Similar & Matching Artists Switcher Bar */}
      {similarArtists && similarArtists.length > 1 && (
        <div className="artist-similar-bar" aria-label="Similar and Matching Artists">
          <div className="artist-similar-bar__header">
            <Users size={14} className="artist-similar-bar__icon" />
            <span className="artist-similar-bar__title">Similar & Matching Artists ({similarArtists.length}):</span>
          </div>
          <div className="artist-similar-bar__list" role="tablist">
            {similarArtists.map((sim) => {
              const isCurrent =
                sim.id === artist.id ||
                (sim.tmdb_id && sim.tmdb_id === artist.tmdb_id) ||
                (sim.name || '').toLowerCase() === (artist.name || '').toLowerCase();
              const photo = profileUrl(sim.profile_path, 'w185');
              return (
                <button
                  key={sim.id || sim.name}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  className={`artist-similar-card ${isCurrent ? 'is-active' : ''}`}
                  onClick={() => onSelectArtist && onSelectArtist(sim)}
                  title={`View profile and filmography for ${sim.name}`}
                >
                  <div className="artist-similar-card__avatar">
                    {photo ? (
                      <img
                        src={photo}
                        alt={sim.name}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <div className="artist-similar-card__meta">
                    <span className="artist-similar-card__name">{sim.name}</span>
                    <span className="artist-similar-card__dept">
                      {sim.known_for_department || 'Acting'}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="artist-similar-card__active-badge">Active</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Artist Profile Header Card */}
      <div className="artist-profile-card">
        <div className="artist-profile-card__badge-row">
          <span className="artist-badge">
            <Sparkles size={13} />
            <span>Artist Spotlight</span>
          </span>
          <span className="artist-badge-subtext">Complete Multilingual Filmography</span>
        </div>

        <div className="artist-profile-card__body">
          {/* Portrait Image */}
          <div className="artist-portrait-box">
            {portrait && !imgError ? (
              <img
                src={portrait}
                alt={`${artist.name} portrait`}
                width="220"
                height="330"
                className="artist-portrait-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="artist-portrait-fallback">
                <User size={64} strokeWidth={1.5} />
                <span>{artist.name}</span>
              </div>
            )}
          </div>

          {/* Details & Biography */}
          <div className="artist-profile-info">
            <div className="artist-meta-top">
              <span className="artist-dept-tag">
                {artist.known_for_department || 'Actor & Performer'}
              </span>
              <span className="artist-films-count-tag">
                <Film size={12} />
                <span>{artist.total_films || artist.filmography?.length || 0} Total Films</span>
              </span>
              <span className="artist-langs-count-tag">
                <Globe2 size={12} />
                <span>{languageTabs.length > 1 ? languageTabs.length - 1 : 1} Languages</span>
              </span>
            </div>

            <h1 className="artist-name">{artist.name}</h1>

            {/* Personal Facts */}
            <div className="artist-facts-row">
              {birthInfo && (
                <div className="artist-fact-item" title="Date of birth">
                  <Calendar size={13} />
                  <span>Born: {birthInfo}</span>
                </div>
              )}
              {artist.place_of_birth && (
                <div className="artist-fact-item" title="Birthplace">
                  <MapPin size={13} />
                  <span>{artist.place_of_birth}</span>
                </div>
              )}
            </div>

            {/* Biography / Introduction */}
            <div className="artist-bio-block">
              <p className="artist-bio-text">{displayedBio}</p>
              {isBioLong && (
                <button
                  type="button"
                  className="artist-bio-toggle-btn"
                  onClick={() => setBioExpanded((prev) => !prev)}
                >
                  {bioExpanded ? (
                    <>
                      <span>Show less</span>
                      <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      <span>Read full biography</span>
                      <ChevronDown size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Multilingual Language Filter Chips */}
      <div className="artist-lang-selector-section" aria-label="Filter films by language">
        <div className="artist-lang-selector-header">
          <div className="artist-lang-header-left">
            <Globe2 size={16} />
            <h2 className="artist-lang-title">Multilingual Filmography</h2>
            <span className="artist-lang-subtitle">
              Acted across {languageTabs.length > 1 ? languageTabs.length - 1 : 1} regional & international industries
            </span>
          </div>
        </div>

        <div className="artist-lang-chips-track" role="tablist">
          {languageTabs.map((tab) => {
            const isActive = selectedLanguage === tab.code;
            return (
              <button
                key={tab.code}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`artist-lang-chip ${isActive ? 'is-active' : ''}`}
                onClick={() => setSelectedLanguage(tab.code)}
              >
                <span className="artist-lang-chip__name">{tab.name}</span>
                <span className="artist-lang-chip__count">{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filmography Controls & Stats Bar */}
      <div className="artist-filmography-controls">
        <div className="artist-filmography-stats">
          <Layers size={15} />
          <span>
            Showing <strong>{visibleFilms.length}</strong> {visibleFilms.length === 1 ? 'title' : 'titles'} in{' '}
            <strong>{activeLangName}</strong>
          </span>
        </div>

        <div className="artist-filmography-actions">
          {/* Internal Search */}
          <div className="artist-search-box">
            <Search size={14} className="artist-search-box__icon" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search in filmography…"
              aria-label="Filter artist filmography"
              className="artist-search-box__input"
            />
            {filterQuery && (
              <button
                type="button"
                className="artist-search-box__clear"
                onClick={() => setFilterQuery('')}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="artist-sort-box">
            <ArrowUpDown size={14} className="artist-sort-box__icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="artist-sort-box__select"
              aria-label="Sort filmography"
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Filmography Cards Grid */}
      {visibleFilms.length > 0 ? (
        <div className="movie-grid" role="region" aria-label={`${artist.name} Filmography Grid`}>
          {visibleFilms.map((movie, index) => (
            <MovieCard
              key={`${movie.id}-${index}`}
              movie={movie}
              index={index}
              onSelect={onSelectMovie}
            />
          ))}
        </div>
      ) : (
        <div className="state-panel artist-empty-filmography">
          <Film size={36} className="state-panel__icon" />
          <h3 className="state-panel__title">No titles found</h3>
          <p className="state-panel__sub">
            No films matching "{filterQuery}" were found in {activeLangName}.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setFilterQuery('');
              setSelectedLanguage('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
