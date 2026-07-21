const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// TMDB key can come from a .env file (VITE_TMDB_API_KEY) or be entered
// by the user at runtime and stored in localStorage as a fallback.
function getApiKey() {
  return import.meta.env.VITE_TMDB_API_KEY || localStorage.getItem('tmdb_api_key') || '';
}

function setApiKey(key) {
  localStorage.setItem('tmdb_api_key', key);
}

async function tmdbFetch(path, params = {}) {
  const key = getApiKey();
  if (!key) {
    const err = new Error('MISSING_API_KEY');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', key);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString());
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

export const tmdb = {
  getApiKey,
  setApiKey,
  trending: (window = 'week') => tmdbFetch(`/trending/movie/${window}`),
  search: (query, page = 1) => tmdbFetch('/search/movie', { query, page, include_adult: false }),
  details: (id) => tmdbFetch(`/movie/${id}`, { append_to_response: 'credits' }),
  genres: () => tmdbFetch('/genre/movie/list'),
};
