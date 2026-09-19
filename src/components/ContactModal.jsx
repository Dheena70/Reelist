import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, X, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Please enter your name.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) newErrors.email = 'Please provide a valid email address.';
    if (!message.trim() || message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters long.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSuccess({ name, email, topic, message });
    }, 600);
  };

  return (
    <div className="modal-scrim" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <div className="contact-modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="legal-modal-header">
          <div className="legal-modal-title-wrap">
            <div className="legal-icon-box" aria-hidden="true">
              <Mail size={20} />
            </div>
            <div>
              <h2 id="contact-modal-title" className="legal-modal-title">Get in Touch with Reelist</h2>
              <p className="legal-modal-subtitle">Cinema inquiries, suggestions, or technical support</p>
            </div>
          </div>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close contact modal">
            <X size={18} />
          </button>
        </header>

        <div className="contact-modal-grid">
          {/* Office Information Column */}
          <div className="contact-info-col">
            <h3 className="contact-info-title">Headquarters</h3>
            <div className="contact-info-item">
              <MapPin size={18} className="contact-info-icon" />
              <div>
                <strong>Reelist Cinema Technologies Pvt. Ltd.</strong>
                <p>No. 42, Marquee Plaza, 3rd Floor</p>
                <p>Anna Salai, Guindy, Chennai</p>
                <p>Tamil Nadu 600032, India</p>
              </div>
            </div>

            <div className="contact-info-item">
              <Phone size={18} className="contact-info-icon" />
              <div>
                <strong>Customer Care / Concierge</strong>
                <p>+91 (044) 4826-7090</p>
                <p>+91 98401 23456</p>
              </div>
            </div>

            <div className="contact-info-item">
              <Clock size={18} className="contact-info-icon" />
              <div>
                <strong>Operating Hours</strong>
                <p>Mon – Sat: 9:00 AM – 9:00 PM IST</p>
                <p>Sun: 10:00 AM – 6:00 PM IST</p>
              </div>
            </div>

            <div className="contact-info-item">
              <Mail size={18} className="contact-info-icon" />
              <div>
                <strong>Direct Inquiries</strong>
                <p>support@reelist.app</p>
                <p>partners@reelist.app</p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <form className="contact-form-col" onSubmit={handleSubmit} noValidate>
            <div className="contact-form-group">
              <label htmlFor="contact-name">Your Name <span className="req">*</span></label>
              <input
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="e.g. Dheena"
                className={errors.name ? 'has-error' : ''}
                aria-invalid={!!errors.name}
              />
              {errors.name && <span className="form-err-msg"><AlertCircle size={12} /> {errors.name}</span>}
            </div>

            <div className="contact-form-group">
              <label htmlFor="contact-email">Email Address <span className="req">*</span></label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="you@domain.com"
                className={errors.email ? 'has-error' : ''}
                aria-invalid={!!errors.email}
              />
              {errors.email && <span className="form-err-msg"><AlertCircle size={12} /> {errors.email}</span>}
            </div>

            <div className="contact-form-group">
              <label htmlFor="contact-topic">Topic</label>
              <select
                id="contact-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                <option value="Feedback">App Feedback & Suggestions</option>
                <option value="Movie Request">Suggest a 2026 Title</option>
                <option value="Showtimes">Cinema Showtimes Question</option>
                <option value="Partnership">Studio / Exhibitor Partnership</option>
                <option value="Other">Other Inquiry</option>
              </select>
            </div>

            <div className="contact-form-group">
              <label htmlFor="contact-message">Message <span className="req">*</span></label>
              <textarea
                id="contact-message"
                rows="4"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors((prev) => ({ ...prev, message: null }));
                }}
                placeholder="Tell us what you loved or what we can improve..."
                className={errors.message ? 'has-error' : ''}
                aria-invalid={!!errors.message}
              />
              {errors.message && <span className="form-err-msg"><AlertCircle size={12} /> {errors.message}</span>}
            </div>

            <button type="submit" className="btn-primary contact-submit-btn" disabled={submitting}>
              <Send size={15} />
              <span>{submitting ? 'Transmitting Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
