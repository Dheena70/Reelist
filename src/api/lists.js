import { getSupabase } from '../lib/supabase.js';
import { sanitizeId, sanitizeMediaType } from './userData.js';
import { getProfilesByIds } from './profiles.js';

export function sanitizeTitle(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, 100);
}

export function sanitizeDescription(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().slice(0, 500);
}

/**
 * Fetch lists for a specific user (or signed-in user if userId is null)
 */
export async function getUserLists(userId = null) {
  const supabase = await getSupabase();
  if (!supabase) return { data: [], error: null };

  try {
    let targetUserId = userId;
    if (!targetUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      targetUserId = session?.user?.id || null;
    }
    if (!targetUserId) return { data: [], error: null };

    const { data, error } = await supabase
      .from('lists')
      .select('id, user_id, title, description, is_private, created_at, updated_at')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: data || [], error: null };
  } catch (err) {
    return { data: [], error: err?.message || 'Failed to fetch user lists' };
  }
}

/**
 * Fetch public community lists
 */
export async function getPublicLists(limit = 20) {
  const supabase = await getSupabase();
  if (!supabase) return { data: [], error: null };

  try {
    const { data: lists, error } = await supabase
      .from('lists')
      .select('id, user_id, title, description, is_private, created_at, updated_at')
      .eq('is_private', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { data: [], error: error.message };
    if (!lists || lists.length === 0) return { data: [], error: null };

    // Secondary query on profiles (no FK embed)
    const authorIds = Array.from(new Set(lists.map((l) => l.user_id)));
    const { data: profileMap } = await getProfilesByIds(authorIds);

    const enriched = lists.map((l) => {
      const author = profileMap?.[l.user_id] || { username: 'Cinephile' };
      return {
        ...l,
        username: author.username,
      };
    });

    return { data: enriched, error: null };
  } catch (err) {
    return { data: [], error: err?.message || 'Failed to fetch public lists' };
  }
}

/**
 * Fetch a single list and its items
 */
export async function getListDetails(listId) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  if (!listId) return { data: null, error: 'Missing list ID' };

  try {
    const { data: list, error: listError } = await supabase
      .from('lists')
      .select('id, user_id, title, description, is_private, created_at, updated_at')
      .eq('id', listId)
      .maybeSingle();

    if (listError) return { data: null, error: listError.message };
    if (!list) return { data: null, error: 'List not found or private' };

    // Fetch items
    const { data: items, error: itemsError } = await supabase
      .from('list_items')
      .select('id, list_id, media_type, tmdb_id, notes, order_index, added_at')
      .eq('list_id', listId)
      .order('order_index', { ascending: true })
      .order('added_at', { ascending: false });

    if (itemsError) return { data: null, error: itemsError.message };

    // Author profile
    const { data: profileMap } = await getProfilesByIds([list.user_id]);
    const author = profileMap?.[list.user_id] || { username: 'Cinephile' };

    return {
      data: {
        ...list,
        username: author.username,
        items: items || [],
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to fetch list details' };
  }
}

/**
 * Create a new custom list
 */
export async function createList({ title, description = '', isPrivate = false }) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };

  const cleanTitle = sanitizeTitle(title);
  if (!cleanTitle) return { data: null, error: 'List title is required (up to 100 characters).' };

  const cleanDesc = sanitizeDescription(description);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('lists')
      .insert({
        user_id: session.user.id,
        title: cleanTitle,
        description: cleanDesc,
        is_private: Boolean(isPrivate),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, user_id, title, description, is_private, created_at, updated_at')
      .maybeSingle();

    if (error) {
      if (error.message?.includes('List limit reached')) {
        return { data: null, error: 'List limit reached (maximum 50 lists per account).' };
      }
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to create list' };
  }
}

/**
 * Update an existing list
 */
export async function updateList({ listId, title, description, isPrivate }) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  if (!listId) return { data: null, error: 'Missing list ID' };

  const payload = {
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) {
    const cleanTitle = sanitizeTitle(title);
    if (!cleanTitle) return { data: null, error: 'List title is required.' };
    payload.title = cleanTitle;
  }
  if (description !== undefined) {
    payload.description = sanitizeDescription(description);
  }
  if (isPrivate !== undefined) {
    payload.is_private = Boolean(isPrivate);
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('lists')
      .update(payload)
      .eq('id', listId)
      .eq('user_id', session.user.id)
      .select('id, user_id, title, description, is_private, created_at, updated_at')
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to update list' };
  }
}

/**
 * Delete a list
 */
export async function deleteList(listId) {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, error: 'Database unavailable' };
  if (!listId) return { success: false, error: 'Missing list ID' };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', session.user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err?.message || 'Failed to delete list' };
  }
}

/**
 * Add a movie or TV show to a custom list
 */
export async function addToList({ listId, mediaType = 'movie', tmdbId, notes = '' }) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };
  if (!listId) return { data: null, error: 'Missing list ID' };

  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { data: null, error: 'Invalid movie ID' };
  const cleanType = sanitizeMediaType(mediaType);
  const cleanNotes = typeof notes === 'string' ? notes.slice(0, 300) : '';

  try {
    const { data, error } = await supabase
      .from('list_items')
      .upsert(
        {
          list_id: listId,
          media_type: cleanType,
          tmdb_id: cleanId,
          notes: cleanNotes,
          added_at: new Date().toISOString(),
        },
        { onConflict: 'list_id,media_type,tmdb_id' }
      )
      .select('id, list_id, media_type, tmdb_id, notes, added_at')
      .maybeSingle();

    if (error) {
      if (error.message?.includes('List item limit reached')) {
        return { data: null, error: 'List item limit reached (maximum 500 items per list).' };
      }
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to add item to list' };
  }
}

/**
 * Fetch all user lists indicating whether this specific title is already added
 */
export async function getUserListsWithMembership(mediaType = 'movie', tmdbId) {
  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { data: [], error: 'Invalid movie ID' };
  const cleanType = sanitizeMediaType(mediaType);

  const supabase = await getSupabase();
  if (!supabase) return { data: [], error: null };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: [], error: null };

    const { data: lists, error: listErr } = await supabase
      .from('lists')
      .select('id, user_id, title, description, is_private, created_at, updated_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (listErr) return { data: [], error: listErr.message };
    if (!lists || lists.length === 0) return { data: [], error: null };

    const listIds = lists.map((l) => l.id);
    const { data: items, error: itemsErr } = await supabase
      .from('list_items')
      .select('list_id')
      .in('list_id', listIds)
      .eq('media_type', cleanType)
      .eq('tmdb_id', cleanId);

    if (itemsErr) {
      return { data: lists.map((l) => ({ ...l, containsMovie: false })), error: null };
    }

    const containingSet = new Set((items || []).map((i) => i.list_id));
    const result = lists.map((l) => ({
      ...l,
      containsMovie: containingSet.has(l.id),
    }));

    return { data: result, error: null };
  } catch (err) {
    return { data: [], error: err?.message || 'Failed to fetch user lists' };
  }
}

/**
 * Remove an item from a custom list
 */
export async function removeFromList({ listId, mediaType = 'movie', tmdbId }) {
  const supabase = await getSupabase();
  if (!supabase) return { success: false, error: 'Database unavailable' };
  if (!listId) return { success: false, error: 'Missing list ID' };

  const cleanId = sanitizeId(tmdbId);
  if (!cleanId) return { success: false, error: 'Invalid movie ID' };
  const cleanType = sanitizeMediaType(mediaType);

  try {
    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('list_id', listId)
      .eq('media_type', cleanType)
      .eq('tmdb_id', cleanId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err?.message || 'Failed to remove from list' };
  }
}
