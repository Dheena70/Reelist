import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ListPlus,
  Check,
  Lock,
  Globe,
  Plus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  getUserListsWithMembership,
  addToList,
  removeFromList,
  createList,
} from '../api/lists.js';
import { getSupabase } from '../lib/supabase.js';

export default function AddToListModal({
  mediaType = 'movie',
  tmdbId,
  movieTitle = 'this title',
  onClose,
  onRequireAuth,
}) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Create list inline form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrivate, setNewPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadLists = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    const supabase = await getSupabase();
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setLoading(false);
        if (onRequireAuth) onRequireAuth('Sign in to save titles to your custom lists');
        onClose();
        return;
      }
    }

    const { data, error } = await getUserListsWithMembership(mediaType, tmdbId);
    if (error) {
      setErrorMsg(error);
    } else {
      setLists(data || []);
    }
    setLoading(false);
  }, [mediaType, tmdbId, onRequireAuth, onClose]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const handleToggleMembership = async (list) => {
    setErrorMsg('');
    const targetState = !list.containsMovie;

    // Optimistic toggle
    setLists((prev) =>
      prev.map((l) => (l.id === list.id ? { ...l, containsMovie: targetState } : l))
    );

    if (targetState) {
      const res = await addToList({ listId: list.id, mediaType, tmdbId });
      if (res.error) {
        // Rollback
        setLists((prev) =>
          prev.map((l) => (l.id === list.id ? { ...l, containsMovie: false } : l))
        );
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(`Added to "${list.title}"`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } else {
      const res = await removeFromList({ listId: list.id, mediaType, tmdbId });
      if (res.error) {
        // Rollback
        setLists((prev) =>
          prev.map((l) => (l.id === list.id ? { ...l, containsMovie: true } : l))
        );
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(`Removed from "${list.title}"`);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg('Please enter a list title.');
      return;
    }

    setCreating(true);
    setErrorMsg('');

    const createRes = await createList({
      title: newTitle.trim(),
      description: newDesc.trim(),
      isPrivate: newPrivate,
    });

    if (createRes.error || !createRes.data) {
      setCreating(false);
      setErrorMsg(createRes.error || 'Failed to create list');
      return;
    }

    const newList = createRes.data;
    const addRes = await addToList({ listId: newList.id, mediaType, tmdbId });

    setCreating(false);
    if (addRes.error) {
      setErrorMsg(addRes.error);
    } else {
      setLists((prev) => [{ ...newList, containsMovie: true }, ...prev]);
      setShowCreateForm(false);
      setNewTitle('');
      setNewDesc('');
      setNewPrivate(false);
      setSuccessMsg(`Created "${newList.title}" and added ${movieTitle}!`);
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  return (
    <div
      className="modal-scrim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-list-title"
      style={{ zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="legal-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', width: '90%', padding: 0, overflow: 'hidden' }}
      >
        <header className="legal-modal-header" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="legal-modal-title-wrap">
            <div className="legal-icon-box" style={{ background: 'rgba(245, 197, 24, 0.15)', color: '#f5c518' }}>
              <ListPlus size={18} />
            </div>
            <div>
              <h3 id="add-to-list-title" className="legal-modal-title" style={{ fontSize: '1.1rem' }}>
                Add to Custom List
              </h3>
              <p className="legal-modal-subtitle" style={{ fontSize: '12px' }}>
                Save &ldquo;{movieTitle}&rdquo; to your collections
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close add to list dialog"
          >
            <X size={18} />
          </button>
        </header>

        <div style={{ padding: '1rem 1.5rem' }}>
          {errorMsg && (
            <div style={{ marginBottom: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ marginBottom: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              Loading your lists...
            </div>
          ) : (
            <div>
              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1rem' }}>
                {lists.length === 0 ? (
                  <div style={{ padding: '1.5rem 1rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: '1px dashed rgba(255, 255, 255, 0.1)', color: '#94a3b8', fontSize: '12px' }}>
                    You have not created any custom lists yet.
                  </div>
                ) : (
                  lists.map((list) => {
                    const isChecked = list.containsMovie;
                    return (
                      <div
                        key={list.id}
                        onClick={() => handleToggleMembership(list)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: isChecked ? 'rgba(245, 197, 24, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          border: isChecked ? '1px solid rgba(245, 197, 24, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: isChecked ? '1px solid #f5c518' : '1px solid #64748b',
                              background: isChecked ? '#f5c518' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#000000',
                            }}
                          >
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                              {list.title}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                              <span style={{ fontSize: '10px', color: list.is_private ? '#f87171' : '#34d399', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                {list.is_private ? <Lock size={10} /> : <Globe size={10} />}
                                <span>{list.is_private ? 'Private' : 'Public'}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <span style={{ fontSize: '11px', color: isChecked ? '#f5c518' : '#64748b', fontWeight: 700 }}>
                          {isChecked ? 'Added' : '+ Add'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Create List Row */}
              {!showCreateForm ? (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowCreateForm(true)}
                  style={{ width: '100%', padding: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>Create New List &amp; Add</span>
                </button>
              ) : (
                <form onSubmit={handleCreateAndAdd} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#f5c518', marginBottom: '6px' }}>
                    New List Name
                  </span>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Favorite Tamil Thrillers"
                    maxLength={100}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #475569',
                      background: '#0f172a',
                      color: '#ffffff',
                      fontSize: '12px',
                      marginBottom: '8px',
                      boxSizing: 'border-box',
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#cbd5e1', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newPrivate}
                        onChange={(e) => setNewPrivate(e.target.checked)}
                      />
                      <span>Private list</span>
                    </label>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowCreateForm(false)}
                        disabled={creating}
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={creating}
                        style={{ padding: '4px 12px', fontSize: '11px', fontWeight: 700 }}
                      >
                        {creating ? 'Saving...' : 'Create & Add'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <footer className="legal-modal-footer" style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button type="button" className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
