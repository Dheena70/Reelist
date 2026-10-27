// TMDB Path Validation Helper
// Validates path against allowed safe prefixes and characters to prevent SSRF / API abuse

export const ALLOWED_PATH_PREFIXES = [
  'trending/',
  'movie/',
  'tv/',
  'discover/',
  'search/',
  'person/',
  'genre/',
];

export function sanitizePath(rawPath) {
  if (typeof rawPath !== 'string') return '';
  return rawPath.trim().replace(/^\/+/, '');
}

export function validateTmdbPath(rawPath) {
  const clean = sanitizePath(rawPath);
  if (!clean) return false;
  if (!/^[a-z0-9/_-]+$/i.test(clean)) return false;

  const lower = clean.toLowerCase();
  return ALLOWED_PATH_PREFIXES.some((prefix) => lower.startsWith(prefix));
}
