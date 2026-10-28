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
      map[id] = { username: `cinephile_${id}` };
    });
    return Promise.resolve({ data: map, error: null });
  }),
}));

import {
  sanitizeTitle,
  sanitizeDescription,
  getUserLists,
  getPublicLists,
  createList,
  addToList,
  deleteList,
} from '../api/lists.js';

describe('Custom Lists Data Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'list-owner-uuid' } } },
    });
  });

  describe('Sanitization', () => {
    it('sanitizes list title length', () => {
      expect(sanitizeTitle('   Top 10 Tamil Thrillers   ')).toBe('Top 10 Tamil Thrillers');
      expect(sanitizeTitle('T'.repeat(150)).length).toBe(100);
      expect(sanitizeTitle(null)).toBe('');
    });

    it('sanitizes list description length', () => {
      expect(sanitizeDescription('   My favorite cinema picks   ')).toBe('My favorite cinema picks');
      expect(sanitizeDescription('D'.repeat(600)).length).toBe(500);
      expect(sanitizeDescription(null)).toBe('');
    });
  });

  describe('createList', () => {
    it('validates title is required', async () => {
      const res = await createList({ title: '   ' });
      expect(res.data).toBeNull();
      expect(res.error).toContain('List title is required');
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('inserts list with privacy flag for authenticated user', async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: { id: 'list-1', title: 'Rewatchable Classics', is_private: true },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ maybeSingle });
      const insert = vi.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      const res = await createList({
        title: 'Rewatchable Classics',
        description: 'Movies I can watch anytime',
        isPrivate: true,
      });

      expect(mockFrom).toHaveBeenCalledWith('lists');
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'list-owner-uuid',
          title: 'Rewatchable Classics',
          is_private: true,
        })
      );
      expect(res.data.id).toBe('list-1');
    });
  });

  describe('getUserLists', () => {
    it('queries lists table for user', async () => {
      const order = vi.fn().mockResolvedValue({
        data: [{ id: 'list-1', title: 'Favorites' }],
        error: null,
      });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const res = await getUserLists();
      expect(mockFrom).toHaveBeenCalledWith('lists');
      expect(eq).toHaveBeenCalledWith('user_id', 'list-owner-uuid');
      expect(res.data.length).toBe(1);
    });
  });

  describe('getPublicLists', () => {
    it('fetches non-private lists and enriches with author profile via secondary query', async () => {
      const limitMock = vi.fn().mockResolvedValue({
        data: [
          { id: 'pub-list-1', user_id: 'u1', title: 'Mani Ratnam Magic', is_private: false },
        ],
        error: null,
      });
      const order = vi.fn().mockReturnValue({ limit: limitMock });
      const eq = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const res = await getPublicLists();
      expect(mockFrom).toHaveBeenCalledWith('lists');
      expect(eq).toHaveBeenCalledWith('is_private', false);
      expect(res.data.length).toBe(1);
      expect(res.data[0].username).toBe('cinephile_u1');
    });
  });

  describe('addToList', () => {
    it('rejects invalid movie ID', async () => {
      const res = await addToList({ listId: 'list-1', tmdbId: 0 });
      expect(res.error).toBe('Invalid movie ID');
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('upserts item into list_items table', async () => {
      const maybeSingle = vi.fn().mockResolvedValue({
        data: { id: 'item-1', tmdb_id: 550 },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ maybeSingle });
      const upsert = vi.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ upsert });

      const res = await addToList({ listId: 'list-1', tmdbId: 550, notes: 'Must see' });
      expect(mockFrom).toHaveBeenCalledWith('list_items');
      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          list_id: 'list-1',
          media_type: 'movie',
          tmdb_id: 550,
          notes: 'Must see',
        }),
        { onConflict: 'list_id,media_type,tmdb_id' }
      );
      expect(res.data.id).toBe('item-1');
    });
  });

  describe('deleteList', () => {
    it('deletes list for owner', async () => {
      const eq2 = vi.fn().mockResolvedValue({ error: null });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const del = vi.fn().mockReturnValue({ eq: eq1 });
      mockFrom.mockReturnValue({ delete: del });

      const res = await deleteList('list-to-delete');
      expect(mockFrom).toHaveBeenCalledWith('lists');
      expect(eq1).toHaveBeenCalledWith('id', 'list-to-delete');
      expect(eq2).toHaveBeenCalledWith('user_id', 'list-owner-uuid');
      expect(res.success).toBe(true);
    });
  });
});
