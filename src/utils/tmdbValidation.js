// TMDB Path & Query Validation Helper
// Validates path against allowed safe prefixes and characters to prevent SSRF / API abuse
// Allowlist query parameters and enforce strict validation against HTTP Parameter Pollution

export const ALLOWED_PATH_PREFIXES = [
  'trending/',
  'movie/',
  'tv/',
  'discover/',
  'search/',
  'person/',
  'genre/',
];

export const ALLOWED_QUERY_PARAMS = new Set([
  'language',
  'page',
  'region',
  'query',
  'with_original_language',
  'primary_release_date.gte',
  'primary_release_date.lte',
  'sort_by',
  'append_to_response',
  'include_adult',
  'with_genres',
  'year',
]);

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

/**
 * Validates and filters incoming query parameters for TMDB proxying.
 * - If any query parameter value is an array, rejects with { valid: false, error: ... }
 * - Discards unlisted parameters (e.g. api_key, internal tokens, arbitrary flags)
 * - Returns { valid: true, params: { ... } } with only allowlisted keys
 */
export function filterTmdbQueryParams(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'object') {
    return { valid: true, params: {} };
  }

  const cleanParams = {};

  for (const [key, value] of Object.entries(rawQuery)) {
    if (key === 'path') continue;

    if (Array.isArray(value)) {
      return {
        valid: false,
        error: `Multiple values not permitted for query parameter: ${key}`,
      };
    }

    if (!ALLOWED_QUERY_PARAMS.has(key)) {
      continue;
    }

    if (value !== undefined && value !== null && value !== '') {
      cleanParams[key] = String(value);
    }
  }

  return { valid: true, params: cleanParams };
}
