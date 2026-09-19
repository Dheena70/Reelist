import { useEffect, useRef } from 'react';
import { FileText, X, Scale, ShieldAlert, Award } from 'lucide-react';

export default function TermsModal({ onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="modal-scrim" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="terms-modal-title">
      <div className="legal-modal-card" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <header className="legal-modal-header">
          <div className="legal-modal-title-wrap">
            <div className="legal-icon-box" aria-hidden="true">
              <Scale size={20} />
            </div>
            <div>
              <h2 id="terms-modal-title" className="legal-modal-title">Terms & Conditions</h2>
              <p className="legal-modal-subtitle">Version 2.4 • Effective Date: September 2026</p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close Terms and Conditions">
            <X size={18} />
          </button>
        </header>

        <div className="legal-modal-body">
          <section className="legal-section">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing, browsing, or utilizing Reelist — Movie Explorer ("the Application"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please discontinue use of the platform immediately.
            </p>
          </section>

          <section className="legal-section">
            <h3>2. Intellectual Property & TMDB Attribution</h3>
            <p>
              All movie posters, trailers, character names, synopses, and trademarks displayed within the Application belong to their respective film studios, producers, and rights holders.
            </p>
            <p>
              <strong>TMDB Disclaimer:</strong> This product uses the TMDB API but is not endorsed or certified by TMDB. Reelist complies fully with TMDB API Terms of Use.
            </p>
          </section>

          <section className="legal-section">
            <h3>3. Permitted Platform Use</h3>
            <p>
              Reelist grants you a personal, non-exclusive, non-transferable revocable license to search cinematic titles, watch official trailers, view showtimes, and manage a personal watchlist for non-commercial entertainment purposes.
            </p>
          </section>

          <section className="legal-section">
            <h3>4. Cinema Showtimes Disclaimer</h3>
            <p>
              Theatrical showtimes and cinema ticket pricing displayed on Reelist are curated for informational convenience. Show timings, screen allocations (IMAX, 4DX, Dolby Cinema), and seat availability are subject to change by respective cinema exhibitors without prior notice.
            </p>
          </section>

          <section className="legal-section">
            <h3>5. Limitation of Liability & Jurisdiction</h3>
            <p>
              To the fullest extent permitted by applicable law, Reelist shall not be liable for any indirect, incidental, or consequential damages resulting from platform downtime or third-party trailer streaming disruptions. These terms are governed by the laws of Tamil Nadu, India.
            </p>
          </section>
        </div>

        <footer className="legal-modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            Accept & Close
          </button>
        </footer>
      </div>
    </div>
  );
}
