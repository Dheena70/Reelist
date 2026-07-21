import { useState } from 'react';
import { tmdb } from '../api/tmdb.js';

export default function ApiKeyGate({ onSaved }) {
  const [key, setKey] = useState('');

  return (
    <div className="key-gate">
      <div className="key-gate__card">
        <p className="key-gate__eyebrow">One-time setup</p>
        <h2>Load your TMDB key</h2>
        <p className="key-gate__body">
          Reelist pulls live data from The Movie Database. Paste your free API key (v3 auth) below —
          it's saved only in this browser. Get one at{' '}
          <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
            themoviedb.org/settings/api
          </a>
          .
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!key.trim()) return;
            tmdb.setApiKey(key.trim());
            onSaved();
          }}
        >
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="TMDB API key"
            aria-label="TMDB API key"
          />
          <button type="submit">Save & continue</button>
        </form>
      </div>
    </div>
  );
}
