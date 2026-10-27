import { getSupabase, isSupabaseConfigured, hasPersistedSession } from '../lib/supabase.js';
import { clearLegacyLocalUserData } from './userData.js';

const ANALYTICS_STORAGE_KEY = 'reelist_analytics_live_v3';
const SESSION_VISIT_KEY = 'reelist_session_active';

// Automatically clean up legacy dummy/pre-populated analytics data and old local auth keys
try {
  localStorage.removeItem('reelist_analytics_data');
  localStorage.removeItem('reelist_analytics_live_v2');
  localStorage.removeItem('reelist_admin_user');
  sessionStorage.removeItem('reelist_admin_user');
  localStorage.removeItem('reelist_registered_users');
} catch {
  // ignore storage errors
}

/**
 * Enforces strong password complexity policy (UX guidance):
 * - At least 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special symbol (!@#$%^&*...)
 */
export function validatePasswordComplexity(password) {
  if (!password) {
    return {
      valid: false,
      error: 'Please enter a password.',
      rules: { length: false, upper: false, lower: false, number: false, special: false },
    };
  }

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>_~+=-]/.test(password),
  };

  const valid = rules.length && rules.upper && rules.lower && rules.number && rules.special;

  if (!valid) {
    const missing = [];
    if (!rules.length) missing.push('8+ characters');
    if (!rules.upper) missing.push('1 uppercase letter (A-Z)');
    if (!rules.lower) missing.push('1 lowercase letter (a-z)');
    if (!rules.number) missing.push('1 number (0-9)');
    if (!rules.special) missing.push('1 special character (!@#$%^&*)');

    return {
      valid: false,
      error: `Password must include: ${missing.join(', ')}.`,
      rules,
    };
  }

  return { valid: true, error: '', rules };
}

export function mapSupabaseUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name:
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      (user.email ? user.email.split('@')[0] : 'Viewer'),
    role: 'user',
  };
}

let inMemoryCurrentUser = null;

if (hasPersistedSession()) {
  getSupabase().then((client) => {
    if (!client) return;
    client.auth.getSession().then(({ data }) => {
      inMemoryCurrentUser = mapSupabaseUser(data?.session?.user);
    }).catch(() => {
      inMemoryCurrentUser = null;
    });

    client.auth.onAuthStateChange((_event, session) => {
      inMemoryCurrentUser = mapSupabaseUser(session?.user);
    });
  }).catch(() => {
    inMemoryCurrentUser = null;
  });
}

function sanitizeQuery(query) {
  if (typeof query !== 'string') return '';
  return query
    .slice(0, 100)
    .replace(/[<>{}[\]\\;/]/g, '')
    .trim();
}

function getDefaultData() {
  return {
    totalVisitors: 0,
    dailyVisitors: {},
    totalSearches: 0,
    moviesViewed: 0,
    firstVisit: null,
    lastVisit: null,
    recentSearches: [],
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) return getDefaultData();
    const parsed = JSON.parse(raw);
    return {
      totalVisitors: typeof parsed.totalVisitors === 'number' ? parsed.totalVisitors : 0,
      dailyVisitors: parsed.dailyVisitors && typeof parsed.dailyVisitors === 'object' ? parsed.dailyVisitors : {},
      totalSearches: typeof parsed.totalSearches === 'number' ? parsed.totalSearches : 0,
      moviesViewed: typeof parsed.moviesViewed === 'number' ? parsed.moviesViewed : 0,
      firstVisit: parsed.firstVisit || null,
      lastVisit: parsed.lastVisit || null,
      recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : [],
    };
  } catch {
    return getDefaultData();
  }
}

function saveData(data) {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage quota errors
  }
}

function isTrackingPermitted() {
  try {
    const raw = localStorage.getItem('reelist_cookie_consent');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed.level === 'all';
  } catch {
    return false;
  }
}

export function trackEvent(eventName, eventParams = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && isTrackingPermitted()) {
    try {
      window.gtag('event', eventName, eventParams);
    } catch {
      // Silently ignore Google Analytics dispatch errors
    }
  }
}

