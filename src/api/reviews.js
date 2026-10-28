import { getSupabase } from '../lib/supabase.js';
import { sanitizeId, sanitizeMediaType, sanitizeScore, setRating as setUserRatingInDB } from './userData.js';
import { getProfilesByIds } from './profiles.js';

export function sanitizeHeadline(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, 120);
}

export function sanitizeContent(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, 10000);
}

/**
 * Fetch all reviews for a movie or TV show, enriched with reviewer profiles and vote aggregates
 */
export async function getMovieReviews(mediaType = 'movie', tmdbId) {
  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { data: [], error: 'Invalid movie ID' };
  const cleanType = sanitizeMediaType(mediaType);

  const supabase = await getSupabase();
  if (!supabase) return { data: [], error: null };

  try {
    // 1. Fetch reviews
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('id, user_id, media_type, tmdb_id, rating, headline, content, is_spoiler, created_at, updated_at')
      .eq('media_type', cleanType)
      .eq('tmdb_id', cleanId)
      .order('created_at', { ascending: false });

    if (reviewError) return { data: [], error: reviewError.message };
    if (!reviews || reviews.length === 0) return { data: [], error: null };

    // 2. Identify current authenticated user (if any)
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id || null;

    const reviewIds = reviews.map((r) => r.id);
    const authorUserIds = Array.from(new Set(reviews.map((r) => r.user_id)));

    // 3. Secondary query on public.profiles (no FK embed on auth.users)
    const { data: profileMap } = await getProfilesByIds(authorUserIds);

    // 4. Secondary query on public.review_vote_counts view
    let voteCountsMap = {};
    try {
      const { data: voteCounts } = await supabase
        .from('review_vote_counts')
        .select('review_id, helpful, not_helpful')
        .in('review_id', reviewIds);

      (voteCounts || []).forEach((vc) => {
        voteCountsMap[vc.review_id] = {
          helpful: Number(vc.helpful) || 0,
          not_helpful: Number(vc.not_helpful) || 0,
        };
      });
    } catch {
      voteCountsMap = {};
    }

    // 5. Query user's own vote (if signed in)
    let myVotesMap = {};
    if (currentUserId) {
      try {
        const { data: myVotes } = await supabase
          .from('review_votes')
          .select('review_id, helpful')
          .eq('user_id', currentUserId)
          .in('review_id', reviewIds);

        (myVotes || []).forEach((mv) => {
          myVotesMap[mv.review_id] = mv.helpful ? 'helpful' : 'not_helpful';
        });
      } catch {
        myVotesMap = {};
      }
    }

    // 6. Enrich reviews
    const enriched = reviews.map((r) => {
      const author = profileMap?.[r.user_id] || { username: 'Cinephile', avatar_url: null };
      const counts = voteCountsMap[r.id] || { helpful: 0, not_helpful: 0 };
      const myVote = myVotesMap[r.id] || null;

      return {
        ...r,
        username: author.username,
        avatar_url: author.avatar_url,
        helpful_count: counts.helpful,
        not_helpful_count: counts.not_helpful,
        my_vote: myVote,
        is_own_review: currentUserId === r.user_id,
      };
    });

    return { data: enriched, error: null };
  } catch (err) {
    return { data: [], error: err?.message || 'Failed to fetch reviews' };
  }
}

/**
 * Submit a new review
 */
export async function createReview({ mediaType = 'movie', tmdbId, rating, headline, content, isSpoiler = false }) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };

  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { data: null, error: 'Invalid movie ID' };
  const cleanType = sanitizeMediaType(mediaType);
  const cleanHeadline = sanitizeHeadline(headline);
  const cleanContent = sanitizeContent(content);

  if (!cleanHeadline) {
    return { data: null, error: 'Headline is required (up to 120 characters).' };
  }
  if (!cleanContent) {
    return { data: null, error: 'Review content cannot be empty.' };
  }

  const cleanRating = rating != null ? sanitizeScore(rating) : null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Please sign in to write a review' };

    const payload = {
      user_id: session.user.id,
      media_type: cleanType,
      tmdb_id: cleanId,
      rating: cleanRating,
      headline: cleanHeadline,
      content: cleanContent,
      is_spoiler: Boolean(isSpoiler),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert(payload)
      .select('id, user_id, media_type, tmdb_id, rating, headline, content, is_spoiler, created_at, updated_at')
      .maybeSingle();

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        return { data: null, error: 'You have already reviewed this title. You can edit your existing review.' };
      }
      if (error.message?.includes('Daily review limit reached')) {
        return { data: null, error: 'Daily review limit reached (maximum 20 reviews per 24 hours).' };
      }
      return { data: null, error: error.message };
    }

    // Single source of truth write-through: Sync rating to public.ratings so rating_stats updates
    let syncWarning = null;
    if (cleanRating !== null) {
      try {
        const syncRes = await setUserRatingInDB(cleanType, cleanId, cleanRating);
        if (syncRes?.error) {
          syncWarning = 'Review saved, but your rating could not be synced. Try rating the title again.';
        }
      } catch {
        syncWarning = 'Review saved, but your rating could not be synced. Try rating the title again.';
      }
    }

    return { data, warning: syncWarning, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to submit review' };
  }
}

