import React, { useState } from 'react';

const KEY = 'reelist_cookie_consent';

export default function CookieBanner() {
  const [saved, setSaved] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return Boolean(raw && JSON.parse(raw).level);
    } catch {
      return false;
    }
  });

  if (saved) return null;

  const choose = (level) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ level, at: Date.now() }));
    } catch {
      // ignore storage errors
    }
    setSaved(true);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie and storage notice"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        margin: '0 auto',
        zIndex: 9999,
        maxWidth: 520,
        background: '#12141a',
        color: '#f1f5f9',
        padding: '16px 20px',
        borderRadius: 14,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.5, color: '#cbd5e1' }}>
        We value your privacy. Reelist stores your authentication session and viewing preferences locally on your device to ensure a seamless cinema browsing experience.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => choose('essential')}
          style={{
            padding: '7px 14px',
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          Essential only
        </button>
        <button
          type="button"
          onClick={() => choose('all')}
          style={{
            padding: '7px 18px',
            background: '#c59b4c',
            color: '#0f172a',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
