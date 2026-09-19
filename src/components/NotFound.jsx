import { Film, Home, Search, AlertCircle } from 'lucide-react';

export default function NotFound({ onReturnHome, onSearchClick }) {
  return (
    <div className="not-found-screen" role="main" aria-labelledby="not-found-title">
      <div className="not-found-card">
        <div className="not-found-icon-wrap" aria-hidden="true">
          <Film size={56} className="not-found-film-icon" />
          <span className="not-found-badge">404</span>
        </div>

        <p className="not-found-eyebrow">Scene Missing from Marquee</p>
        <h1 id="not-found-title" className="not-found-title">Cut from the Reel (404)</h1>
        <p className="not-found-desc">
          The frame or scene you requested was either archived, relocated, or left on the cutting room floor. Don't worry—our September, August & July 2026 premiere is screening right now!
        </p>

        <div className="not-found-actions">
          <button
            type="button"
            className="btn-primary not-found-btn"
            onClick={onReturnHome}
            aria-label="Return to Trending 2026 Blockbusters"
          >
            <Home size={16} />
            <span>Return to Premiere</span>
          </button>
          <button
            type="button"
            className="btn-outline not-found-btn"
            onClick={onSearchClick}
            aria-label="Open movie search bar"
          >
            <Search size={16} />
            <span>Search Titles & Artists</span>
          </button>
        </div>

        <div className="not-found-hint">
          <AlertCircle size={14} />
          <span>Tip: Check the URL spelling or browse by language in the marquee catalog.</span>
        </div>
      </div>
    </div>
  );
}
