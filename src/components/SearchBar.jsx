import { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit }) {
  const [error, setError] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const rawVal = typeof value === 'string' ? value : '';
    const trimmed = rawVal.trim();
    if (!trimmed) {
      setError('Please enter a movie title, web series, or artist name.');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  const handleChange = (e) => {
    if (error) setError('');
    onChange(e.target.value);
  };

  return (
    <div className="search-bar-container">
      <form
        className={`marquee-search ${error ? 'marquee-search--has-error' : ''}`}
        onSubmit={handleFormSubmit}
        role="search"
      >
        <span className="marquee-search__icon" aria-hidden="true">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onChange('');
              setError('');
            }
          }}
          placeholder="Search a movie, series, and artist"
          aria-label="Search a movie, series, and artist"
          aria-invalid={!!error}
          aria-describedby={error ? 'marquee-search-error' : undefined}
          autoComplete="off"
          maxLength={100}
        />
        <button type="submit" className="btn-primary marquee-search__btn">Search</button>
      </form>
      {error && (
        <div id="marquee-search-error" className="marquee-search-error-msg" role="alert">
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
