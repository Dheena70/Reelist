import React, { useState, useEffect } from 'react';
import {
  X,
  List,
  Lock,
  Globe,
  Trash2,
  Film,
  User,
  AlertCircle,
} from 'lucide-react';
import { posterUrl, tmdb } from '../api/tmdb.js';
import { getListDetails, removeFromList } from '../api/lists.js';

export default function ListDetailModal({
  listId,
  currentUserId,
  onClose,
  onSelectMovie,
}) {
  const [listData, setListData] = useState(null);
  const [movieDetailsMap, setMovieDetailsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    getListDetails(listId).then(async ({ data, error: err }) => {
      if (!mounted) return;
      if (err || !data) {
        setError(err || 'List not found or private');
        setLoading(false);
        return;
      }
      setListData(data);
      setLoading(false);

      // Hydrate TMDB metadata for list items
      if (data.items && data.items.length > 0) {
        const detailsPromises = data.items.map(async (item) => {
          try {
            const movie = await tmdb.movieDetails(item.tmdb_id);
            return { id: item.tmdb_id, movie };
          } catch {
            return { id: item.tmdb_id, movie: null };
          }
        });
        const resolved = await Promise.all(detailsPromises);
        if (mounted) {
          const map = {};
          resolved.forEach((r) => {
            if (r.movie) map[r.id] = r.movie;
          });
          setMovieDetailsMap(map);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [listId]);

  const isOwner = listData && currentUserId && listData.user_id === currentUserId;

  const handleRemoveItem = async (tmdbId, mediaType) => {
    if (!window.confirm('Remove this title from your list?')) return;
    const { success, error: delErr } = await removeFromList({
      listId,
      mediaType,
      tmdbId,
    });

    if (success) {
      setListData((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.tmdb_id !== tmdbId),
      }));
      setActionMsg('Item removed from list');
      setTimeout(() => setActionMsg(''), 3000);
    } else {
      setActionMsg(delErr || 'Failed to remove item');
    }
  };

  return (
    <div
      className="modal-scrim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="list-detail-title"
      style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="legal-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <header className="legal-modal-header" style={{ flexShrink: 0 }}>
          <div className="legal-modal-title-wrap">
            <div className="legal-icon-box" aria-hidden="true" style={{ background: 'rgba(245, 197, 24, 0.15)', color: '#f5c518' }}>
              <List size={20} />
            </div>
            <div>
              <h2 id="list-detail-title" className="legal-modal-title" style={{ fontSize: '1.25rem' }}>
                {listData ? listData.title : 'Custom Collection'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                {listData && (
                  <>
                    <span style={{ fontSize: '12px', color: '#f5c518', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <User size={12} />
                      <a
                        href={`#/user/${listData.username}`}
                        onClick={onClose}
                        style={{ color: '#f5c518', textDecoration: 'none' }}
                      >
                        @{listData.username}
                      </a>
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>•</span>
                    <span style={{ fontSize: '11px', color: listData.is_private ? '#f87171' : '#34d399', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      {listData.is_private ? <Lock size={11} /> : <Globe size={11} />}
                      <span>{listData.is_private ? 'Private List' : 'Public Collection'}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close list detail modal"
          >
            <X size={18} />
          </button>
        </header>

        {/* Body */}
        <div className="legal-modal-body" style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
          {actionMsg && (
            <div style={{ marginBottom: '1rem', background: 'rgba(245, 197, 24, 0.15)', color: '#f5c518', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
              {actionMsg}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              Loading collection details...
            </div>
          ) : error ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <AlertCircle size={32} color="#f87171" style={{ margin: '0 auto 10px', display: 'block' }} />
              <h3 style={{ margin: '0 0 6px', color: '#f87171', fontSize: '1rem' }}>Access Restricted</h3>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13px' }}>{error}</p>
            </div>
          ) : (
            <div>
              {listData.description && (
                <p style={{ margin: '0 0 1.25rem', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  {listData.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  Titles in Collection ({listData.items.length})
                </span>
              </div>

              {listData.items.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                  <Film size={28} color="#64748b" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                    This collection is currently empty.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '14px',
                  }}
                >
                  {listData.items.map((item) => {
                    const movie = movieDetailsMap[item.tmdb_id];
                    const poster = movie ? posterUrl(movie.poster_path, 'w185') : null;
                    const title = movie?.title || movie?.name || `Title #${item.tmdb_id}`;
                    const year = movie?.release_date ? movie.release_date.slice(0, 4) : '';

                    return (
                      <div
                        key={item.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                        }}
                      >
                        {/* Poster */}
                        <div
                          onClick={() => {
                            if (onSelectMovie) {
                              onSelectMovie({ id: item.tmdb_id, title });
                              onClose();
                            }
                          }}
                          style={{
                            aspectRatio: '2/3',
                            background: '#0f172a',
                            position: 'relative',
                            cursor: 'pointer',
                          }}
                        >
                          {poster ? (
                            <img
                              src={poster}
                              alt={title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              loading="lazy"
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                              <Film size={24} />
                            </div>
                          )}

                          {movie?.vote_average && (
                            <span style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.75)', color: '#f5c518', fontSize: '10px', fontWeight: 800, padding: '2px 5px', borderRadius: '4px' }}>
                              ★ {movie.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {/* Meta */}
                        <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <span
                              onClick={() => {
                                if (onSelectMovie) {
                                  onSelectMovie({ id: item.tmdb_id, title });
                                  onClose();
                                }
                              }}
                              style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#f8fafc',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                cursor: 'pointer',
                              }}
                              title={title}
                            >
                              {title}
                            </span>
                            {year && (
                              <span style={{ fontSize: '10px', color: '#64748b' }}>
                                {year}
                              </span>
                            )}
                          </div>

                          {item.notes && (
                            <p style={{ margin: '4px 0 0', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.notes}>
                              &ldquo;{item.notes}&rdquo;
                            </p>
                          )}

                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.tmdb_id, item.media_type)}
                              style={{
                                marginTop: '6px',
                                background: 'transparent',
                                border: 'none',
                                color: '#f87171',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 0',
                              }}
                            >
                              <Trash2 size={11} />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="legal-modal-footer" style={{ flexShrink: 0 }}>
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
