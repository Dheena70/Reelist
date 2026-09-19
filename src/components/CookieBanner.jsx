import { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, X } from 'lucide-react';

export default function CookieBanner({ onOpenPrivacy }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('reelist_cookie_consent');
      if (!consent) {
        // Small delay for polite entrance animation
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleConsent = (level) => {
    try {
      localStorage.setItem('reelist_cookie_consent', JSON.stringify({
        level,
        timestamp: Date.now(),
      }));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      className="cookie-banner"
      role="region"
      aria-label="Cookie and privacy preferences"
    >
      <div className="cookie-banner__inner">
        <div className="cookie-banner__icon-box" aria-hidden="true">
          <Cookie size={22} />
        </div>
        <div className="cookie-banner__content">
          <h3 className="cookie-banner__title">Cinema Cookie & Telemetry Notice</h3>
          <p className="cookie-banner__text">
            Reelist uses essential cookies and local browser storage to remember your saved Watchlist, playback sound preferences, and measure marquee traffic safely. We never sell your data.
            {onOpenPrivacy && (
              <button
                type="button"
                className="cookie-banner__link-btn"
                onClick={onOpenPrivacy}
              >
                Read Privacy Policy
              </button>
            )}
          </p>
        </div>
        <div className="cookie-banner__actions">
          <button
            type="button"
            className="btn-outline cookie-banner__btn"
            onClick={() => handleConsent('essential')}
          >
            Essential Only
          </button>
          <button
            type="button"
            className="btn-primary cookie-banner__btn cookie-banner__btn--accept"
            onClick={() => handleConsent('all')}
          >
            <Check size={14} />
            <span>Accept All</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
