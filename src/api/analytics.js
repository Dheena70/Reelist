const ADMIN_USER_KEY = 'reelist_admin_user';
const ANALYTICS_STORAGE_KEY = 'reelist_analytics_live_v3';
const SESSION_VISIT_KEY = 'reelist_session_active';
const REGISTERED_USERS_KEY = 'reelist_registered_users';

// Automatically clean up all legacy dummy/pre-populated analytics data
try {
  localStorage.removeItem('reelist_analytics_data');
  localStorage.removeItem('reelist_analytics_live_v2');
} catch {
  // ignore
}

/**
 * Cryptographically hashes a password using PBKDF2 with SHA-256 (100,000 iterations).
 * Uses window.crypto.subtle for secure hardware-accelerated key derivation.
 */
export async function hashPassword(password, saltHex = null) {
  try {
    const encoder = new TextEncoder();
    let salt;
    if (saltHex && /^[0-9a-fA-F]{32}$/.test(saltHex)) {
      const matches = saltHex.match(/.{1,2}/g) || [];
      salt = new Uint8Array(matches.map((b) => parseInt(b, 16)));
    } else {
      salt = (window.crypto || crypto).getRandomValues(new Uint8Array(16));
    }

    const keyMaterial = await (window.crypto || crypto).subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await (window.crypto || crypto).subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    const hashHex = Array.from(new Uint8Array(derivedBits))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const outSaltHex = Array.from(salt)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `${outSaltHex}:${hashHex}`;
  } catch (err) {
    console.error('Cryptographic hashing error:', err);
    return `fallback:${btoa(unescape(encodeURIComponent(password)))}`;
  }
}

/**
 * Verifies a password against a stored PBKDF2 hash or performs seamless legacy migration.
 */
export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  // Seamless migration for legacy plaintext records
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }

  if (storedHash.startsWith('fallback:')) {
    return storedHash === `fallback:${btoa(unescape(encodeURIComponent(password)))}`;
  }

  const [saltHex, expectedHex] = storedHash.split(':');
  const computed = await hashPassword(password, saltHex);
  const [, computedHex] = computed.split(':');
  return computedHex === expectedHex;
}

