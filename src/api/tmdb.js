const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// TMDB key can come from a user-saved localStorage value (takes precedence)
// or from a .env file (VITE_TMDB_API_KEY).
const PLACEHOLDER_KEYS = new Set(['', 'your_tmdb_api_key_here']);

function sanitizeKey(key) {
  if (typeof key !== 'string') return '';
  const clean = key.trim().replace(/^["']|["']$/g, '');
  if (!clean) return '';
  // TMDB tokens only contain alphanumeric characters, underscores, hyphens, or dots
  if (!/^[A-Za-z0-9._-]+$/.test(clean) || clean.length > 512) {
    return '';
  }
  return clean;
}

function getApiKey() {
  const localKey = sanitizeKey(localStorage.getItem('tmdb_api_key'));
  if (localKey && !PLACEHOLDER_KEYS.has(localKey)) {
    return localKey;
  }

  const envKey = sanitizeKey(import.meta.env.VITE_TMDB_API_KEY);
  if (envKey && !PLACEHOLDER_KEYS.has(envKey)) {
    return envKey;
  }

  return '';
}

function setApiKey(key) {
  const clean = sanitizeKey(key);
  if (clean) {
    localStorage.setItem('tmdb_api_key', clean);
  } else {
    localStorage.removeItem('tmdb_api_key');
  }
}

function clearApiKey() {
  localStorage.removeItem('tmdb_api_key');
}

async function tmdbFetch(path, params = {}) {
  const key = getApiKey();
  if (!key) {
    const err = new Error('MISSING_API_KEY');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const isBearerToken = key.startsWith('eyJ') || key.length > 60;
  const url = new URL(`${BASE_URL}${path}`);

  if (!isBearerToken) {
    url.searchParams.set('api_key', key);
  }

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const headers = {
    Accept: 'application/json',
  };
  if (isBearerToken) {
    headers.Authorization = `Bearer ${key}`;
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    if (res.status === 401) {
      const err = new Error('INVALID_API_KEY');
      err.code = 'INVALID_API_KEY';
      throw err;
    }
    throw new Error(`TMDB request failed: ${res.status}`);
  }
  return res.json();
}

export function posterUrl(path, size = 'w500') {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path, size = 'w1280') {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function providerLogoUrl(path, size = 'w92') {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export const tmdb = {
  getApiKey,
  setApiKey,
  clearApiKey,
  trending: (window = 'week') => tmdbFetch(`/trending/movie/${window}`),
  search: (query, page = 1) => tmdbFetch('/search/movie', { query, page, include_adult: false }),
  details: (id) => tmdbFetch(`/movie/${id}`, { append_to_response: 'credits,videos,watch/providers,translations' }),
  genres: () => tmdbFetch('/genre/movie/list'),
};
