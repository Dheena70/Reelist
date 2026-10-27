import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  LogOut,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { analytics } from '../api/analytics.js';
import { getSupabase } from '../lib/supabase.js';
import {
  getWatchlist,
  exportUserDataFromDB,
  importUserDataToDB,
  clearLegacyLocalUserData,
} from '../api/userData.js';

export default function UserProfileModal({ currentUser, onClose, onLogout }) {
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  useEffect(() => {
    let mounted = true;
    getWatchlist().then(({ data }) => {
      if (mounted && Array.isArray(data)) {
        setWatchlistCount(data.length);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleExportBackup = async () => {
    try {
      const { data, error } = await exportUserDataFromDB();
      if (error || !data) throw new Error(error || 'Could not generate backup data.');

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reelist-backup-${currentUser?.email || currentUser?.id || 'user'}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedbackMsg('Database backup downloaded successfully!');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setFeedbackMsg(`Export failed: ${err.message}`);
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        const res = await importUserDataToDB(parsed);
        if (res.success) {
          const totalImported = (res.counts.watchlist || 0) + (res.counts.ratings || 0) + (res.counts.reactions || 0);
          setWatchlistCount((prev) => prev + (res.counts.watchlist || 0));
          setFeedbackMsg(`Data restored successfully! Imported ${totalImported} records into your account.`);
          setTimeout(() => setFeedbackMsg(''), 4000);
        } else {
          setFeedbackMsg(res.error || 'Failed to restore backup.');
        }
      } catch {
        setFeedbackMsg('Invalid JSON file format. Please upload a valid Reelist backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);
    setFeedbackMsg('');

    try {
      const supabase = await getSupabase();
      if (!supabase) throw new Error('Database connection unavailable.');
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) {
        throw new Error(error.message || 'Failed to delete account');
      }

      clearLegacyLocalUserData();
      await analytics.logout();
      if (onLogout) onLogout();
      if (onClose) onClose();
    } catch (err) {
      setIsDeleting(false);
      setFeedbackMsg(`Account deletion error: ${err.message}`);
    }
  };

  return (
    <div
      className="modal-scrim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-title"
    >
      <div
        className="legal-modal-card user-profile-card"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="legal-modal-header">
          <div className="legal-modal-title-wrap">
            <div className="legal-icon-box" aria-hidden="true">
              <User size={20} />
            </div>
            <div>
              <h2 id="user-profile-title" className="legal-modal-title">
                Cinephile Account & Security
              </h2>
              <p className="legal-modal-subtitle">Manage your profile, backups, and privacy isolation</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close profile modal"
          >
            <X size={18} />
          </button>
        </header>

        <div className="legal-modal-body user-profile-body">
          {feedbackMsg && (
            <div className="user-profile__alert" role="status">
              <CheckCircle2 size={16} />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* User Identity Card */}
          <section className="user-profile__card">
            <div className="user-profile__avatar">
              <span>{(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}</span>
            </div>
            <div className="user-profile__info">
              <h3 className="user-profile__name">{currentUser?.name || 'Reelist Member'}</h3>
              <p className="user-profile__email">{currentUser?.email}</p>
              <div className="user-profile__badges">
                <span className="badge badge--verified" title="Email format verified">
                  <ShieldCheck size={13} />
                  <span>Verified Cinephile</span>
                </span>
                <span className="badge badge--rls" title="Data stored in user-isolated namespace">
                  <span>RLS Isolated Namespace</span>
                </span>
              </div>
            </div>
          </section>

          {/* Data & Watchlist Metrics */}
          <section className="user-profile__stats-grid">
            <div className="user-profile__stat-card">
              <div className="user-profile__stat-icon">
                <Bookmark size={18} />
              </div>
              <div>
                <span className="user-profile__stat-val">{watchlistCount}</span>
                <span className="user-profile__stat-lbl">Titles in Watchlist</span>
              </div>
            </div>
          </section>

          {/* Data Backup & Restore */}
          <section className="user-profile__section">
            <h4 className="user-profile__section-title">Data Backup & Restore</h4>
            <p className="user-profile__section-desc">
              Your watchlist and preferences are currently stored locally in your browser. You can export a JSON backup or restore a previous backup anytime.
            </p>
            <div className="user-profile__btn-row">
              <button
                type="button"
                className="btn-outline user-profile__action-btn"
                onClick={handleExportBackup}
                title="Download JSON backup of your watchlist and reactions"
              >
                <Download size={15} />
                <span>Download Backup (JSON)</span>
              </button>

              <label className="btn-outline user-profile__action-btn user-profile__file-label">
                <Upload size={15} />
                <span>Restore Backup (JSON)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </section>

          {/* Delete Account & Danger Zone */}
          <section className="user-profile__section user-profile__section--danger">
            <h4 className="user-profile__section-title">Account Deletion & Data Purge</h4>
            <p className="user-profile__section-desc">
              Under Indian DPDP and GDPR compliance, you have the right to permanently erase your profile credentials, personal watchlist, and session keys from this device.
            </p>

            {!confirmDelete ? (
              <button
                type="button"
                className="btn-danger user-profile__delete-btn"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={15} />
                <span>Delete Account &amp; Purge Data</span>
              </button>
            ) : (
              <div className="user-profile__delete-confirm">
                <div className="user-profile__delete-warning">
                  <AlertTriangle size={16} />
                  <span>This will permanently delete your account, watchlist, ratings, and reactions from Supabase.</span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 4px' }}>
                  Please type <strong>DELETE</strong> to confirm permanent deletion:
                </p>
                <input
                  type="text"
                  className="user-profile__delete-input"
                  placeholder="Type DELETE"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    marginBottom: '10px',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    color: '#0f172a',
                  }}
                />
                <div className="user-profile__delete-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setConfirmDelete(false);
                      setDeleteConfirmationText('');
                    }}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-danger-confirm"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirmationText !== 'DELETE'}
                  >
                    {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <footer className="legal-modal-footer">
          <button
            type="button"
            className="btn-outline user-profile__logout-btn"
            onClick={() => {
              if (onLogout) onLogout();
              if (onClose) onClose();
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
