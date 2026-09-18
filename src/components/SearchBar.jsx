import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      className="marquee-search"
      onSubmit={(e) => {
        e.preventDefault();
        const inputVal = e.target.querySelector('input')?.value;
        onSubmit(typeof inputVal === 'string' ? inputVal : value);
      }}
      role="search"
    >
      <span className="marquee-search__icon" aria-hidden="true">
        <Search size={16} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onChange('');
        }}
        placeholder="Search a movie, series, and artist"
        aria-label="Search a movie, series, and artist"
        autoComplete="off"
        maxLength={100}
      />
      <button type="submit" className="btn-primary marquee-search__btn">Search</button>
    </form>
  );
}
