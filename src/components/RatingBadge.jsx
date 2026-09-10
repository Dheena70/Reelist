export default function RatingBadge({ value }) {
  const hasRating = typeof value === 'number' && !Number.isNaN(value) && value > 0;
  const score = hasRating ? Number(value).toFixed(1) : null;
  const tier = !hasRating ? 'none' : value >= 7.0 ? 'high' : value >= 4.5 ? 'mid' : 'low';

  return (
    <div
      className={`rating-badge rating-badge--${tier}`}
      title={score !== null ? `Audience rating: ${score} / 10` : 'Not yet rated'}
    >
      <span className="rating-badge__star" aria-hidden="true">★</span>
      <span className="rating-badge__value">{score !== null ? score : 'NR'}</span>
    </div>
  );
}

