import { getSupabase } from '../lib/supabase.js';

export const ALLOWED_MEDIA_TYPES = ['movie', 'tv'];
export const ALLOWED_REACTION_KINDS = ['thumbsUp', 'heart', 'clap', 'lightbulb', 'smile', 'starFace'];

export function sanitizeId(rawId) {
  const num = Number(rawId);
  if (!Number.isInteger(num) || num <= 0 || num >= 10_000_000) {
    return null;
  }
  return num;
}

export function sanitizeMediaType(rawType) {
  return rawType === 'tv' ? 'tv' : 'movie';
}

export function sanitizeScore(rawScore) {
  const num = Number(rawScore);
  if (!Number.isInteger(num)) return null;
  return Math.min(10, Math.max(1, num));
}

/**
 * Remove obsolete client-side localStorage keys on authentication
 */
export function clearLegacyLocalUserData() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('reelist_watchlist') ||
         key.startsWith('reelist_rating_') ||
         key.startsWith('reelist_reactions_') ||
         key.startsWith('reelist_my_reactions_'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore storage exceptions
  }
}

/**
 * Watchlist operations (Supabase table: public.watchlist)
 */
export async function getWatchlist() {
  const supabase = await getSupabase();
  if (!supabase) return { data: [], error: null };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: [], error: null };

    const { data, error } = await supabase
      .from('watchlist')
      .select('tmdb_id, media_type, created_at')
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err?.message || 'Failed to fetch watchlist' };
  }
}

export async function addToWatchlist(mediaType = 'movie', tmdbId) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  const cleanId = sanitizeId(tmdbId);
  const cleanType = sanitizeMediaType(mediaType);
  if (!cleanId) return { data: null, error: 'Invalid movie ID' };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('watchlist')
      .upsert(
        {
          user_id: session.user.id,
          media_type: cleanType,
          tmdb_id: cleanId,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,media_type,tmdb_id' }
      )
      .select('tmdb_id, media_type')
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data: data || { tmdb_id: cleanId, media_type: cleanType }, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to add to watchlist' };
  }
}

export async function removeFromWatchlist(mediaType = 'movie', tmdbId) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  const cleanId = sanitizeId(tmdbId);
  const cleanType = sanitizeMediaType(mediaType);
  if (!cleanId) return { data: null, error: 'Invalid movie ID' };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Not authenticated' };

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', session.user.id)
      .eq('media_type', cleanType)
      .eq('tmdb_id', cleanId);

    if (error) return { data: null, error: error.message };
    return { data: { tmdb_id: cleanId, media_type: cleanType }, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to remove from watchlist' };
  }
}

/**
 * User ratings operations (Supabase table: public.ratings)
 */
export async function getMyRatings() {
  const supabase = await getSupabase();
  if (!supabase) return { data: [], error: null };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: [], error: null };

    const { data, error } = await supabase
      .from('ratings')
      .select('tmdb_id, media_type, score, updated_at');

    if (error) return { data: [], error: error.message };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err?.message || 'Failed to fetch ratings' };
  }
}

export async function setRating(mediaType = 'movie', tmdbId, score) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { data: null, error: 'Invalid movie ID' };
  const cleanScore = sanitizeScore(score);
  if (cleanScore === null) return { data: null, error: 'Rating must be an integer between 1 and 10' };
  const cleanType = sanitizeMediaType(mediaType);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('ratings')
      .upsert(
        {
          user_id: session.user.id,
          media_type: cleanType,
          tmdb_id: cleanId,
          score: cleanScore,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,media_type,tmdb_id' }
      )
      .select('tmdb_id, media_type, score')
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data: data || { tmdb_id: cleanId, score: cleanScore }, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to set rating' };
  }
}

export async function removeRating(mediaType = 'movie', tmdbId) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { data: null, error: 'Invalid movie ID' };
  const cleanType = sanitizeMediaType(mediaType);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Not authenticated' };

    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('user_id', session.user.id)
      .eq('media_type', cleanType)
      .eq('tmdb_id', cleanId);

    if (error) return { data: null, error: error.message };
    return { data: { tmdb_id: cleanId }, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to remove rating' };
  }
}

/**
 * Reactions operations (Supabase table: public.reactions)
 */
