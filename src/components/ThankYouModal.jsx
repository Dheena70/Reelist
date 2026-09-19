import { CheckCircle2, Film, Heart, Home, ArrowRight } from 'lucide-react';

export default function ThankYouModal({ submissionData, onClose, onReturnHome }) {
  const refCode = 'RL-' + Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="modal-scrim" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="thank-you-title">
      <div className="thank-you-card" onClick={(e) => e.stopPropagation()}>
        <div className="thank-you-confetti-circle" aria-hidden="true">
          <CheckCircle2 size={48} className="thank-you-check-icon" />
        </div>

        <p className="thank-you-eyebrow">Popcorn's Ready!</p>
        <h2 id="thank-you-title" className="thank-you-title">Thank You for Reaching Out!</h2>
        <p className="thank-you-desc">
          We've received your note{submissionData?.name ? `, ${submissionData.name}` : ''}. Our cinema desk will review your message and reply to <strong>{submissionData?.email || 'your email'}</strong> within 24 business hours.
        </p>

        <div className="thank-you-ref-box">
          <span className="thank-you-ref-label">Ticket Reference</span>
          <span className="thank-you-ref-code">{refCode}</span>
        </div>

        <div className="thank-you-actions">
          <button
            type="button"
            className="btn-primary thank-you-btn"
            onClick={() => {
              onClose();
              if (onReturnHome) onReturnHome();
            }}
          >
            <Home size={15} />
            <span>Return to Movies</span>
          </button>
        </div>
      </div>
    </div>
  );
}
