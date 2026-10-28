import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Star,
} from 'lucide-react';

export default function ArtistFilmographyChart({ filmography = [], onSelectMovie }) {
  const [activeTab, setActiveTab] = useState('distribution'); // 'distribution' | 'timeline'
  const [selectedBracket, setSelectedBracket] = useState(null);

  // Compute career stats
  const stats = useMemo(() => {
    const ratedFilms = filmography.filter(
      (f) => typeof f.vote_average === 'number' && f.vote_average > 0
    );

    if (ratedFilms.length === 0) {
      return {
        avgRating: null,
        totalRated: 0,
        highestRated: null,
        mostPopular: null,
        brackets: [],
        timeline: [],
      };
    }

    // Average rating
    const sum = ratedFilms.reduce((acc, f) => acc + f.vote_average, 0);
    const avgRating = (sum / ratedFilms.length).toFixed(1);

    // Highest rated
    const highestRated = [...ratedFilms].sort(
      (a, b) => b.vote_average - a.vote_average || (b.vote_count || 0) - (a.vote_count || 0)
    )[0];

    // Most popular
    const mostPopular = [...filmography].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];

    // Rating Brackets
    const bracketDefs = [
      { id: 'masterpiece', label: '9.0 - 10.0', sub: 'Masterpieces', min: 9.0, max: 10.0, color: '#f5c518' },
      { id: 'acclaimed', label: '8.0 - 8.9', sub: 'High Acclaim', min: 8.0, max: 8.99, color: '#eab308' },
      { id: 'hits', label: '7.0 - 7.9', sub: 'Critical Hits', min: 7.0, max: 7.99, color: '#3b82f6' },
      { id: 'solid', label: '6.0 - 6.9', sub: 'Solid Entertainers', min: 6.0, max: 6.99, color: '#10b981' },
      { id: 'mixed', label: '< 6.0', sub: 'Mixed / Cult', min: 0, max: 5.99, color: '#94a3b8' },
    ];

    const brackets = bracketDefs.map((b) => {
      const items = ratedFilms.filter((f) => f.vote_average >= b.min && f.vote_average <= b.max);
      return {
        ...b,
        count: items.length,
        percentage: ((items.length / ratedFilms.length) * 100).toFixed(0),
        films: items,
      };
    });

    // Chronological timeline
    const chronological = [...ratedFilms]
      .filter((f) => f.year && f.year !== '—')
      .sort((a, b) => {
        const yA = parseInt(a.year, 10) || 0;
        const yB = parseInt(b.year, 10) || 0;
        return yA - yB;
      });

    return {
      avgRating,
      totalRated: ratedFilms.length,
      highestRated,
      mostPopular,
      brackets,
      timeline: chronological,
    };
  }, [filmography]);

  if (stats.totalRated === 0) return null;

  return (
    <div
      className="artist-filmography-chart"
      style={{
        margin: '1.5rem 0',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '1.25rem',
      }}
    >
      {/* Header & Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: 'rgba(245, 197, 24, 0.15)',
              color: '#f5c518',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>
              Career Filmography & Rating Analytics
            </h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Based on {stats.totalRated} catalog titles with verified ratings
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '6px', padding: '2px' }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('distribution');
              setSelectedBracket(null);
            }}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: activeTab === 'distribution' ? '#f5c518' : 'transparent',
              color: activeTab === 'distribution' ? '#000000' : '#cbd5e1',
            }}
          >
            Rating Distribution
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              background: activeTab === 'timeline' ? '#f5c518' : 'transparent',
              color: activeTab === 'timeline' ? '#000000' : '#cbd5e1',
            }}
          >
            Timeline Chart
          </button>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={12} color="#f5c518" /> Career Avg Rating
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f5c518', display: 'block', marginTop: '2px' }}>
            ★ {stats.avgRating}
          </span>
        </div>

        {stats.highestRated && (
          <div
            onClick={() => onSelectMovie && onSelectMovie(stats.highestRated)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              cursor: onSelectMovie ? 'pointer' : 'default',
            }}
            title={`View ${stats.highestRated.title}`}
          >
            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={12} color="#10b981" /> Highest Rated Title
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', display: 'block', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {stats.highestRated.title} ({stats.highestRated.year})
            </span>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
              ★ {stats.highestRated.vote_average.toFixed(1)} / 10
            </span>
          </div>
        )}

        {stats.mostPopular && (
          <div
            onClick={() => onSelectMovie && onSelectMovie(stats.mostPopular)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              cursor: onSelectMovie ? 'pointer' : 'default',
            }}
            title={`View ${stats.mostPopular.title}`}
          >
            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} color="#3b82f6" /> Most Popular
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc', display: 'block', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {stats.mostPopular.title} ({stats.mostPopular.year})
            </span>
            <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 700 }}>
              ★ {stats.mostPopular.vote_average ? stats.mostPopular.vote_average.toFixed(1) : 'N/A'}
            </span>
          </div>
        )}
      </div>

      {/* Tab 1: Rating Distribution */}
      {activeTab === 'distribution' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.brackets.map((b) => {
              const isSelected = selectedBracket === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBracket(isSelected ? null : b.id)}
                  style={{
                    background: isSelected ? 'rgba(245, 197, 24, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isSelected ? '1px solid rgba(245, 197, 24, 0.3)' : '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    cursor: b.count > 0 ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: b.color }}>{b.label}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>({b.sub})</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                      {b.count} {b.count === 1 ? 'title' : 'titles'} ({b.percentage}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${b.percentage}%`,
                        height: '100%',
                        background: b.color,
                        borderRadius: '3px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  {/* Expanded Bracket Movies preview */}
                  {isSelected && b.films.length > 0 && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {b.films.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectMovie) onSelectMovie(f);
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            color: '#f8fafc',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>{f.title} ({f.year})</span>
                          <span style={{ color: b.color, fontWeight: 700 }}>★ {f.vote_average.toFixed(1)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Chronological Timeline Chart */}
      {activeTab === 'timeline' && (
        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '160px', minWidth: '480px', padding: '10px 0 0' }}>
            {stats.timeline.map((f) => {
              const rating = f.vote_average || 0;
              const barHeightPct = Math.max(10, Math.min(100, (rating / 10) * 100));
              const isHigh = rating >= 8.0;
              const barColor = isHigh ? '#f5c518' : rating >= 7.0 ? '#38bdf8' : rating >= 6.0 ? '#34d399' : '#94a3b8';

              return (
                <div
                  key={f.id}
                  onClick={() => onSelectMovie && onSelectMovie(f)}
                  title={`${f.title} (${f.year}) - ★ ${rating.toFixed(1)}`}
                  style={{
                    flex: '1 0 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    cursor: onSelectMovie ? 'pointer' : 'default',
                  }}
                >
                  <span style={{ fontSize: '9px', color: barColor, fontWeight: 700, marginBottom: '2px' }}>
                    {rating.toFixed(1)}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '14px',
                      height: `${barHeightPct}%`,
                      background: barColor,
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <span style={{ fontSize: '8px', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap', transform: 'rotate(-45deg)', transformOrigin: 'top left' }}>
                    {f.year.slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
