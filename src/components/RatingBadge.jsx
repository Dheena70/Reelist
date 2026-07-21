export default function RatingBadge({ value }) {
  const score = value ? Math.round(value * 10) : null;
  const tier = score === null ? 'none' : score >= 70 ? 'high' : score >= 45 ? 'mid' : 'low';

  return (
    <div className={`rating-badge rating-badge--${tier}`} title="Audience score">
      <span className="rating-badge__value">{score !== null ? score : '—'}</span>
      <span className="rating-badge__unit">%</span>
    </div>
  );
}
