import { describe, it, expect } from 'vitest';
import { validatePasswordComplexity } from '../api/analytics.js';

describe('password policy', () => {
  it('rejects weak', () => expect(validatePasswordComplexity('abc').valid).toBe(false));
  it('accepts strong', () => expect(validatePasswordComplexity('Abcdef1!').valid).toBe(true));
});
