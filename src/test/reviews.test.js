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
  updateReview,
  voteReview,
  reportReview,
  getUserReviews,
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

    it('writes through rating to ratings table for single source of truth', async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: { id: 'new-rev-2', headline: 'Masterpiece', rating: 10 },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ maybeSingle });
      const insert = vi.fn().mockReturnValue({ select });
      const upsert = vi.fn().mockReturnValue({ select });

      mockFrom.mockImplementation((table) => {
        if (table === 'reviews') return { insert };
        if (table === 'ratings') return { upsert };
        return { select };
      });

      await createReview({
        mediaType: 'movie',
        tmdbId: 550,
        rating: 10,
        headline: 'Masterpiece',
        content: 'Unbelievable classic film.',
        isSpoiler: false,
      });

      expect(mockFrom).toHaveBeenCalledWith('ratings');
      const res = await createReview({
        mediaType: 'movie',
        tmdbId: 550,
        rating: 10,
        headline: 'Masterpiece',
        content: 'Unbelievable classic film.',
        isSpoiler: false,
      });
      expect(res.warning).toBeNull();
    });

    it('returns warning when write-through fails but saves the review', async () => {
      const maybeSingleReview = vi.fn().mockResolvedValue({
        data: { id: 'new-rev-3', headline: 'Good Movie', rating: 8 },
        error: null,
      });
      const selectReview = vi.fn().mockReturnValue({ maybeSingle: maybeSingleReview });
      const insert = vi.fn().mockReturnValue({ select: selectReview });

      const maybeSingleRating = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database ratings lock timeout' },
      });
      const selectRating = vi.fn().mockReturnValue({ maybeSingle: maybeSingleRating });
      const upsert = vi.fn().mockReturnValue({ select: selectRating });

      mockFrom.mockImplementation((table) => {
        if (table === 'reviews') return { insert };
        if (table === 'ratings') return { upsert };
        return {};
      });

      const res = await createReview({
        mediaType: 'movie',
        tmdbId: 550,
        rating: 8,
        headline: 'Good Movie',
        content: 'Solid performances all around.',
      });

      expect(res.data.id).toBe('new-rev-3');
      expect(res.error).toBeNull();
      expect(res.warning).toBe(
        'Review saved, but your rating could not be synced. Try rating the title again.'
      );
    });

    it('returns friendly message when daily review limit is reached', async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Daily review limit reached (20)' },
      });
      const select = vi.fn().mockReturnValue({ maybeSingle });
      const insert = vi.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      const res = await createReview({
        mediaType: 'movie',
        tmdbId: 550,
        rating: 9,
        headline: 'Too many reviews',
        content: 'Testing throttle trigger error.',
      });

      expect(res.data).toBeNull();
      expect(res.error).toContain('Daily review limit reached');
    });
  });

  describe('updateReview', () => {
    it('validates headline and content', async () => {
      const res1 = await updateReview({ reviewId: 'rev-1', headline: '', content: 'Some text' });
      expect(res1.error).toContain('Headline is required');

      const res2 = await updateReview({ reviewId: 'rev-1', headline: 'Title', content: '' });
      expect(res2.error).toContain('Review content cannot be empty');
    });

    it('updates review and writes through updated rating', async () => {
      const maybeSingleReview = vi.fn().mockResolvedValue({
        data: { id: 'rev-1', media_type: 'movie', tmdb_id: 550, rating: 9, headline: 'Updated Headline' },
        error: null,
      });
      const selectReview = vi.fn().mockReturnValue({ maybeSingle: maybeSingleReview });
      const eqUser = vi.fn().mockReturnValue({ select: selectReview });
      const eqId = vi.fn().mockReturnValue({ eq: eqUser });
      const update = vi.fn().mockReturnValue({ eq: eqId });

      const maybeSingleRating = vi.fn().mockResolvedValue({
        data: { tmdb_id: 550, score: 9 },
        error: null,
      });
      const selectRating = vi.fn().mockReturnValue({ maybeSingle: maybeSingleRating });
      const upsert = vi.fn().mockReturnValue({ select: selectRating });

      mockFrom.mockImplementation((table) => {
        if (table === 'reviews') return { update };
        if (table === 'ratings') return { upsert };
        return {};
      });

      const res = await updateReview({
        reviewId: 'rev-1',
        rating: 9,
        headline: 'Updated Headline',
        content: 'Even better on rewatch.',
        isSpoiler: false,
      });

      expect(mockFrom).toHaveBeenCalledWith('reviews');
      expect(mockFrom).toHaveBeenCalledWith('ratings');
      expect(res.data.id).toBe('rev-1');
      expect(res.warning).toBeNull();
    });

    it('returns warning when rating write-through fails in updateReview', async () => {
      const maybeSingleReview = vi.fn().mockResolvedValue({
        data: { id: 'rev-1', media_type: 'movie', tmdb_id: 550, rating: 7, headline: 'Updated Headline' },
        error: null,
      });
      const selectReview = vi.fn().mockReturnValue({ maybeSingle: maybeSingleReview });
      const eqUser = vi.fn().mockReturnValue({ select: selectReview });
      const eqId = vi.fn().mockReturnValue({ eq: eqUser });
      const update = vi.fn().mockReturnValue({ eq: eqId });

      const maybeSingleRating = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Write lock failure' },
      });
      const selectRating = vi.fn().mockReturnValue({ maybeSingle: maybeSingleRating });
      const upsert = vi.fn().mockReturnValue({ select: selectRating });

      mockFrom.mockImplementation((table) => {
        if (table === 'reviews') return { update };
        if (table === 'ratings') return { upsert };
        return {};
      });

      const res = await updateReview({
        reviewId: 'rev-1',
        rating: 7,
        headline: 'Updated Headline',
        content: 'Changed my mind on rewatch.',
      });

      expect(res.data.id).toBe('rev-1');
      expect(res.error).toBeNull();
      expect(res.warning).toBe(
        'Review saved, but your rating could not be synced. Try rating the title again.'
      );
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

  describe('getUserReviews', () => {
    it('returns error if userId is missing', async () => {
      const res = await getUserReviews(null);
      expect(res.error).toBe('User ID required');
      expect(res.data).toEqual([]);
    });

    it('fetches reviews authored by a specific user with exact count', async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [{ id: 'rev-1', headline: 'Top Tier' }],
          count: 1,
          error: null,
        }),
      };
      mockFrom.mockReturnValue(mockQuery);

      const res = await getUserReviews('user-123', 10);
      expect(mockFrom).toHaveBeenCalledWith('reviews');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(res.data).toHaveLength(1);
      expect(res.count).toBe(1);
    });
  });
});

