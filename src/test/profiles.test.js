import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockFrom, mockGetSession } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetSession: vi.fn(),
}));

const mockSupabaseClient = {
  from: (...args) => mockFrom(...args),
  auth: {
    getSession: (...args) => mockGetSession(...args),
  },
};

vi.mock('../lib/supabase.js', () => ({
  isSupabaseConfigured: true,
  getSupabase: vi.fn(() => Promise.resolve(mockSupabaseClient)),
  hasPersistedSession: vi.fn(() => false),
}));

import {
  isValidUsername,
  sanitizeUsername,
  getMyProfile,
  upsertMyProfile,
  getProfilesByIds,
} from '../api/profiles.js';

describe('Profiles Data Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-123' } } },
    });
  });

  describe('Username validation', () => {
    it('validates correct usernames', () => {
      expect(isValidUsername('cinephile_99')).toBe(true);
      expect(isValidUsername('dheena')).toBe(true);
      expect(isValidUsername('user_name_1')).toBe(true);
    });

    it('rejects invalid usernames', () => {
      expect(isValidUsername('ab')).toBe(false); // too short
      expect(isValidUsername('a'.repeat(25))).toBe(false); // too long
      expect(isValidUsername('user name')).toBe(false); // spaces
      expect(isValidUsername('user@domain')).toBe(false); // special char
      expect(isValidUsername(null)).toBe(false);
      expect(isValidUsername('')).toBe(false);
    });

    it('sanitizes usernames to lowercase and trimmed', () => {
      expect(sanitizeUsername('  Cinephile99  ')).toBe('cinephile99');
      expect(sanitizeUsername(null)).toBe('');
    });
  });

  describe('getMyProfile', () => {
    it('returns null when user is not authenticated', async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: null } });
      const res = await getMyProfile();
      expect(res.data).toBeNull();
      expect(res.error).toBeNull();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('queries profiles table for authenticated user', async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: { id: 'test-user-123', username: 'moviefan' },
        error: null,
      });
      const eq = vi.fn().mockReturnValue({ maybeSingle });
      const select = vi.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const res = await getMyProfile();
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(select).toHaveBeenCalled();
      expect(eq).toHaveBeenCalledWith('id', 'test-user-123');
      expect(res.data.username).toBe('moviefan');
    });
  });

  describe('upsertMyProfile', () => {
    it('rejects invalid username before making db query', async () => {
      const res = await upsertMyProfile({ username: 'bad!' });
      expect(res.error).toContain('Username must be 3-20 characters long');
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('upserts profile and returns updated record', async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: { id: 'test-user-123', username: 'valid_user', bio: 'Film buff' },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ maybeSingle });
      const upsert = vi.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ upsert });

      const res = await upsertMyProfile({ username: 'valid_user', bio: 'Film buff' });
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-user-123',
          username: 'valid_user',
          bio: 'Film buff',
        }),
        { onConflict: 'id' }
      );
      expect(res.data.username).toBe('valid_user');
      expect(res.error).toBeNull();
    });

    it('handles duplicate username collision error gracefully', async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' },
      });
      const select = vi.fn().mockReturnValue({ maybeSingle });
      const upsert = vi.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ upsert });

      const res = await upsertMyProfile({ username: 'taken_name' });
      expect(res.data).toBeNull();
      expect(res.error).toContain('This username is already taken');
    });
  });

  describe('getProfilesByIds (secondary profile query for reviewer usernames)', () => {
    it('returns empty map for empty userIds', async () => {
      const res = await getProfilesByIds([]);
      expect(res.data).toEqual({});
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('batches IDs and returns map keyed by user id', async () => {
      const inMock = vi.fn().mockResolvedValue({
        data: [
          { id: 'user-1', username: 'rajini_fan', avatar_url: null },
          { id: 'user-2', username: 'kamal_fan', avatar_url: 'https://example.com/avatar.jpg' },
        ],
        error: null,
      });
      const select = vi.fn().mockReturnValue({ in: inMock });
      mockFrom.mockReturnValue({ select });

      const res = await getProfilesByIds(['user-1', 'user-2', 'user-1']);
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(inMock).toHaveBeenCalledWith('id', ['user-1', 'user-2']);
      expect(res.data['user-1'].username).toBe('rajini_fan');
      expect(res.data['user-2'].username).toBe('kamal_fan');
      expect(res.data['user-2'].avatar_url).toBe('https://example.com/avatar.jpg');
    });
  });
});
