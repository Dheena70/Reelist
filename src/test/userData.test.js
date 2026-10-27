import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockFrom, mockFunctionsInvoke, mockGetSession } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockFunctionsInvoke: vi.fn(),
  mockGetSession: vi.fn(),
}));

vi.mock('../lib/supabase.js', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: (...args) => mockFrom(...args),
    functions: {
      invoke: (...args) => mockFunctionsInvoke(...args),
    },
    auth: {
      getSession: (...args) => mockGetSession(...args),
      signOut: vi.fn(),
    },
  },
}));

import {
  setRating,
  toggleReaction,
  importUserDataToDB,
  sanitizeId,
  sanitizeScore,
} from '../api/userData.js';

describe('UserData Data Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'test-user-uuid-1' } } },
    });
  });

  describe('setRating validation', () => {
    it('validates and clamps score between 1 and 10', async () => {
      expect(sanitizeScore(8)).toBe(8);
      expect(sanitizeScore(15)).toBe(10);
      expect(sanitizeScore(-3)).toBe(1);
      expect(sanitizeScore('invalid')).toBeNull();
    });

    it('rejects invalid movie IDs', async () => {
      expect(sanitizeId(0)).toBeNull();
      expect(sanitizeId(-15)).toBeNull();
      expect(sanitizeId('abc')).toBeNull();
      expect(sanitizeId(12345)).toBe(12345);

      const res = await setRating('movie', -99, 8);
      expect(res.error).toBe('Invalid movie ID');
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('saves a valid rating via upsert', async () => {
      const mockUpsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { tmdb_id: 857598, media_type: 'movie', score: 9 },
            error: null,
          }),
        }),
      });

      mockFrom.mockReturnValue({ upsert: mockUpsert });

      const res = await setRating('movie', 857598, 9);
      expect(res.error).toBeNull();
      expect(res.data).toEqual({ tmdb_id: 857598, media_type: 'movie', score: 9 });
      expect(mockFrom).toHaveBeenCalledWith('ratings');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-uuid-1',
          media_type: 'movie',
          tmdb_id: 857598,
          score: 9,
        }),
        { onConflict: 'user_id,media_type,tmdb_id' }
      );
    });
  });

  describe('toggleReaction add and remove', () => {
    it('rejects unknown reaction kinds', async () => {
      const res = await toggleReaction('movie', 857598, 'dislike');
      expect(res.error).toBe('Invalid reaction kind');
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('inserts reaction when not active', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq4 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      const mockInsert = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockReturnValue({
        select: mockSelect,
        insert: mockInsert,
      });

      const res = await toggleReaction('movie', 857598, 'heart');
      expect(res.error).toBeNull();
      expect(res.data).toEqual({ kind: 'heart', active: true });
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-uuid-1',
          media_type: 'movie',
          tmdb_id: 857598,
          kind: 'heart',
        })
      );
    });

    it('deletes reaction when already active', async () => {
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: { kind: 'heart' }, error: null });
      const mockEq4 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockEq3 = vi.fn().mockReturnValue({ eq: mockEq4 });
      const mockEq2 = vi.fn().mockReturnValue({ eq: mockEq3 });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });

      const mockDelEq4 = vi.fn().mockResolvedValue({ error: null });
      const mockDelEq3 = vi.fn().mockReturnValue({ eq: mockDelEq4 });
      const mockDelEq2 = vi.fn().mockReturnValue({ eq: mockDelEq3 });
      const mockDelEq1 = vi.fn().mockReturnValue({ eq: mockDelEq2 });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockDelEq1 });

      mockFrom.mockReturnValue({
        select: mockSelect,
        delete: mockDelete,
      });

      const res = await toggleReaction('movie', 857598, 'heart');
      expect(res.error).toBeNull();
      expect(res.data).toEqual({ kind: 'heart', active: false });
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('importUserDataToDB validation', () => {
    it('rejects invalid payload structures', async () => {
      const res = await importUserDataToDB('not-an-object');
      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid backup file structure');
    });

    it('rejects oversized lists (> 2000 items)', async () => {
      const hugeList = Array.from({ length: 2001 }, (_, i) => ({ tmdb_id: i + 1 }));
      const res = await importUserDataToDB({ watchlist: hugeList });
      expect(res.success).toBe(false);
      expect(res.error).toContain('exceeds maximum allowed 2,000 items');
    });

    it('validates and upserts clean records into tables', async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue({ upsert: mockUpsert });

      const payload = {
        watchlist: [{ media_type: 'movie', tmdb_id: 101 }, { tmdb_id: -999 }], // -999 filtered
        ratings: [{ media_type: 'movie', tmdb_id: 101, score: 9 }],
        reactions: [{ media_type: 'movie', tmdb_id: 101, kind: 'clap' }, { tmdb_id: 101, kind: 'fake' }], // fake filtered
      };

      const res = await importUserDataToDB(payload);
      expect(res.success).toBe(true);
      expect(res.counts).toEqual({
        watchlist: 1,
        ratings: 1,
        reactions: 1,
      });
      expect(mockFrom).toHaveBeenCalledWith('watchlist');
      expect(mockFrom).toHaveBeenCalledWith('ratings');
      expect(mockFrom).toHaveBeenCalledWith('reactions');
    });
  });

  describe('delete account flow', () => {
    it('calls supabase edge function delete-account', async () => {
      mockFunctionsInvoke.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const { supabase } = await import('../lib/supabase.js');
      const { data, error } = await supabase.functions.invoke('delete-account');

      expect(error).toBeNull();
      expect(data).toEqual({ success: true });
      expect(mockFunctionsInvoke).toHaveBeenCalledWith('delete-account');
    });
  });
});
