export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      className="marquee-search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
      role="search"
    >
      <span className="marquee-search__icon" aria-hidden="true">
        ★
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search a title — Dune, Parasite, Nope…"
        aria-label="Search movies by title"
        autoComplete="off"
      />
      <button type="submit">Search</button>
    </form>
  );
}
