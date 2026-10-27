import { describe, it, expect, beforeEach } from 'vitest';
import { validatePasswordComplexity, analytics } from '../api/analytics.js';

describe('password policy', () => {
  it('rejects weak', () => expect(validatePasswordComplexity('abc').valid).toBe(false));
  it('accepts strong', () => expect(validatePasswordComplexity('Abcdef1!').valid).toBe(true));
});

describe('importUserData', () => {
  beforeEach(() => localStorage.clear());
  it('blocks non-reaction keys', () => {
    analytics.importUserData({ reactions: { reelist_registered_users: '[]', reelist_reactions_1: '{}' } });
    expect(localStorage.getItem('reelist_registered_users')).toBeNull();
    expect(localStorage.getItem('reelist_reactions_1')).toBe('{}');
  });
});