export async function getMyReactions(mediaType = 'movie', tmdbId) {
  const supabase = await getSupabase();
  if (!supabase) return { data: {}, error: null };
  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { data: {}, error: 'Invalid movie ID' };
  const cleanType = sanitizeMediaType(mediaType);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: {}, error: null };

    const { data, error } = await supabase
      .from('reactions')
      .select('kind')
      .eq('user_id', session.user.id)
      .eq('media_type', cleanType)
      .eq('tmdb_id', cleanId);

    if (error) return { data: {}, error: error.message };
    const myMap = {};
    (data || []).forEach((r) => {
      myMap[r.kind] = true;
    });
    return { data: myMap, error: null };
  } catch (err) {
    return { data: {}, error: err?.message || 'Failed to fetch user reactions' };
  }
}

export async function toggleReaction(mediaType = 'movie', tmdbId, kind) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { data: null, error: 'Invalid movie ID' };
  if (!ALLOWED_REACTION_KINDS.includes(kind)) return { data: null, error: 'Invalid reaction kind' };
  const cleanType = sanitizeMediaType(mediaType);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Not authenticated' };

    const { data: existing, error: checkError } = await supabase
      .from('reactions')
      .select('kind')
      .eq('user_id', session.user.id)
      .eq('media_type', cleanType)
      .eq('tmdb_id', cleanId)
      .eq('kind', kind)
      .maybeSingle();

    if (checkError) return { data: null, error: checkError.message };

    if (existing) {
      const { error: delError } = await supabase
        .from('reactions')
        .delete()
        .eq('user_id', session.user.id)
        .eq('media_type', cleanType)
        .eq('tmdb_id', cleanId)
        .eq('kind', kind);

      if (delError) return { data: null, error: delError.message };
      return { data: { kind, active: false }, error: null };
    } else {
      const { error: insError } = await supabase
        .from('reactions')
        .insert({
          user_id: session.user.id,
          media_type: cleanType,
          tmdb_id: cleanId,
          kind,
          created_at: new Date().toISOString(),
        });

      if (insError) return { data: null, error: insError.message };
      return { data: { kind, active: true }, error: null };
    }
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to toggle reaction' };
  }
}

/**
 * Public community stats (Supabase views: rating_stats & reaction_counts)
 */
export async function getRatingStats(mediaType = 'movie', tmdbId) {
  const defaultStat = { avg_score: null, votes: 0 };
  const supabase = await getSupabase();
  if (!supabase) return { data: defaultStat, error: null };
  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { data: defaultStat, error: 'Invalid movie ID' };
  const cleanType = sanitizeMediaType(mediaType);

  try {
    const { data, error } = await supabase
      .from('rating_stats')
      .select('avg_score, votes')
      .eq('media_type', cleanType)
      .eq('tmdb_id', cleanId)
      .maybeSingle();

    if (error) return { data: defaultStat, error: error.message };
    if (!data) return { data: defaultStat, error: null };

    return {
      data: {
        avg_score: data.avg_score != null ? Number(data.avg_score) : null,
        votes: Number(data.votes) || 0,
      },
      error: null,
    };
  } catch (err) {
    return { data: defaultStat, error: err?.message || 'Failed to fetch rating stats' };
  }
}

export async function getReactionCounts(mediaType = 'movie', tmdbId) {
  const baseCounts = {
    thumbsUp: 0,
    heart: 0,
    clap: 0,
    lightbulb: 0,
    smile: 0,
    starFace: 0,
  };
  const supabase = await getSupabase();
  if (!supabase) return { data: baseCounts, error: null };
  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { data: baseCounts, error: 'Invalid movie ID' };
  const cleanType = sanitizeMediaType(mediaType);

  try {
    const { data, error } = await supabase
      .from('reaction_counts')
      .select('kind, total')
      .eq('media_type', cleanType)
      .eq('tmdb_id', cleanId);

    if (error) return { data: baseCounts, error: error.message };

    const result = { ...baseCounts };
    (data || []).forEach((row) => {
      if (row.kind in result) {
        result[row.kind] = Number(row.total) || 0;
      }
    });

    return { data: result, error: null };
  } catch (err) {
    return { data: baseCounts, error: err?.message || 'Failed to fetch reaction counts' };
  }
}

/**
 * Backup Export & Import (Validated JSON against Supabase tables)
 */