export const analytics = {
  recordVisit() {
    if (!isTrackingPermitted()) {
      return loadData();
    }

    const data = loadData();
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const isNewSession = !sessionStorage.getItem(SESSION_VISIT_KEY);
    if (isNewSession) {
      sessionStorage.setItem(SESSION_VISIT_KEY, 'true');
      data.totalVisitors = (data.totalVisitors || 0) + 1;
      data.dailyVisitors[today] = (data.dailyVisitors[today] || 0) + 1;
    }

    data.lastVisit = now;
    if (!data.firstVisit) data.firstVisit = now;
    saveData(data);
    trackEvent('page_view', { page_title: document.title, page_location: window.location.href });
    return data;
  },

  recordSearch(query) {
    if (!isTrackingPermitted()) return;
    const clean = sanitizeQuery(query);
    if (!clean) return;
    const data = loadData();
    data.totalSearches = (data.totalSearches || 0) + 1;
    data.recentSearches = [clean, ...(data.recentSearches || []).filter((s) => s !== clean)].slice(0, 8);
    saveData(data);
    trackEvent('search', { search_term: clean });
  },

  recordMovieView(movieTitle) {
    if (!isTrackingPermitted()) return;
    const data = loadData();
    data.moviesViewed = (data.moviesViewed || 0) + 1;
    saveData(data);
    if (movieTitle) {
      trackEvent('view_item', { item_name: movieTitle });
    }
  },

  getStats() {
    const data = loadData();
    const today = new Date().toISOString().slice(0, 10);
    return {
      totalVisitors: data.totalVisitors || 0,
      todayVisitors: (data.dailyVisitors && data.dailyVisitors[today]) || 0,
      totalSearches: data.totalSearches || 0,
      moviesViewed: data.moviesViewed || 0,
      recentSearches: data.recentSearches || [],
      lastVisit: data.lastVisit,
      firstVisit: data.firstVisit,
    };
  },

  async register(name, email, password) {
    const supabase = await getSupabase();
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, error: 'Accounts are unavailable right now.' };
    }

    const cleanName = (name || '').trim().slice(0, 100);
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPassword = password || '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    const pwCheck = validatePasswordComplexity(cleanPassword);
    if (!pwCheck.valid) {
      return { success: false, error: pwCheck.error };
    }
    if (cleanPassword.length > 128) {
      return { success: false, error: 'Password must not exceed 128 characters.' };
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: { name: cleanName },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        // Friendly message without leaking user presence
        return {
          success: false,
          error: 'Unable to register with these details. If you already have an account, please sign in.',
        };
      }

      const user = mapSupabaseUser(data?.user);
      const needsConfirmation = !data?.session;

      if (!needsConfirmation && user) {
        inMemoryCurrentUser = user;
      }

      return {
        success: true,
        needsConfirmation,
        user,
        message: needsConfirmation
          ? 'Check your email to confirm your account.'
          : 'Account created successfully!',
      };
    } catch {
      return { success: false, error: 'Registration failed. Please try again later.' };
    }
  },

  async login(email, password) {
    const supabase = await getSupabase();
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, error: 'Accounts are unavailable right now.' };
    }

    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPassword = password || '';

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('email not confirmed')) {
          return {
            success: false,
            error: 'Please check your email to confirm your account before signing in.',
          };
        }
        // Never reveal whether an email exists
        return {
          success: false,
          error: 'Invalid email or password. Please check your credentials.',
        };
      }

      const user = mapSupabaseUser(data?.user);
      inMemoryCurrentUser = user;
      clearLegacyLocalUserData();
      this.recordVisit();
      return { success: true, user };
    } catch {
      return { success: false, error: 'Sign in failed. Please try again later.' };
    }
  },

  async resetPassword(email) {
    const supabase = await getSupabase();
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, error: 'Accounts are unavailable right now.' };
    }

    const cleanEmail = (email || '').toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      // Never reveal whether an email exists
      return {
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.',
      };
    } catch {
      return {
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.',
      };
    }
  },

  async updateUserPassword(password) {
    const supabase = await getSupabase();
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, error: 'Accounts are unavailable right now.' };
    }

    const pwCheck = validatePasswordComplexity(password);
    if (!pwCheck.valid) {
      return { success: false, error: pwCheck.error };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { success: false, error: error.message || 'Failed to update password.' };
      }

      const user = mapSupabaseUser(data?.user);
      if (user) inMemoryCurrentUser = user;
      return { success: true, user };
    } catch {
      return { success: false, error: 'Failed to update password. Please try again.' };
    }
  },

  loginGuest() {
    const guestUser = { id: 'guest', name: 'Guest Viewer', email: 'guest@reelist.app', role: 'guest' };
    inMemoryCurrentUser = guestUser;
    this.recordVisit();
    return { success: true, user: guestUser };
  },

  async loginAdmin() {
    return { success: false, error: 'Administrator access is not supported in client-only mode.' };
  },

  getCurrentUser() {
    return inMemoryCurrentUser;
  },

  getAdminUser() {
    return null;
  },

  async logout() {
    inMemoryCurrentUser = null;
    const supabase = await getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore sign out network errors
      }
    }
  },

  logoutAdmin() {
    this.logout();
  },

  isAdminLoggedIn() {
    return false;
  },

  onAuthStateChange(callback) {
    let unsub = () => {};
    let isCancelled = false;
    getSupabase().then((client) => {
      if (isCancelled || !client) return;
      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        const user = mapSupabaseUser(session?.user);
        inMemoryCurrentUser = user;
        if (typeof callback === 'function') {
          callback(event, session, user);
        }
      });
      unsub = () => subscription?.unsubscribe();
    }).catch(() => {});

    return () => {
      isCancelled = true;
      unsub();
    };
  },

  resetStats() {
    try {
      localStorage.removeItem('reelist_analytics_data');
      localStorage.removeItem('reelist_analytics_live_v2');
      localStorage.removeItem(ANALYTICS_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_VISIT_KEY);
    } catch {
      // ignore
    }
    const fresh = getDefaultData();
    saveData(fresh);
    return fresh;
  },
};
