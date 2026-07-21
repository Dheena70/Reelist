import { useEffect, useMemo, useState } from 'react';
import { tmdb } from './api/tmdb.js';
import SearchBar from './components/SearchBar.jsx';
import MovieGrid from './components/MovieGrid.jsx';
import MovieModal from './components/MovieModal.jsx';
import ApiKeyGate from './components/ApiKeyGate.jsx';

export default function App() {
  const [hasKey, setHasKey] = useState(!!tmdb.getApiKey());
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const mode = activeQuery ? 'search' : 'trending';

  const heading = useMemo(() => {
    if (mode === 'search') return `Results for "${activeQuery}"`;
    return 'Trending this week';
  }, [mode, activeQuery]);

  useEffect(() => {
    if (!hasKey) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const request = activeQuery ? tmdb.search(activeQuery) : tmdb.trending();

    request
      .then((data) => {
        if (cancelled) return;
        setMovies(data.results || []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.code === 'INVALID_API_KEY' || err.code === 'MISSING_API_KEY') {
          setHasKey(false);
        } else {
          setError('Something went wrong reaching TMDB. Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeQuery, hasKey]);

  if (!hasKey) {
    return <ApiKeyGate onSaved={() => setHasKey(true)} />;
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__sprockets" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
        <p className="hero__eyebrow">Now screening</p>
        <h1 className="hero__title">REELIST</h1>
        <p className="hero__subtitle">Find what's trending, or search the whole marquee.</p>
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={(val) => setActiveQuery(val.trim())}
        />
        {activeQuery && (
          <button
            className="hero__clear"
            onClick={() => {
              setQuery('');
              setActiveQuery('');
            }}
          >
            ← Back to trending
          </button>
        )}
        <div className="hero__sprockets hero__sprockets--bottom" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
      </header>

      <main className="container">
        <h2 className="section-heading">{heading}</h2>
        <MovieGrid
          movies={movies}
          loading={loading}
          error={error}
          emptyLabel="Try another title, or check the spelling."
          onSelect={(movie) => setSelectedId(movie.id)}
        />
      </main>

      {selectedId && (
        <MovieModal movieId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