/**
 * Enforces strong password complexity policy:
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

function getAdminEmails() {
  const envRaw = import.meta.env.VITE_ADMIN_EMAIL || 'rdheena0509@gmail.com';
  const envList = envRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...envList, 'rdheena0509@gmail.com']));
}

export function isUserAdmin(email) {
  if (!email) return false;
  const clean = String(email).toLowerCase().trim();
  // Strictly check against authorized administrative email list (no wild prefix bypass)
  return getAdminEmails().includes(clean);
}

function sanitizeQuery(query) {
  if (typeof query !== 'string') return '';
  return query
    .slice(0, 100)
    .replace(/[<>{}[\]\\;/]/g, '')
    .trim();
}

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users) {
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore quota
  }
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
    // Sanity purge: If old dummy counts leaked in, force clean
    if (parsed.totalVisitors >= 100 || parsed.totalSearches >= 40) {
      localStorage.removeItem(ANALYTICS_STORAGE_KEY);
      return getDefaultData();
    }
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

export const analytics = {
  recordVisit() {
    // Exclude administrators from audience visitor counter
    if (this.isAdminLoggedIn()) {
      return loadData();
    }

    const data = loadData();
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString();

    // Check if this browser tab/session already registered this visit
    const isNewSession = !sessionStorage.getItem(SESSION_VISIT_KEY);
    if (isNewSession) {
      sessionStorage.setItem(SESSION_VISIT_KEY, 'true');
      data.totalVisitors = (data.totalVisitors || 0) + 1;
      data.dailyVisitors[today] = (data.dailyVisitors[today] || 0) + 1;
    }

    data.lastVisit = now;
    if (!data.firstVisit) data.firstVisit = now;
    saveData(data);
    return data;
  },

  recordSearch(query) {
    // Exclude administrators from audience search telemetry
    if (this.isAdminLoggedIn()) return;
    const clean = sanitizeQuery(query);
    if (!clean) return;
    const data = loadData();
    data.totalSearches = (data.totalSearches || 0) + 1;
    data.recentSearches = [clean, ...(data.recentSearches || []).filter((s) => s !== clean)].slice(0, 8);
    saveData(data);
  },

  recordMovieView() {
    // Exclude administrators from audience film inspection metrics
    if (this.isAdminLoggedIn()) return;
    const data = loadData();
    data.moviesViewed = (data.moviesViewed || 0) + 1;
    saveData(data);
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
    const cleanName = (name || '').trim().slice(0, 100);
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();

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

    const users = getRegisteredUsers();
    if (users.some((u) => u.email === cleanEmail)) {
      return {
        success: false,
        alreadyExists: true,
        error: 'An account with this email already exists. Please Sign In instead.',
      };
    }

    const isAdmin = isUserAdmin(cleanEmail);
    const passwordHash = await hashPassword(cleanPassword);

    const newUserRecord = {
      name: cleanName || (isAdmin ? 'Administrator' : 'Viewer'),
      email: cleanEmail,
      passwordHash,
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUserRecord);
    saveRegisteredUsers(users);

    const sessionUser = {
      name: newUserRecord.name,
      email: newUserRecord.email,
      role: newUserRecord.role,
      authenticatedAt: Date.now(),
    };

    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(sessionUser));
    if (!isAdmin) {
      this.recordVisit();
    }
    return { success: true, user: sessionUser };
  },

  async login(email, password) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    if (!cleanPassword) {
      return { success: false, error: 'Please enter your password.' };
    }

    const users = getRegisteredUsers();
    let foundUser = users.find((u) => u.email === cleanEmail);
    const isAdmin = isUserAdmin(cleanEmail);

    // 1. Admin Verification
    if (isAdmin) {
      const configuredAdminPwd = (import.meta.env.VITE_ADMIN_PASSWORD || '').trim();
      let isValidAdmin = false;

      if (foundUser) {
        isValidAdmin = await verifyPassword(
          cleanPassword,
          foundUser.passwordHash || foundUser.password
        );
      } else if (configuredAdminPwd) {
        isValidAdmin = cleanPassword === configuredAdminPwd;
      }

      if (!isValidAdmin) {
        return { success: false, error: 'Incorrect administrator password.' };
      }

      // Upgrade or seed admin record with secure PBKDF2 hash
      if (!foundUser || foundUser.password || !foundUser.passwordHash) {
        const passwordHash = await hashPassword(cleanPassword);
        if (foundUser) {
          delete foundUser.password;
          foundUser.passwordHash = passwordHash;
          foundUser.role = 'admin';
        } else {
          foundUser = {
            name: 'Administrator',
            email: cleanEmail,
            passwordHash,
            role: 'admin',
            createdAt: new Date().toISOString(),
          };
          users.push(foundUser);
        }
        saveRegisteredUsers(users);
      }

      const adminUser = {
        name: foundUser.name || 'Administrator',
        email: cleanEmail,
        role: 'admin',
        authenticatedAt: Date.now(),
      };
      sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
      return { success: true, user: adminUser };
    }

    // 2. Regular User Verification
    if (!foundUser) {
      return {
        success: false,
        notFound: true,
        error: 'No account found with this email! Please click "Sign Up" below to create an account first.',
      };
    }

    const isValid = await verifyPassword(
      cleanPassword,
      foundUser.passwordHash || foundUser.password
    );

    if (!isValid) {
      return {
        success: false,
        error: 'Incorrect password. Please check your password and try again.',
      };
    }

    // Upgrade legacy plaintext password to secure PBKDF2 hash on successful login
    if (foundUser.password && !foundUser.passwordHash) {
      foundUser.passwordHash = await hashPassword(cleanPassword);
      delete foundUser.password;
      saveRegisteredUsers(users);
    }

    const regularUser = {
      name: foundUser.name || 'Viewer',
      email: foundUser.email,
      role: 'user',
      authenticatedAt: Date.now(),
    };
    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(regularUser));
    this.recordVisit();
    return { success: true, user: regularUser };
  },

  loginGuest() {
    const guestUser = { email: 'Guest Viewer', role: 'guest', authenticatedAt: Date.now() };
    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(guestUser));
    this.recordVisit();
    return { success: true, user: guestUser };
  },

  async loginAdmin(email, password) {
    const res = await this.login(email, password);
    if (res.success && (res.user.role === 'admin' || isUserAdmin(res.user.email))) {
      return { success: true, email: res.user.email };
    }
    return { success: false, error: 'Access denied: This email does not have administrator privileges.' };
  },

  getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(ADMIN_USER_KEY);
      if (!raw) return null;
      const user = JSON.parse(raw);
      // Session expiry validation (24 hours)
      if (user.authenticatedAt && Date.now() - user.authenticatedAt > 86400000) {
        sessionStorage.removeItem(ADMIN_USER_KEY);
        return null;
      }
      if (user && isUserAdmin(user.email)) {
        user.role = 'admin';
      }
      return user;
    } catch {
      return null;
    }
  },

  getAdminUser() {
    const user = this.getCurrentUser();
    return user && (user.role === 'admin' || isUserAdmin(user.email)) ? user : null;
  },

  logout() {
    sessionStorage.removeItem(ADMIN_USER_KEY);
  },

  logoutAdmin() {
    this.logout();
  },

  isAdminLoggedIn() {
    const user = this.getCurrentUser();
    return !!(user && (user.role === 'admin' || isUserAdmin(user.email)));
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
