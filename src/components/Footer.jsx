import { MapPin, Phone, Mail, Clock, Heart, Shield, Scale, HelpCircle } from 'lucide-react';

export default function Footer({ onOpenPrivacy, onOpenTerms, onOpenContact, onOpen404 }) {
  return (
    <footer className="site-footer" role="contentinfo" aria-label="Reelist Cinema footer">
      <div className="site-footer__container">
        <div className="site-footer__grid">
          {/* Column 1: Brand & Office */}
          <div className="footer-col footer-col--brand">
            <div className="footer-brand-title">
              <span className="footer-brand-logo">REELIST</span>
              <span className="footer-brand-badge">CINEMA</span>
            </div>
            <p className="footer-brand-tagline">
              Curated Theatrical Explorer for September, August & July 2026 releases across Tamil, Telugu, Hindi, Malayalam, Kannada and Global cinema.
            </p>

            <div className="footer-address-block">
              <div className="footer-address-item">
                <MapPin size={16} className="footer-icon" />
                <address className="footer-address-text">
                  <strong>Reelist Cinema Technologies Pvt. Ltd.</strong><br />
                  No. 42, Marquee Plaza, 3rd Floor, Anna Salai,<br />
                  Guindy, Chennai, Tamil Nadu 600032, India
                </address>
              </div>

              <div className="footer-address-item">
                <Phone size={15} className="footer-icon" />
                <span>+91 (044) 4826-7090 / +91 98401 23456</span>
              </div>

              <div className="footer-address-item">
                <Mail size={15} className="footer-icon" />
                <span>support@reelist.app</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation & Quick Filters */}
          <div className="footer-col">
            <h4 className="footer-heading">Marquee Premiere</h4>
            <ul className="footer-links">
              <li><a href="#september-2026">September 2026 Releases</a></li>
              <li><a href="#august-2026">August 2026 Blockbusters</a></li>
              <li><a href="#july-2026">July 2026 Premieres</a></li>
              <li><a href="#tamil">Tamil Cinema (Kollywood)</a></li>
              <li><a href="#telugu">Telugu Cinema (Tollywood)</a></li>
              <li><a href="#hindi">Hindi Cinema (Bollywood)</a></li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div className="footer-col">
            <h4 className="footer-heading">Support & Legal</h4>
            <ul className="footer-links">
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpenContact}>
                  Contact Concierge
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpenPrivacy}>
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpenTerms}>
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => {
                  try {
                    localStorage.removeItem('reelist_cookie_consent');
                    window.location.reload();
                  } catch {}
                }}>
                  Cookie Preferences
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={onOpen404}>
                  404 Missing Scene
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: TMDB Attribution */}
          <div className="footer-col footer-col--tmdb">
            <h4 className="footer-heading">Data Attribution</h4>
            <div className="footer-tmdb-card">
              <span className="tmdb-pill">Powered by TMDB</span>
              <p className="footer-tmdb-text">
                This product uses the TMDB API but is not endorsed or certified by TMDB. Film artwork, posters, and trailers remain copyright of their respective studios.
              </p>
            </div>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="footer-copy">
            © 2026 Reelist Cinema Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <button type="button" className="footer-bottom-btn" onClick={onOpenPrivacy}>Privacy</button>
            <span className="footer-sep">•</span>
            <button type="button" className="footer-bottom-btn" onClick={onOpenTerms}>Terms</button>
            <span className="footer-sep">•</span>
            <button type="button" className="footer-bottom-btn" onClick={onOpenContact}>Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
