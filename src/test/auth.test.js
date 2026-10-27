import { describe, it, expect, beforeEach, vi } from 'vitest';

const {
  mockSignUp,
  mockSignInWithPassword,
  mockResetPasswordForEmail,
  mockUpdateUser,
  mockOnAuthStateChange,
  mockGetSession,
} = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockResetPasswordForEmail: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockOnAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  mockGetSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
}));

const mockSupabaseClient = {
  auth: {
    signUp: mockSignUp,
    signInWithPassword: mockSignInWithPassword,
    signOut: vi.fn(),
    resetPasswordForEmail: mockResetPasswordForEmail,
    updateUser: mockUpdateUser,
    onAuthStateChange: mockOnAuthStateChange,
    getSession: mockGetSession,
  },
};

vi.mock('../lib/supabase.js', () => ({
  isSupabaseConfigured: true,
  getSupabase: vi.fn(() => Promise.resolve(mockSupabaseClient)),
  hasPersistedSession: vi.fn(() => false),
}));

import { analytics } from '../api/analytics.js';

describe('Supabase Auth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('signs up successfully with email confirmation required', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: {
        user: { id: 'u-1', email: 'fan@reelist.app', user_metadata: { name: 'Cinema Fan' } },
        session: null,
      },
      error: null,
    });

    const res = await analytics.register('Cinema Fan', 'fan@reelist.app', 'StrongPass1!');
    expect(res.success).toBe(true);
    expect(res.needsConfirmation).toBe(true);
    expect(res.message).toBe('Check your email to confirm your account.');
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'fan@reelist.app',
      password: 'StrongPass1!',
      options: {
        data: { name: 'Cinema Fan' },
        emailRedirectTo: expect.any(String),
      },
    });
  });

  it('signs in successfully with email and password', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: 'u-1', email: 'fan@reelist.app', user_metadata: { name: 'Cinema Fan' } },
        session: { access_token: 'mock-token' },
      },
      error: null,
    });

    const res = await analytics.login('fan@reelist.app', 'StrongPass1!');
    expect(res.success).toBe(true);
    expect(res.user).toEqual({
      id: 'u-1',
      email: 'fan@reelist.app',
      name: 'Cinema Fan',
      role: 'user',
    });
  });

  it('sends password reset link without leaking email existence', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({
      data: {},
      error: null,
    });

    const res = await analytics.resetPassword('fan@reelist.app');
    expect(res.success).toBe(true);
    expect(res.message).toBe('If an account exists for this email, a password reset link has been sent.');
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      'fan@reelist.app',
      expect.objectContaining({ redirectTo: expect.any(String) })
    );
  });

  it('handles invalid credentials on sign in with a friendly error', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: {},
      error: { message: 'Invalid login credentials' },
    });

    const res = await analytics.login('fan@reelist.app', 'WrongPass1!');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Invalid email or password. Please check your credentials.');
  });

  it('updates password during PASSWORD_RECOVERY flow', async () => {
    mockUpdateUser.mockResolvedValueOnce({
      data: {
        user: { id: 'u-1', email: 'fan@reelist.app' },
      },
      error: null,
    });

    const res = await analytics.updateUserPassword('NewStrongPass1!');
    expect(res.success).toBe(true);
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewStrongPass1!' });
  });
});
