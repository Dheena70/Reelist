import { getSupabase } from '../lib/supabase.js';

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function isValidUsername(username) {
  if (typeof username !== 'string') return false;
  return USERNAME_REGEX.test(username.trim());
}

export function sanitizeUsername(username) {
  if (typeof username !== 'string') return '';
  return username.trim().toLowerCase();
}

/**
 * Fetch the signed-in user's profile
 */
export async function getMyProfile() {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: null };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: null };

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio, created_at, updated_at')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to fetch profile' };
  }
}

/**
 * Update or create the current user's profile
 */
export async function upsertMyProfile({ username, avatar_url, bio }) {
  const supabase = await getSupabase();
  if (!supabase) return { data: null, error: 'Database unavailable' };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return { data: null, error: 'Not authenticated' };

    const payload = {
      id: session.user.id,
      updated_at: new Date().toISOString(),
    };

    if (username !== undefined) {
      const cleanUsername = sanitizeUsername(username);
      if (!isValidUsername(cleanUsername)) {
        return {
          data: null,
          error: 'Username must be 3-20 characters long and contain only letters, numbers, and underscores.',
        };
      }
      payload.username = cleanUsername;
    }

    if (avatar_url !== undefined) {
      payload.avatar_url = typeof avatar_url === 'string' ? avatar_url.trim() : null;
    }

    if (bio !== undefined) {
      payload.bio = typeof bio === 'string' ? bio.slice(0, 500) : '';
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('id, username, avatar_url, bio, created_at, updated_at')
      .maybeSingle();

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('profiles_username_key')) {
        return { data: null, error: 'This username is already taken. Please choose another one.' };
      }
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err?.message || 'Failed to update profile' };
  }
}

/**
 * Fetch public profile details by list of user IDs
 * Used for author attribution without relying on foreign-key embeds to auth.users
 */
export async function getProfilesByIds(userIds = []) {
  const supabase = await getSupabase();
  if (!supabase) return { data: {}, error: null };

  const validIds = Array.from(new Set(userIds.filter(Boolean)));
  if (validIds.length === 0) {
    return { data: {}, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', validIds);

    if (error) return { data: {}, error: error.message };

    const profileMap = {};
    (data || []).forEach((p) => {
      profileMap[p.id] = {
        username: p.username || 'Anonymous Cinephile',
        avatar_url: p.avatar_url || null,
      };
    });

    return { data: profileMap, error: null };
  } catch (err) {
    return { data: {}, error: err?.message || 'Failed to fetch profiles' };
  }
}
