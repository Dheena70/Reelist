import { describe, it, expect } from 'vitest';
import { validateTmdbPath, sanitizePath, ALLOWED_PATH_PREFIXES } from '../utils/tmdbValidation.js';

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