/**
 * Update an existing review
 */
export async function updateReview({ reviewId, rating, headline, content, isSpoiler }) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  if (!reviewId) return { data: null, error: 'Missing review ID' };

  const cleanHeadline = sanitizeHeadline(headline);
  const cleanContent = sanitizeContent(content);

  if (!cleanHeadline) return { data: null, error: 'Headline is required.' };
  if (!cleanContent) return { data: null, error: 'Review content cannot be empty.' };

  const cleanRating = rating != null ? sanitizeScore(rating) : null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Not authenticated' };

    const payload = {
      headline: cleanHeadline,
      content: cleanContent,
      rating: cleanRating,
      is_spoiler: Boolean(isSpoiler),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('reviews')
      .update(payload)
      .eq('id', reviewId)
      .eq('user_id', session.user.id)
      .select('id, user_id, media_type, tmdb_id, rating, headline, content, is_spoiler, created_at, updated_at')
      .maybeSingle();

    if (error) return { data: null, error: error.message };

    // Single source of truth write-through: Sync rating to public.ratings
    let syncWarning = null;
    if (data && cleanRating !== null) {
      try {
        const syncRes = await setUserRatingInDB(data.media_type, data.tmdb_id, cleanRating);
        if (syncRes?.error) {
          syncWarning = 'Review saved, but your rating could not be synced. Try rating the title again.';
        }
      } catch {
        syncWarning = 'Review saved, but your rating could not be synced. Try rating the title again.';
      }
    }

    return { data, warning: syncWarning, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to update review' };
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId) {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, error: 'Database unavailable' };
  if (!reviewId) return { success: false, error: 'Missing review ID' };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', session.user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err?.message || 'Failed to delete review' };
  }
}

/**
 * Vote on a review (Helpful or Unhelpful)
 * If user clicks their existing active vote, removes the vote (toggle)
 */
export async function voteReview({ reviewId, helpful }) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  if (!reviewId) return { data: null, error: 'Missing review ID' };

  const isHelpful = Boolean(helpful);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Please sign in to vote' };

    // Check existing vote
    const { data: existing, error: fetchErr } = await supabase
      .from('review_votes')
      .select('helpful')
      .eq('review_id', reviewId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (fetchErr) return { data: null, error: fetchErr.message };

    if (existing && existing.helpful === isHelpful) {
      // Toggle off vote
      const { error: delErr } = await supabase
        .from('review_votes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', session.user.id);

      if (delErr) return { data: null, error: delErr.message };
      return { data: { reviewId, myVote: null }, error: null };
    } else {
      // Upsert vote
      const { error: upsertErr } = await supabase
        .from('review_votes')
        .upsert(
          {
            review_id: reviewId,
            user_id: session.user.id,
            helpful: isHelpful,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'review_id,user_id' }
        );

      if (upsertErr) return { data: null, error: upsertErr.message };
      return { data: { reviewId, myVote: isHelpful ? 'helpful' : 'not_helpful' }, error: null };
    }
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to vote' };
  }
}

/**
 * Report an inappropriate review
 */
export async function reportReview({ reviewId, reason }) {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, error: 'Database unavailable' };
  if (!reviewId) return { success: false, error: 'Missing review ID' };

  const cleanReason = typeof reason === 'string' ? reason.trim().slice(0, 500) : '';
  if (cleanReason.length < 3) {
    return { success: false, error: 'Please provide a valid reason (min 3 characters).' };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { success: false, error: 'Please sign in to report a review' };

    const { error } = await supabase
      .from('review_reports')
      .insert({
        review_id: reviewId,
        reporter_user_id: session.user.id,
        reason: cleanReason,
        created_at: new Date().toISOString(),
      });

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        return { success: true, message: 'You have already reported this review for moderation.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Thank you. The review has been flagged for moderation.' };
  } catch (err) {
    return { success: false, error: err?.message || 'Failed to report review' };
  }
}

/**
 * Fetch reviews authored by a specific user for public profile view
 */
export async function getUserReviews(userId, limit = 20) {
  if (!userId) return { data: [], count: 0, error: 'User ID required' };
  const supabase = await getSupabase();
  if (!supabase) return { data: [], count: 0, error: null };

  try {
    const { data, count, error } = await supabase
      .from('reviews')
      .select('id, user_id, media_type, tmdb_id, rating, headline, content, is_spoiler, created_at, updated_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { data: [], count: 0, error: error.message };
    return { data: data || [], count: count || (data ? data.length : 0), error: null };
  } catch (err) {
    return { data: [], count: 0, error: err?.message || 'Failed to fetch user reviews' };
  }
}

