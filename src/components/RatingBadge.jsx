export default function RatingBadge({ value }) {
  const hasRating = typeof value === 'number' && !Number.isNaN(value) && value > 0;
  const score = hasRating ? Math.round(value * 10) : null;
  const tier = score === null ? 'none' : score >= 70 ? 'high' : score >= 45 ? 'mid' : 'low';

  return (
    <div
      className={`rating-badge rating-badge--${tier}`}
      title={score !== null ? `Audience score: ${score}%` : 'Not yet rated'}
    >
      <span className="rating-badge__value">{score !== null ? score : 'NR'}</span>
      {score !== null && <span className="rating-badge__unit">%</span>}
    </div>
  );
}

