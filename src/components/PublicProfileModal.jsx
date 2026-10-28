import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  User,
  Calendar,
  Star,
  List as ListIcon,
  MessageSquare,
  AlertTriangle,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { getProfileByUsername } from '../api/profiles.js';
import { getUserReviews } from '../api/reviews.js';
import { getUserPublicLists } from '../api/lists.js';
import { tmdb, posterUrl } from '../api/tmdb.js';
import ListDetailModal from './ListDetailModal.jsx';

export default function PublicProfileModal({
  username,
  onClose,
  onSelectMovie,
  currentUser,
  onOpenMyProfile,
}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'lists'
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [lists, setLists] = useState([]);
  const [movieDetails, setMovieDetails] = useState({});

  const [revealedSpoilers, setRevealedSpoilers] = useState({});
  const [activeListDetail, setActiveListDetail] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeListDetail) {
          setActiveListDetail(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeListDetail, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError(null);

    try {
      const { data: prof, error: profErr } = await getProfileByUsername(username);
      if (profErr || !prof) {
        setError(profErr || 'User not found');
        setLoading(false);
        return;
      }

      setProfile(prof);

      // Fetch reviews and public lists in parallel
      const [reviewsRes, listsRes] = await Promise.allSettled([
        getUserReviews(prof.id, 25),
        getUserPublicLists(prof.id),
      ]);

      const fetchedReviews = reviewsRes.status === 'fulfilled' && reviewsRes.value?.data ? reviewsRes.value.data : [];
      const fetchedCount = reviewsRes.status === 'fulfilled' ? (reviewsRes.value?.count || fetchedReviews.length) : 0;
      const fetchedLists = listsRes.status === 'fulfilled' && listsRes.value?.data ? listsRes.value.data : [];

      setReviews(fetchedReviews);
      setReviewCount(fetchedCount);
      setLists(fetchedLists);

      // Hydrate review movie titles
      const neededIds = fetchedReviews.map((r) => ({ id: r.tmdb_id, type: r.media_type }));
      neededIds.forEach(async ({ id, type }) => {
        try {
          const detail = await tmdb.details(id, type);
          if (detail) {
            setMovieDetails((prev) => ({
              ...prev,
              [`${type}_${id}`]: {
                title: detail.title || detail.name || 'Untitled',
                poster_path: detail.poster_path || null,
                year: (detail.release_date || detail.first_air_date || '').slice(0, 4),
              },
            }));
          }
        } catch {
          // ignore hydration failure
        }
      });
    } catch (err) {
      setError(err?.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSpoiler = (reviewId) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const isOwnProfile = currentUser && profile && (currentUser.id === profile.id);

  const formattedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <>
      <div
        className="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={`Public profile for @${username}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 15, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: '#0b1120',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '88vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.6)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#f5c518" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Reelist Cinephile Profile
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
            {loading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>Loading cinephile profile...</p>
              </div>
            ) : error ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <AlertTriangle size={24} />
                </div>
                <h3 style={{ margin: '0 0 6px', color: '#f8fafc', fontSize: '1.1rem' }}>
                  User Not Found
                </h3>
                <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '13px' }}>
                  The profile @{username} does not exist or has not been activated.
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  Return to Marquee
                </button>
              </div>
            ) : profile ? (
              <>
                {/* Profile Hero Card */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #f5c518 0%, #d97706 100%)',
                          color: '#000000',
                          fontWeight: 900,
                          fontSize: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 14px rgba(245, 197, 24, 0.3)',
                          flexShrink: 0,
                        }}
                      >
                        {profile.username ? profile.username.charAt(0).toUpperCase() : <User size={28} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                            @{profile.username}
                          </h2>
                          {isOwnProfile && (
                            <span
                              style={{
                                fontSize: '11px',
                                background: 'rgba(245, 197, 24, 0.2)',
                                color: '#f5c518',
                                border: '1px solid rgba(245, 197, 24, 0.4)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 700,
                              }}
                            >
                              YOU
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: '#64748b', fontSize: '12px' }}>
                          <Calendar size={13} />
                          <span>Member since {formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    {isOwnProfile && onOpenMyProfile && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          onClose();
                          onOpenMyProfile();
                        }}
                        style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {/* Bio */}
                  {profile.bio ? (
                    <p
                      style={{
                        margin: '1rem 0 0',
                        fontSize: '13px',
                        color: '#cbd5e1',
                        lineHeight: 1.5,
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        borderLeft: '3px solid #f5c518',
                      }}
                    >
                      {profile.bio}
                    </p>
                  ) : (
                    <p style={{ margin: '1rem 0 0', fontSize: '13px', color: '#64748b', fontStyle: 'italic' }}>
                      No bio shared yet.
                    </p>
                  )}

                  {/* Badges / Stats */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <MessageSquare size={15} color="#f5c518" />
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{reviewCount}</strong>{' '}
                        {reviewCount === 1 ? 'Review' : 'Reviews'}
                      </span>
                    </div>

                    <div
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <ListIcon size={15} color="#38bdf8" />
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        <strong style={{ color: '#f8fafc', fontSize: '13px' }}>{lists.length}</strong>{' '}
                        {lists.length === 1 ? 'Public List' : 'Public Lists'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div
                  style={{
                    display: 'flex',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '1rem',
                  }}
                  role="tablist"
                  aria-label="User activities"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'reviews'}
                    onClick={() => setActiveTab('reviews')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 16px',
                      color: activeTab === 'reviews' ? '#f5c518' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      borderBottom: activeTab === 'reviews' ? '2px solid #f5c518' : '2px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    Reviews ({reviewCount})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'lists'}
                    onClick={() => setActiveTab('lists')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '10px 16px',
                      color: activeTab === 'lists' ? '#f5c518' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      borderBottom: activeTab === 'lists' ? '2px solid #f5c518' : '2px solid transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    Public Lists ({lists.length})
                  </button>
                </div>

                {/* Tab: Reviews */}
                {activeTab === 'reviews' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.length === 0 ? (
                      <div
                        style={{
                          padding: '2rem 1rem',
                          textAlign: 'center',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '8px',
                          border: '1px dashed rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                          @{profile.username} has not published any movie reviews yet.
                        </p>
                      </div>
                    ) : (
                      reviews.map((rev) => {
                        const key = `${rev.media_type}_${rev.tmdb_id}`;
                        const movieInfo = movieDetails[key];
                        const isSpoilerCollapsed = rev.is_spoiler && !revealedSpoilers[rev.id];
                        const revDate = rev.created_at
                          ? new Date(rev.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '';

                        return (
                          <div
                            key={rev.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.025)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '10px',
                              padding: '1rem 1.25rem',
                            }}
                          >
                            {/* Movie link & date header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  if (onSelectMovie) onSelectMovie({ id: rev.tmdb_id, media_type: rev.media_type });
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  textAlign: 'left',
                                }}
                              >
                                {movieInfo?.poster_path && (
                                  <img
                                    src={posterUrl(movieInfo.poster_path, 'w92')}
                                    alt=""
                                    style={{ width: '24px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                                  />
                                )}
                                <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '14px', textDecoration: 'underline', textDecorationColor: 'rgba(245, 197, 24, 0.4)' }}>
                                  {movieInfo?.title || `Title #${rev.tmdb_id}`}
                                  {movieInfo?.year && <span style={{ color: '#94a3b8', fontWeight: 500, marginLeft: '4px' }}>({movieInfo.year})</span>}
                                </span>
                                <ExternalLink size={12} color="#f5c518" />
                              </button>

                              <span style={{ fontSize: '11px', color: '#64748b' }}>{revDate}</span>
                            </div>

                            {/* Rating and Headline */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '6px 0 8px' }}>
                              {rev.rating != null && (
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'rgba(245, 197, 24, 0.15)',
                                    color: '#f5c518',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                  }}
                                >
                                  <Star size={12} fill="currentColor" />
                                  <span>{rev.rating}/10</span>
                                </div>
                              )}
                              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>
                                {rev.headline}
                              </h4>
                            </div>

                            {/* Content or Spoiler Toggle */}
                            {rev.is_spoiler && (
                              <div style={{ marginBottom: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => toggleSpoiler(rev.id)}
                                  style={{
                                    background: 'rgba(245, 197, 24, 0.08)',
                                    border: '1px solid rgba(245, 197, 24, 0.25)',
                                    color: '#f5c518',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: 600,
                                  }}
                                >
                                  {isSpoilerCollapsed ? <Eye size={12} /> : <EyeOff size={12} />}
                                  <span>{isSpoilerCollapsed ? 'Contains Spoilers — Click to reveal' : 'Hide Spoilers'}</span>
                                </button>
                              </div>
                            )}

                            {!isSpoilerCollapsed && (
                              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                                {rev.content}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Tab: Lists */}
                {activeTab === 'lists' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {lists.length === 0 ? (
                      <div
                        style={{
                          padding: '2rem 1rem',
                          textAlign: 'center',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '8px',
                          border: '1px dashed rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                          @{profile.username} has no public lists yet.
                        </p>
                      </div>
                    ) : (
                      lists.map((lst) => (
                        <div
                          key={lst.id}
                          onClick={() => setActiveListDetail(lst)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '10px',
                            padding: '1rem 1.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            transition: 'background 0.2s, border-color 0.2s',
                          }}
                        >
                          <div>
                            <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                              {lst.title}
                            </h4>
                            {lst.description && (
                              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                                {lst.description}
                              </p>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>View List</span>
                            <ExternalLink size={14} color="#f5c518" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Nested List Detail Modal */}
      {activeListDetail && (
        <ListDetailModal
          listId={activeListDetail.id}
          onClose={() => setActiveListDetail(null)}
          onSelectMovie={(movie) => {
            setActiveListDetail(null);
            onClose();
            if (onSelectMovie) onSelectMovie(movie);
          }}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
