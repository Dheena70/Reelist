import { useEffect, useRef } from 'react';
import { Shield, X } from 'lucide-react';
import { CONTACT_EMAIL } from '../config/constants.js';

export default function PrivacyPolicyModal({ onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-scrim" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
      <div className="legal-modal-card" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <header className="legal-modal-header">
          <div className="legal-modal-title-wrap">
            <div className="legal-icon-box" aria-hidden="true">
              <Shield size={20} />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="legal-modal-title">Privacy Policy</h2>
              <p className="legal-modal-subtitle">Last Updated: September 19, 2026 • Effective Worldwide</p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close Privacy Policy">
            <X size={18} />
          </button>
        </header>

        <div className="legal-modal-body">
          <section className="legal-section">
            <h3>1. Overview & Commitment</h3>
            <p>
              Reelist (&ldquo;Reelist&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), respects your digital privacy. This Privacy Policy outlines the types of information we collect, how it is used to deliver the cinema explorer experience, and your legal rights under GDPR, CCPA, and Indian Digital Personal Data Protection (DPDP) standards.
            </p>
          </section>

          <section className="legal-section">
            <h3>2. Information We Collect</h3>
            <ul>
              <li><strong>Account Credentials:</strong> Authentication (email, password verification, and session tokens) is handled securely by Supabase Auth. Passwords are never stored on Reelist servers or written to your browser&apos;s local storage.</li>
              <li><strong>Watchlist, Ratings &amp; Reactions:</strong> Stored in your personal account in Supabase. Ratings and reaction counts are displayed publicly only as anonymous aggregates (average score and total counts, without revealing user identities).</li>
              <li><strong>Account Deletion:</strong> Permanently deleting your account through your profile invokes our secure server deletion function, which permanently cascades and erases your user record, watchlist entries, ratings, and reactions.</li>
              <li><strong>Anonymized Telemetry:</strong> Aggregated visitor counters, movie view tallies, and search queries strictly without linking personally identifiable information.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h3>3. Third-Party Integrations</h3>
            <p>
              Reelist sources metadata, posters, and backdrop assets via The Movie Database (TMDB) API. When streaming video trailers, embeds are served securely through YouTube (Google LLC) under their respective privacy terms.
            </p>
          </section>

          <section className="legal-section">
            <h3>4. Cookies & Local Storage</h3>
            <p>
              We utilize essential local browser keys (<code>reelist_autoplay</code>, <code>reelist_cookie_consent</code>) to remember your preferences. You can clear these at any time via your browser settings or our Cookie Banner.
            </p>
          </section>

          <section className="legal-section">
            <h3>5. Data Protection Officer & Contact</h3>
            <p>
              For privacy inquiries, data deletion requests, or portability assistance, contact:
              <br />
              <strong>Reelist Data Protection Officer</strong><br />
              Kallakurichi, Tamil Nadu, India<br />
              Email: <code>{CONTACT_EMAIL}</code>
            </p>
          </section>
        </div>

        <footer className="legal-modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Understood & Close
          </button>
        </footer>
      </div>
    </div>
  );
}
