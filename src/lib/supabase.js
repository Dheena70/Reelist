const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'undefined' &&
  supabaseAnonKey !== 'undefined'
);

export function hasPersistedSession() {
  try {
    if (typeof window !== 'undefined' && window.location && window.location.hash) {
      if (/#.*(access_token|refresh_token|type=recovery)/.test(window.location.hash)) {
        return true;
      }
    }
    if (typeof localStorage === 'undefined') return false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && /^sb-.*-auth-token$/.test(key)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

let clientPromise = null;

export async function getSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const configured = Boolean(url && key && url !== 'undefined' && key !== 'undefined');
  if (!configured) return null;

  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      return createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    });
  }
  return clientPromise;
}

export function _resetSupabaseClientPromiseForTesting() {
  clientPromise = null;
}