export async function exportUserDataFromDB() {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Not authenticated' };

    const [wlRes, ratRes, reactRes] = await Promise.all([
      supabase.from('watchlist').select('media_type, tmdb_id, created_at').eq('user_id', session.user.id),
      supabase.from('ratings').select('media_type, tmdb_id, score, updated_at').eq('user_id', session.user.id),
      supabase.from('reactions').select('media_type, tmdb_id, kind, created_at').eq('user_id', session.user.id),
    ]);

    if (wlRes.error || ratRes.error || reactRes.error) {
      return { data: null, error: 'Failed to fetch database records for backup.' };
    }

    return {
      data: {
        version: '3.0',
        platform: 'Reelist Cinema Explorer',
        exportedAt: new Date().toISOString(),
        watchlist: (wlRes.data || []).map((r) => ({ media_type: r.media_type, tmdb_id: r.tmdb_id })),
        ratings: (ratRes.data || []).map((r) => ({ media_type: r.media_type, tmdb_id: r.tmdb_id, score: r.score })),
        reactions: (reactRes.data || []).map((r) => ({ media_type: r.media_type, tmdb_id: r.tmdb_id, kind: r.kind })),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err?.message || 'Backup generation failed' };
  }
}

export async function importUserDataToDB(payload) {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, error: 'Database unavailable' };
  if (!payload || typeof payload !== 'object') {
    return { success: false, error: 'Invalid backup file structure' };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' };
    const userId = session.user.id;

    // Strict validation
    const validWatchlist = [];
    if (Array.isArray(payload.watchlist)) {
      if (payload.watchlist.length > 2000) {
        return { success: false, error: 'Watchlist exceeds maximum allowed 2,000 items' };
      }
      for (const item of payload.watchlist) {
        const id = sanitizeId(item?.tmdb_id || item);
        const type = sanitizeMediaType(item?.media_type);
        if (id) {
          validWatchlist.push({ user_id: userId, media_type: type, tmdb_id: id });
        }
      }
    }

    const validRatings = [];
    if (Array.isArray(payload.ratings)) {
      if (payload.ratings.length > 2000) {
        return { success: false, error: 'Ratings exceed maximum allowed 2,000 items' };
      }
      for (const item of payload.ratings) {
        const id = sanitizeId(item?.tmdb_id);
        const score = sanitizeScore(item?.score);
        const type = sanitizeMediaType(item?.media_type);
        if (id && score !== null) {
          validRatings.push({ user_id: userId, media_type: type, tmdb_id: id, score });
        }
      }
    }

    const validReactions = [];
    if (Array.isArray(payload.reactions)) {
      if (payload.reactions.length > 2000) {
        return { success: false, error: 'Reactions exceed maximum allowed 2,000 items' };
      }
      for (const item of payload.reactions) {
        const id = sanitizeId(item?.tmdb_id);
        const kind = item?.kind;
        const type = sanitizeMediaType(item?.media_type);
        if (id && ALLOWED_REACTION_KINDS.includes(kind)) {
          validReactions.push({ user_id: userId, media_type: type, tmdb_id: id, kind });
        }
      }
    }

    // Execute upserts
    if (validWatchlist.length > 0) {
      const { error: wlErr } = await supabase
        .from('watchlist')
        .upsert(validWatchlist, { onConflict: 'user_id,media_type,tmdb_id' });
      if (wlErr) return { success: false, error: `Watchlist import error: ${wlErr.message}` };
    }

    if (validRatings.length > 0) {
      const { error: ratErr } = await supabase
        .from('ratings')
        .upsert(validRatings, { onConflict: 'user_id,media_type,tmdb_id' });
      if (ratErr) return { success: false, error: `Ratings import error: ${ratErr.message}` };
    }

    if (validReactions.length > 0) {
      const { error: reactErr } = await supabase
        .from('reactions')
        .upsert(validReactions, { onConflict: 'user_id,media_type,tmdb_id,kind' });
      if (reactErr) return { success: false, error: `Reactions import error: ${reactErr.message}` };
    }

    return {
      success: true,
      counts: {
        watchlist: validWatchlist.length,
        ratings: validRatings.length,
        reactions: validReactions.length,
      },
    };
  } catch (err) {
    return { success: false, error: err?.message || 'Import processing failed' };
  }
}
