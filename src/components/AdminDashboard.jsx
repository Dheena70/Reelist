import { useState, useEffect } from 'react';
import {
  Shield,
  Crown,
  Clock,
  Clapperboard,
  RotateCw,
  Trash2,
  Users,
  Calendar,
  Search,
  Film,
  Settings,
} from 'lucide-react';
import { analytics } from '../api/analytics.js';

export default function AdminDashboard({ onSwitchToMovies }) {
  const [stats, setStats] = useState(() => analytics.getStats());
  const [adminUser, setAdminUser] = useState(() => analytics.getAdminUser());
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    const cur = analytics.getStats();
    if (cur.totalVisitors >= 100 || cur.totalSearches >= 40) {
      const fresh = analytics.resetStats();
      setStats(fresh);
    } else {
      setStats(cur);
    }
    setAdminUser(analytics.getAdminUser());
    setLastRefreshed(new Date().toLocaleTimeString());
  }, []);

  const handleRefresh = () => {
    const cur = analytics.getStats();
    if (cur.totalVisitors >= 100 || cur.totalSearches >= 40) {
      setStats(analytics.resetStats());
    } else {
      setStats(cur);
    }
    setAdminUser(analytics.getAdminUser());
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  const handleReset = () => {
    const fresh = analytics.resetStats();
    setStats(fresh);
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page__inner">
        {/* Top Intelligence Header */}
        <header className="admin-page__header">
          <div className="admin-page__header-left">
            <div className="admin-badge">
              <span className="admin-badge__pulse" />
              <Shield size={13} />
              <span>PROJECTION BOOTH • SECURITY CORE</span>
            </div>
            <h1 className="admin-page__title">Admin Intelligence Dashboard</h1>
            <p className="admin-page__subtitle">
              Live real-time monitoring of visitor traffic, audience marquee interactions, and search telemetry
            </p>
            <div className="admin-page__user-meta">
              <span className="admin-pill admin-pill--gold">
                <Crown size={13} />
                <span>Super Admin:</span> <strong>{adminUser?.email || 'rdheena0509@gmail.com'}</strong>
              </span>
              <span className="admin-pill admin-pill--muted">
                <Clock size={13} />
                <span>Last synced:</span> {lastRefreshed}
              </span>
            </div>
          </div>

          <div className="admin-page__header-actions">
            {onSwitchToMovies && (
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={onSwitchToMovies}
                title="Exit to Movie Marquee view"
              >
                <Clapperboard size={15} />
                <span>Switch to Movie Marquee</span>
              </button>
            )}
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={handleRefresh}
              title="Refresh real-time analytics"
            >
              <RotateCw size={15} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={handleReset}
              title="Reset all stats to zero"
            >
              <Trash2 size={15} />
              <span>Reset Stats</span>
            </button>
          </div>
        </header>

        {/* 4 Safe Hire-style Primary Metric Cards */}
        <div className="admin-metric-grid">
          {/* Card 1: Total Visitors */}
          <div className="admin-metric-card admin-metric-card--visitors">
            <div className="admin-metric-card__glow" />
            <div className="admin-metric-card__top">
              <div>
                <span className="admin-metric-card__label">Total Visitors</span>
                <div className="admin-metric-card__value">
                  {stats.totalVisitors.toLocaleString()}
                </div>
              </div>
              <div className="admin-metric-card__icon" aria-hidden="true">
                <Users size={22} />
              </div>
            </div>
            <p className="admin-metric-card__desc">
              All-time unique audience sessions tracked across browser tabs
            </p>
            <div className="admin-metric-card__footer">
              <span className="admin-status-dot admin-status-dot--live" />
              <span>Live Visitor Counter</span>
            </div>
          </div>

          {/* Card 2: Today's Visitors */}
          <div className="admin-metric-card admin-metric-card--today">
            <div className="admin-metric-card__glow" />
            <div className="admin-metric-card__top">
              <div>
                <span className="admin-metric-card__label">Today's Visits</span>
                <div className="admin-metric-card__value">
                  {stats.todayVisitors.toLocaleString()}
                </div>
              </div>
              <div className="admin-metric-card__icon" aria-hidden="true">
                <Calendar size={22} />
              </div>
            </div>
            <p className="admin-metric-card__desc">
              Active sessions registered since midnight (local time)
            </p>
            <div className="admin-metric-card__footer">
              <span className="admin-status-dot admin-status-dot--live" />
              <span>Today's Screening Traffic</span>
            </div>
          </div>

          {/* Card 3: Total Searches */}
          <div className="admin-metric-card admin-metric-card--searches">
            <div className="admin-metric-card__glow" />
            <div className="admin-metric-card__top">
              <div>
                <span className="admin-metric-card__label">Total Searches</span>
                <div className="admin-metric-card__value">
                  {stats.totalSearches.toLocaleString()}
                </div>
              </div>
              <div className="admin-metric-card__icon" aria-hidden="true">
                <Search size={22} />
              </div>
            </div>
            <p className="admin-metric-card__desc">
              Marquee query searches processed by TMDB engine
            </p>
            <div className="admin-metric-card__footer">
              <span className="admin-status-dot admin-status-dot--cyan" />
              <span>Audience Discoveries</span>
            </div>
          </div>

          {/* Card 4: Titles Inspected */}
          <div className="admin-metric-card admin-metric-card--views">
            <div className="admin-metric-card__glow" />
            <div className="admin-metric-card__top">
              <div>
                <span className="admin-metric-card__label">Titles Inspected</span>
                <div className="admin-metric-card__value">
                  {stats.moviesViewed.toLocaleString()}
                </div>
              </div>
              <div className="admin-metric-card__icon" aria-hidden="true">
                <Film size={22} />
              </div>
            </div>
            <p className="admin-metric-card__desc">
              Full movie modal inspection cards opened by visitors
            </p>
            <div className="admin-metric-card__footer">
              <span className="admin-status-dot admin-status-dot--purple" />
              <span>Engagement Index</span>
            </div>
          </div>
        </div>

        {/* Detailed Panels Section */}
        <div className="admin-details-grid">
          {/* Panel 1: Audience Search Intelligence */}
          <section className="admin-panel">
            <div className="admin-panel__header">
              <div className="admin-panel__title-row">
                <span className="admin-panel__icon"><Search size={18} /></span>
                <h2 className="admin-panel__title">Audience Recent Search Terms</h2>
              </div>
              <span className="admin-pill admin-pill--cyan">
                {stats.recentSearches.length} Keywords Logged
              </span>
            </div>
            <p className="admin-panel__desc">
              Real-time query keywords typed by viewers in the marquee search bar.
            </p>
            {stats.recentSearches.length > 0 ? (
              <div className="admin-tags-list">
                {stats.recentSearches.map((term, idx) => (
                  <span key={idx} className="admin-tag">
                    <span className="admin-tag__hash">#</span>
                    {term}
                  </span>
                ))}
              </div>
            ) : (
              <div className="admin-empty-box">
                <p className="admin-empty-box__text">
                  No audience search queries recorded yet. Try searching for a film on the Movie Marquee!
                </p>
              </div>
            )}
          </section>

          {/* Panel 2: Telemetry & Security Audit */}
          <section className="admin-panel">
            <div className="admin-panel__header">
              <div className="admin-panel__title-row">
                <span className="admin-panel__icon"><Settings size={18} /></span>
                <h2 className="admin-panel__title">Telemetry & System Audit</h2>
              </div>
              <span className="admin-pill admin-pill--green">
                ● Status: Active
              </span>
            </div>
            <p className="admin-panel__desc">
              Projection server timestamps and authentication audit logs.
            </p>
            <ul className="admin-audit-list">
              <li className="admin-audit-item">
                <span className="admin-audit-item__label">Security Level</span>
                <span className="admin-audit-item__value admin-audit-item__value--highlight">
                  <Crown size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Super Admin (Full Control)
                </span>
              </li>
              <li className="admin-audit-item">
                <span className="admin-audit-item__label">Admin Account Email</span>
                <span className="admin-audit-item__value font-mono">
                  {adminUser?.email || 'rdheena0509@gmail.com'}
                </span>
              </li>
              <li className="admin-audit-item">
                <span className="admin-audit-item__label">First Recorded Traffic</span>
                <span className="admin-audit-item__value">
                  {stats.firstVisit ? formatDate(stats.firstVisit) : 'Awaiting first audience visit'}
                </span>
              </li>
              <li className="admin-audit-item">
                <span className="admin-audit-item__label">Latest Activity Timestamp</span>
                <span className="admin-audit-item__value">
                  {stats.lastVisit ? formatDate(stats.lastVisit) : 'Awaiting activity'}
                </span>
              </li>
              <li className="admin-audit-item">
                <span className="admin-audit-item__label">Telemetry Engine</span>
                <span className="admin-audit-item__value">
                  LocalSessionStorage v2.0 (High Precision)
                </span>
              </li>
            </ul>
          </section>
        </div>

        {/* Action Banner to browse marquee */}
        <div className="admin-banner">
          <div>
            <h3 className="admin-banner__title">Ready to explore trending films?</h3>
            <p className="admin-banner__desc">
              You can toggle between this Admin Intelligence Dashboard and the Movie Marquee anytime from the top navigation bar.
            </p>
          </div>
          {onSwitchToMovies && (
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={onSwitchToMovies}
            >
              <Clapperboard size={15} />
              <span>Open Movie Marquee</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
