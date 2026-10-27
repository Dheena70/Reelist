import { describe, it, expect } from 'vitest';
import {
  validateTmdbPath,
  sanitizePath,
  filterTmdbQueryParams,
  ALLOWED_PATH_PREFIXES,
  ALLOWED_QUERY_PARAMS,
} from '../utils/tmdbValidation.js';

describe('TMDB Path Validation', () => {
  it('allows all authorized prefixes', () => {
    ALLOWED_PATH_PREFIXES.forEach((prefix) => {
      expect(validateTmdbPath(`${prefix}test_123`)).toBe(true);
    });
  });

  it('allows leading slashes and handles them safely', () => {
    expect(validateTmdbPath('/trending/movie/week')).toBe(true);
    expect(validateTmdbPath('///movie/now_playing')).toBe(true);
    expect(validateTmdbPath('/discover/movie')).toBe(true);
  });

  it('allows valid alphanumeric, hyphen, underscore, and slash path segments', () => {
    expect(validateTmdbPath('movie/12345')).toBe(true);
    expect(validateTmdbPath('tv/9876/season/1')).toBe(true);
    expect(validateTmdbPath('person/54321/combined_credits')).toBe(true);
    expect(validateTmdbPath('genre/movie/list')).toBe(true);
    expect(validateTmdbPath('search/multi')).toBe(true);
  });

  it('blocks path traversal and disallowed characters', () => {
    expect(validateTmdbPath('movie/../../etc/passwd')).toBe(false); // contains dots
    expect(validateTmdbPath('movie/123?api_key=evil')).toBe(false); // contains ?
    expect(validateTmdbPath('movie/123&foo=bar')).toBe(false); // contains &
    expect(validateTmdbPath('movie/123%20test')).toBe(false); // contains %
    expect(validateTmdbPath('movie/123;rm')).toBe(false); // contains semicolon
    expect(validateTmdbPath('movie/123#frag')).toBe(false); // contains hash
  });

  it('blocks unauthorized endpoint prefixes (SSRF / account prevention)', () => {
    expect(validateTmdbPath('account/123')).toBe(false);
    expect(validateTmdbPath('authentication/token/new')).toBe(false);
    expect(validateTmdbPath('configuration')).toBe(false);
    expect(validateTmdbPath('credit/123')).toBe(false);
  });

  it('blocks empty or non-string inputs', () => {
    expect(validateTmdbPath('')).toBe(false);
    expect(validateTmdbPath('   ')).toBe(false);
    expect(validateTmdbPath(null)).toBe(false);
    expect(validateTmdbPath(undefined)).toBe(false);
    expect(validateTmdbPath(12345)).toBe(false);
  });

  it('sanitizes leading and trailing slashes correctly', () => {
    expect(sanitizePath('/movie/123')).toBe('movie/123');
    expect(sanitizePath('///trending/movie')).toBe('trending/movie');
    expect(sanitizePath('tv/456')).toBe('tv/456');
    expect(sanitizePath(null)).toBe('');
  });
});

describe('TMDB Query Parameter Allowlist & Pollution Prevention', () => {
  it('forwards only allowlisted query parameters', () => {
    const input = {
      path: 'movie/now_playing',
      region: 'IN',
      page: '2',
      language: 'en-US',
      query: 'inception',
      with_original_language: 'ta',
      'primary_release_date.gte': '2026-09-01',
      'primary_release_date.lte': '2026-10-01',
      sort_by: 'popularity.desc',
      append_to_response: 'videos,credits',
      include_adult: 'false',
      with_genres: '28',
      year: '2026',
      // Disallowed parameters that must be dropped:
      api_key: 'hacker_key',
      token: 'secret',
      auth: 'bypass',
      unauthorized_flag: '123',
    };

    const result = filterTmdbQueryParams(input);
    expect(result.valid).toBe(true);
    expect(result.params).toEqual({
      region: 'IN',
      page: '2',
      language: 'en-US',
      query: 'inception',
      with_original_language: 'ta',
      'primary_release_date.gte': '2026-09-01',
      'primary_release_date.lte': '2026-10-01',
      sort_by: 'popularity.desc',
      append_to_response: 'videos,credits',
      include_adult: 'false',
      with_genres: '28',
      year: '2026',
    });
    expect(result.params.api_key).toBeUndefined();
    expect(result.params.token).toBeUndefined();
    expect(result.params.path).toBeUndefined();
  });

  it('rejects HTTP Parameter Pollution where a query param is an array', () => {
    const polluted = {
      region: ['IN', 'US'],
      query: 'avatar',
    };
    const result = filterTmdbQueryParams(polluted);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Multiple values not permitted');
  });

  it('handles null, undefined, or empty query objects gracefully', () => {
    expect(filterTmdbQueryParams(null)).toEqual({ valid: true, params: {} });
    expect(filterTmdbQueryParams(undefined)).toEqual({ valid: true, params: {} });
    expect(filterTmdbQueryParams({})).toEqual({ valid: true, params: {} });
  });

  it('all defined ALLOWED_QUERY_PARAMS are present in the allowlist set', () => {
    const expected = [
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
    ];
    expected.forEach((param) => {
      expect(ALLOWED_QUERY_PARAMS.has(param)).toBe(true);
    });
  });
});
