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

vi.mock('../api/profiles.js', () => ({
  getProfilesByIds: vi.fn((ids) => {
    const map = {};
    ids.forEach((id) => {
      map[id] = { username: `user_${id}`, avatar_url: null };
    });
    return Promise.resolve({ data: map, error: null });
  }),
}));

import {
  sanitizeHeadline,
  sanitizeContent,
  getMovieReviews,
  createReview,
  voteReview,
  reportReview,
} from '../api/reviews.js';

describe('Reviews Data Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'reviewer-user-1' } } },
    });
  });

  describe('Sanitization', () => {
    it('sanitizes headline length', () => {
      expect(sanitizeHeadline('   Masterpiece Cinema   ')).toBe('Masterpiece Cinema');
      expect(sanitizeHeadline('A'.repeat(150)).length).toBe(120);
      expect(sanitizeHeadline(null)).toBe('');
    });

    it('sanitizes content length', () => {
      expect(sanitizeContent('   Great movie!   ')).toBe('Great movie!');
      expect(sanitizeContent(null)).toBe('');
    });
  });

  describe('getMovieReviews', () => {
    it('returns empty array when no reviews exist', async () => {
      const order = vi.fn().mockResolvedValue({ data: [], error: null });
      const eq2 = vi.fn().mockReturnValue({ order });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const select = vi.fn().mockReturnValue({ eq: eq1 });
      mockFrom.mockReturnValue({ select });

      const res = await getMovieReviews('movie', 550);
      expect(res.data).toEqual([]);
      expect(res.error).toBeNull();
    });

    it('enriches reviews with usernames via secondary profile query and view counts', async () => {
      const sampleReviews = [
        {
          id: 'rev-101',
          user_id: 'user-abc',
          media_type: 'movie',
          tmdb_id: 550,
          rating: 9,
          headline: 'Incredible experience',
          content: 'Loved every minute of it.',
          is_spoiler: false,
          created_at: '2026-10-28T00:00:00Z',
        },
      ];

      mockFrom.mockImplementation((table) => {
        if (table === 'reviews') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({ data: sampleReviews, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'review_vote_counts') {
          return {
            select: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: [{ review_id: 'rev-101', helpful: 12, not_helpful: 1 }],
                error: null,
              }),
            }),
          };
        }
        if (table === 'review_votes') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockResolvedValue({
                  data: [{ review_id: 'rev-101', helpful: true }],
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const res = await getMovieReviews('movie', 550);
      expect(res.data.length).toBe(1);
      const item = res.data[0];
      expect(item.headline).toBe('Incredible experience');
      expect(item.username).toBe('user_user-abc'); // from mocked getProfilesByIds
      expect(item.helpful_count).toBe(12);
      expect(item.not_helpful_count).toBe(1);
      expect(item.my_vote).toBe('helpful');
    });
  });

  describe('createReview', () => {
    it('validates headline and content', async () => {
      const res1 = await createReview({ mediaType: 'movie', tmdbId: 550, headline: '', content: 'hello' });
      expect(res1.error).toContain('Headline is required');

      const res2 = await createReview({ mediaType: 'movie', tmdbId: 550, headline: 'Great', content: '' });
      expect(res2.error).toContain('Review content cannot be empty');
    });

    it('submits review for authenticated user', async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: { id: 'new-rev-1', headline: 'Awesome' },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ maybeSingle });
      const insert = vi.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      const res = await createReview({
        mediaType: 'movie',
        tmdbId: 550,
        rating: 9,
        headline: 'Awesome',
        content: 'Must watch film in theaters.',
        isSpoiler: false,
      });

      expect(mockFrom).toHaveBeenCalledWith('reviews');
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'reviewer-user-1',
          tmdb_id: 550,
          rating: 9,
          headline: 'Awesome',
          is_spoiler: false,
        })
      );
      expect(res.data.id).toBe('new-rev-1');
    });
  });

  describe('voteReview', () => {
    it('toggles off if clicking identical vote', async () => {
      // Existing vote is helpful: true
      const maybeSingle = vi.fn().mockResolvedValue({
        data: { helpful: true },
        error: null,
      });
      const eq2 = vi.fn().mockReturnValue({ maybeSingle });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const select = vi.fn().mockReturnValue({ eq: eq1 });

      const delEq2 = vi.fn().mockResolvedValue({ error: null });
      const delEq1 = vi.fn().mockReturnValue({ eq: delEq2 });
      const deleteMock = vi.fn().mockReturnValue({ eq: delEq1 });

      mockFrom.mockReturnValue({
        select,
        delete: deleteMock,
      });

      const res = await voteReview({ reviewId: 'rev-1', helpful: true });
      expect(deleteMock).toHaveBeenCalled();
      expect(res.data.myVote).toBeNull();
    });

    it('upserts vote if voting new status', async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });
      const eq2 = vi.fn().mockReturnValue({ maybeSingle });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const select = vi.fn().mockReturnValue({ eq: eq1 });

      const upsertMock = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockReturnValue({
        select,
        upsert: upsertMock,
      });

      const res = await voteReview({ reviewId: 'rev-1', helpful: true });
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          review_id: 'rev-1',
          user_id: 'reviewer-user-1',
          helpful: true,
        }),
        { onConflict: 'review_id,user_id' }
      );
      expect(res.data.myVote).toBe('helpful');
    });
  });

  describe('reportReview', () => {
    it('validates minimum reason length', async () => {
      const res = await reportReview({ reviewId: 'rev-1', reason: 'no' });
      expect(res.success).toBe(false);
      expect(res.error).toContain('min 3 characters');
    });

    it('inserts report into review_reports table', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });
      mockFrom.mockReturnValue({ insert: insertMock });

      const res = await reportReview({ reviewId: 'rev-1', reason: 'Contains hate speech' });
      expect(mockFrom).toHaveBeenCalledWith('review_reports');
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          review_id: 'rev-1',
          reporter_user_id: 'reviewer-user-1',
          reason: 'Contains hate speech',
        })
      );
      expect(res.success).toBe(true);
    });
  });
});
