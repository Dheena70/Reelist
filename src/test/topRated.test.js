import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}));

const mockSupabaseClient = {
  from: (...args) => mockFrom(...args),
};

vi.mock('../lib/supabase.js', () => ({
  isSupabaseConfigured: true,
  getSupabase: vi.fn(() => Promise.resolve(mockSupabaseClient)),
  hasPersistedSession: vi.fn(() => false),
}));

vi.mock('../utils/tmdbCache.js', () => ({
  tmdbCache: {
    get: vi.fn(() => null),
    set: vi.fn(),
  },
}));

import { getReelistTopRated } from '../api/userData.js';
import { tmdb } from '../api/tmdb.js';

describe('Top Rated Charts & 25-Vote Threshold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Reelist Community Top Rated (rating_stats)', () => {
    it('strictly applies minVotes >= 25 threshold to avoid manipulation', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [
            { media_type: 'movie', tmdb_id: 101, avg_score: 9.4, votes: 42 },
            { media_type: 'movie', tmdb_id: 202, avg_score: 8.9, votes: 30 },
          ],
          error: null,
        }),
      };
      mockFrom.mockReturnValue(mockQuery);

      const res = await getReelistTopRated(20, 25);
      expect(mockFrom).toHaveBeenCalledWith('rating_stats');
      expect(mockQuery.gte).toHaveBeenCalledWith('votes', 25);
      expect(res.data).toHaveLength(2);
      expect(res.data[0].tmdb_id).toBe(101);
      expect(res.data[0].avg_score).toBe(9.4);
      expect(res.data[0].votes).toBe(42);
    });

    it('returns empty list when no titles have reached 25 votes', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      mockFrom.mockReturnValue(mockQuery);

      const res = await getReelistTopRated(20, 25);
      expect(mockQuery.gte).toHaveBeenCalledWith('votes', 25);
      expect(res.data).toEqual([]);
      expect(res.error).toBeNull();
    });

    it('orders by avg_score desc, then votes desc', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };
      mockFrom.mockReturnValue(mockQuery);

      await getReelistTopRated(20, 25);
      expect(mockQuery.order).toHaveBeenCalledWith('avg_score', { ascending: false });
      expect(mockQuery.order).toHaveBeenCalledWith('votes', { ascending: false });
    });
  });

  describe('TMDB Top Rated endpoints', () => {
    beforeEach(() => {
      globalThis.fetch = vi.fn();
    });

    it('fetches top rated movies with region=IN', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          page: 1,
          results: [{ id: 550, title: 'Fight Club', vote_average: 8.4 }],
        }),
      });

      const data = await tmdb.topRatedMovies(1, 'IN');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('movie%2Ftop_rated'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('region=IN'),
        expect.any(Object)
      );
      expect(data.results[0].title).toBe('Fight Club');
    });

    it('fetches top rated TV shows and sets media_type=tv', async () => {
      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          page: 1,
          results: [{ id: 1399, name: 'Game of Thrones', vote_average: 8.5 }],
        }),
      });

      const data = await tmdb.topRatedTv(1);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('tv%2Ftop_rated'),
        expect.any(Object)
      );
      expect(data.results[0].media_type).toBe('tv');
      expect(data.results[0].title).toBe('Game of Thrones');
    });
  });
});
