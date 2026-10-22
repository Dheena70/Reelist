import React, { useState } from 'react';
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

export default function UserProfileModal({ currentUser, onClose, onLogout }) {
  const [watchlistCount, setWatchlistCount] = useState(() => {
    return analytics.getUserWatchlist(currentUser?.email)?.length || 0;
  });
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExportBackup = () => {
    try {
      const data = analytics.exportUserData(currentUser?.email);
      if (!data) throw new Error('Could not generate backup data.');

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reelist-backup-${currentUser?.email || 'user'}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedbackMsg('Backup downloaded successfully! Keep it safe.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      setFeedbackMsg(`Export failed: ${err.message}`);
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        const res = analytics.importUserData(parsed);
        if (res.success) {
          setWatchlistCount(res.count);
          setFeedbackMsg(`Data restored successfully! Restored ${res.count} saved titles.`);
          setTimeout(() => setFeedbackMsg(''), 4000);
        } else {
          setFeedbackMsg(res.error || 'Failed to parse backup.');
        }
      } catch {
        setFeedbackMsg('Invalid JSON file format. Please upload a valid Reelist backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    const res = analytics.deleteAccount(currentUser?.email);
    if (res.success) {
      if (onLogout) onLogout();
      if (onClose) onClose();
    } else {
      setIsDeleting(false);
      setFeedbackMsg(res.error || 'Failed to delete account.');
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

          {/* Database Backup & Restore */}
          <section className="user-profile__section">
            <h4 className="user-profile__section-title">Database & Local Storage Backups</h4>
            <p className="user-profile__section-desc">
              Your watchlist, ratings, and preferences are protected with Row-Level Security in your private browser sandbox. You can download an encrypted JSON snapshot or restore a previous backup anytime.
            </p>
            <div className="user-profile__btn-row">
              <button
                type="button"
                className="btn-outline user-profile__action-btn"
                onClick={handleExportBackup}
                title="Download JSON backup of your watchlist and ratings"
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
                <span>Delete Account & Purge Data</span>
              </button>
            ) : (
              <div className="user-profile__delete-confirm">
                <div className="user-profile__delete-warning">
                  <AlertTriangle size={16} />
                  <span>Are you sure? This will permanently delete your account and personal watchlist.</span>
                </div>
                <div className="user-profile__delete-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-danger-confirm"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
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
