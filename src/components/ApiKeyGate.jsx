import { useState } from 'react';
import { tmdb } from '../api/tmdb.js';

export default function ApiKeyGate({ onSaved, errorMessage, canCancel, onCancel, onOpenAdmin }) {
  const [key, setKey] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanKey = key.trim().replace(/^["']|["']$/g, '');
    if (!cleanKey) {
      setValidationError('Please enter a valid API key or token.');
      return;
    }
    setValidationError('');
    tmdb.setApiKey(cleanKey);
    onSaved();
  };

  return (
    <div className="key-gate">
      <div className="key-gate__card">
        <p className="key-gate__eyebrow">Authentication</p>
        <h2>Load your TMDB key</h2>
        <p className="key-gate__body">
          Reelist pulls live data from The Movie Database. Paste your free API key (v3 auth) or Read Access Token (v4 auth) below —
          it is saved locally in this browser. Get one at{' '}
          <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
            themoviedb.org/settings/api
          </a>
          .
        </p>

        {(errorMessage || validationError) && (
          <div className="key-gate__error" role="alert">
            {validationError || errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="Paste TMDB API key or Bearer token"
            aria-label="TMDB API key or token"
            autoComplete="off"
            spellCheck="false"
            required
          />
          <div className="key-gate__actions">
            <button type="submit">Save & continue</button>
            {canCancel && (
              <button
                type="button"
                className="key-gate__btn-secondary"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {onOpenAdmin && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #2a2a33' }}>
            <button
              type="button"
              className="hero__action-btn hero__action-btn--secondary"
              onClick={onOpenAdmin}
            >
              🔒 Admin Login (Monster Auth)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
