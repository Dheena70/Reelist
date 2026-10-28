import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import { getSupabase } from '../lib/supabase.js';
import {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
  voteReview,
  reportReview,
} from '../api/reviews.js';

export default function MovieReviewsSection({
  mediaType = 'movie',
  tmdbId,
  movieTitle = 'this title',
  onRequireAuth,
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [ratingInput, setRatingInput] = useState(8);
  const [headlineInput, setHeadlineInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [isSpoilerInput, setIsSpoilerInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Spoiler reveal state: map of reviewId -> boolean
  const [revealedSpoilers, setRevealedSpoilers] = useState({});

  // Report dialog state
  const [reportingReviewId, setReportingReviewId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMsg, setReportMsg] = useState('');

  // Load auth & reviews
  const loadReviews = useCallback(async () => {
    setLoading(true);
    const supabase = await getSupabase();
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      setSessionUser(session?.user || null);
    }
    const { data } = await getMovieReviews(mediaType, tmdbId);
    setReviews(data || []);
    setLoading(false);
  }, [mediaType, tmdbId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleOpenNewReview = () => {
    if (!sessionUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    setEditingReviewId(null);
    setRatingInput(8);
    setHeadlineInput('');
    setContentInput('');
    setIsSpoilerInput(false);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleEditReview = (rev) => {
    setEditingReviewId(rev.id);
    setRatingInput(rev.rating || 8);
    setHeadlineInput(rev.headline);
    setContentInput(rev.content);
    setIsSpoilerInput(rev.is_spoiler);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!headlineInput.trim()) {
      setFormError('Please enter a review headline.');
      return;
    }
    if (!contentInput.trim()) {
      setFormError('Please enter your review text.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingReviewId) {
        const { error } = await updateReview({
          reviewId: editingReviewId,
          rating: ratingInput,
          headline: headlineInput,
          content: contentInput,
          isSpoiler: isSpoilerInput,
        });
        if (error) throw new Error(error);
        setSuccessToast('Your review was successfully updated!');
      } else {
        const { error } = await createReview({
          mediaType,
          tmdbId,
          rating: ratingInput,
          headline: headlineInput,
          content: contentInput,
          isSpoiler: isSpoilerInput,
        });
        if (error) throw new Error(error);
        setSuccessToast('Your review was published!');
      }

      setIsFormOpen(false);
      setEditingReviewId(null);
      await loadReviews();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    const { error } = await deleteReview(reviewId);
    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setSuccessToast('Review removed.');
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const handleVote = async (reviewId, helpful) => {
    if (!sessionUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const targetVote = helpful ? 'helpful' : 'not_helpful';
        const isCanceling = r.my_vote === targetVote;

        let newHelpful = r.helpful_count;
        let newNotHelpful = r.not_helpful_count;

        if (isCanceling) {
          if (helpful) newHelpful = Math.max(0, newHelpful - 1);
          else newNotHelpful = Math.max(0, newNotHelpful - 1);
          return { ...r, my_vote: null, helpful_count: newHelpful, not_helpful_count: newNotHelpful };
        } else {
          if (r.my_vote === 'helpful') newHelpful = Math.max(0, newHelpful - 1);
          if (r.my_vote === 'not_helpful') newNotHelpful = Math.max(0, newNotHelpful - 1);
          if (helpful) newHelpful += 1;
          else newNotHelpful += 1;
          return { ...r, my_vote: targetVote, helpful_count: newHelpful, not_helpful_count: newNotHelpful };
        }
      })
    );

    await voteReview({ reviewId, helpful });
  };

  const handleOpenReport = (reviewId) => {
    if (!sessionUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    setReportingReviewId(reviewId);
    setReportReason('');
    setReportMsg('');
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim() || reportReason.trim().length < 3) {
      setReportMsg('Please provide a reason (min 3 characters).');
      return;
    }
    setReportSubmitting(true);
    const res = await reportReview({
      reviewId: reportingReviewId,
      reason: reportReason.trim(),
    });
    setReportSubmitting(false);
    if (res.success) {
      setReportMsg('Report submitted. Thank you for helping keep Reelist safe.');
      setTimeout(() => {
        setReportingReviewId(null);
        setReportMsg('');
      }, 2500);
    } else {
      setReportMsg(res.error || 'Failed to submit report');
    }
  };

  const toggleSpoilerReveal = (reviewId) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const userHasReview = reviews.some((r) => r.is_own_review);

  return (
    <div className="movie-reviews-container" style={{ marginTop: '2.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(245, 197, 24, 0.15)',
              color: '#f5c518',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={17} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              User Reviews
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} for {movieTitle}
            </span>
          </div>
        </div>

        {!isFormOpen && !userHasReview && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenNewReview}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Star size={14} fill="currentColor" />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {successToast && (
        <div
          role="status"
          style={{
            margin: '1rem 0',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Review Form Drawer / Modal */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          style={{
            margin: '1.25rem 0',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(245, 197, 24, 0.3)',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f5c518' }}>
              {editingReviewId ? 'Edit Your Review' : `Write Review for ${movieTitle}`}
            </h4>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsFormOpen(false)}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div
              style={{
                marginBottom: '1rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            >
              {formError}
            </div>
          )}

          {/* Rating input 1 to 10 */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
              Your Score: <span style={{ color: '#f5c518', fontSize: '14px' }}>★ {ratingInput}/10</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  type="button"
                  key={score}
                  onClick={() => setRatingInput(score)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: ratingInput === score ? '1px solid #f5c518' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: ratingInput === score ? '#f5c518' : 'rgba(255, 255, 255, 0.05)',
                    color: ratingInput === score ? '#000000' : '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Headline */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
              Headline (One line summary)
            </label>
            <input
              type="text"
              value={headlineInput}
              onChange={(e) => setHeadlineInput(e.target.value)}
              placeholder="e.g. Masterclass in storytelling and background score"
              maxLength={120}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '13px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>
              Review Content
            </label>
            <textarea
              value={contentInput}
              onChange={(e) => setContentInput(e.target.value)}
              placeholder="Share what worked, the performances, pacing, technical aspects, or why others should watch..."
              rows={4}
              maxLength={10000}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: '#0f172a',
                color: '#f8fafc',
                fontSize: '13px',
                boxSizing: 'border-box',
                resize: 'vertical',
                minHeight: '80px',
              }}
            />
          </div>

          {/* Spoiler checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <input
              type="checkbox"
              id="spoiler-check"
              checked={isSpoilerInput}
              onChange={(e) => setIsSpoilerInput(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="spoiler-check" style={{ fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={14} color="#f5c518" />
              <span>Warning: This review contains spoilers (will be collapsed by default)</span>
            </label>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsFormOpen(false)}
              disabled={submitting}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 700 }}
            >
              {submitting ? 'Publishing...' : editingReviewId ? 'Update Review' : 'Publish Review'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            Loading cinephile reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '10px',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
            }}
          >
            <p style={{ margin: '0 0 8px', color: '#cbd5e1', fontSize: '14px', fontWeight: 600 }}>
              No reviews yet for {movieTitle}.
            </p>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
              Be the first cinephile to share your thoughts and rate this title!
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const isSpoilerCollapsed = rev.is_spoiler && !revealedSpoilers[rev.id];
            const dateStr = rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

            return (
              <div
                key={rev.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: rev.is_own_review ? '1px solid rgba(245, 197, 24, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                }}
              >
                {/* Review Top Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f5c518 0%, #d97706 100%)',
                        color: '#000000',
                        fontWeight: 900,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {rev.username ? rev.username.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <a
                          href={`#/user/${rev.username}`}
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#f1f5f9',
                            textDecoration: 'none',
                            borderBottom: '1px dotted rgba(245, 197, 24, 0.5)',
                          }}
                          title={`View @${rev.username}'s public profile`}
                        >
                          @{rev.username}
                        </a>
                        {rev.is_own_review && (
                          <span style={{ fontSize: '10px', background: 'rgba(245, 197, 24, 0.2)', color: '#f5c518', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            YOU
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{dateStr}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {rev.rating && (
                      <span
                        style={{
                          background: 'rgba(245, 197, 24, 0.15)',
                          color: '#f5c518',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 800,
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                        title="Author's individual rating (Community score derived from rating_stats view)"
                      >
                        <Star size={12} fill="currentColor" />
                        <span>Author: {rev.rating}/10</span>
                      </span>
                    )}

                    {rev.is_spoiler && (
                      <span
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertTriangle size={11} />
                        <span>Spoiler</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Headline */}
                <h4 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                  {rev.headline}
                </h4>

                {/* Content with Spoiler Guard */}
                {isSpoilerCollapsed ? (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px dashed rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} />
                      <span>This review contains key plot spoilers.</span>
                    </span>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => toggleSpoilerReveal(rev.id)}
                      style={{ padding: '3px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Eye size={12} />
                      <span>Reveal Spoilers</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: '0 0 10px', fontSize: '13px', lineHeight: 1.6, color: '#cbd5e1', whiteSpace: 'pre-line' }}>
                      {rev.content}
                    </p>
                    {rev.is_spoiler && (
                      <button
                        type="button"
                        onClick={() => toggleSpoilerReveal(rev.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0,
                          marginBottom: '8px',
                        }}
                      >
                        <EyeOff size={11} />
                        <span>Hide Spoilers</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Footer / Actions: Helpful voting & Reporting */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleVote(rev.id, true)}
                      title="Helpful"
                      style={{
                        background: rev.my_vote === 'helpful' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: rev.my_vote === 'helpful' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: rev.my_vote === 'helpful' ? '#4ade80' : '#cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <ThumbsUp size={12} fill={rev.my_vote === 'helpful' ? 'currentColor' : 'none'} />
                      <span>Helpful ({rev.helpful_count || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVote(rev.id, false)}
                      title="Not helpful"
                      style={{
                        background: rev.my_vote === 'not_helpful' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: rev.my_vote === 'not_helpful' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: rev.my_vote === 'not_helpful' ? '#f87171' : '#cbd5e1',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <ThumbsDown size={12} fill={rev.my_vote === 'not_helpful' ? 'currentColor' : 'none'} />
                      <span>({rev.not_helpful_count || 0})</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {rev.is_own_review ? (
                      <>
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() => handleEditReview(rev)}
                          style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit3 size={11} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDeleteReview(rev.id)}
                          style={{ padding: '3px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={11} />
                          <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenReport(rev.id)}
                        title="Report inappropriate content"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px',
                        }}
                      >
                        <Flag size={11} />
                        <span>Report</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Modal */}
      {reportingReviewId && (
        <div
          className="modal-scrim"
          style={{ zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setReportingReviewId(null)}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: '0 0 8px', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 800 }}>
              Report Inappropriate Review
            </h4>
            <p style={{ margin: '0 0 12px', color: '#94a3b8', fontSize: '12px' }}>
              Please provide the reason why this review violates community standards (e.g. hate speech, abuse, spoilers unflagged).
            </p>

            {reportMsg && (
              <div style={{ marginBottom: '10px', fontSize: '12px', color: '#f5c518' }}>
                {reportMsg}
              </div>
            )}

            <form onSubmit={handleSubmitReport}>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason for reporting..."
                rows={3}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #475569',
                  background: '#1e293b',
                  color: '#ffffff',
                  fontSize: '13px',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setReportingReviewId(null)}
                  disabled={reportSubmitting}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={reportSubmitting}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
