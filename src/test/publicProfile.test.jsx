import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PublicProfileModal from '../components/PublicProfileModal.jsx';

vi.mock('../api/profiles.js', () => ({
  getProfileByUsername: vi.fn(),
}));

vi.mock('../api/reviews.js', () => ({
  getUserReviews: vi.fn(),
}));

vi.mock('../api/lists.js', () => ({
  getUserPublicLists: vi.fn(),
}));

vi.mock('../api/tmdb.js', () => ({
  tmdb: {
    details: vi.fn(() => Promise.resolve({
      id: 550,
      title: 'Fight Club',
      poster_path: '/poster.jpg',
      release_date: '1999-10-15',
    })),
  },
  posterUrl: vi.fn((path) => `https://image.tmdb.org/t/p/w92${path}`),
}));

import { getProfileByUsername } from '../api/profiles.js';
import { getUserReviews } from '../api/reviews.js';
import { getUserPublicLists } from '../api/lists.js';

describe('PublicProfileModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    getProfileByUsername.mockReturnValue(new Promise(() => {})); // pending
    render(
      <PublicProfileModal
        username="cinematophile"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText(/Loading cinephile profile/i)).toBeDefined();
  });

  it('renders "User Not Found" when username does not exist', async () => {
    getProfileByUsername.mockResolvedValue({ data: null, error: 'Profile not found' });

    render(
      <PublicProfileModal
        username="nonexistent_user"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/User Not Found/i)).toBeDefined();
      expect(screen.getByText(/@nonexistent_user does not exist/i)).toBeDefined();
    });
  });

  it('renders public profile details, bio, reviews, and never exposes email', async () => {
    getProfileByUsername.mockResolvedValue({
      data: {
        id: 'user-uuid-99',
        username: 'cinephile99',
        bio: 'Cinema purist. 35mm enthusiast.',
        created_at: '2026-01-15T00:00:00Z',
      },
      error: null,
    });

    getUserReviews.mockResolvedValue({
      data: [
        {
          id: 'rev-1',
          user_id: 'user-uuid-99',
          media_type: 'movie',
          tmdb_id: 550,
          rating: 10,
          headline: 'Masterpiece of modern cinema',
          content: 'Unmatched direction and David Fincher style.',
          is_spoiler: false,
          created_at: '2026-02-10T12:00:00Z',
        },
      ],
      count: 1,
      error: null,
    });

    getUserPublicLists.mockResolvedValue({
      data: [
        {
          id: 'list-1',
          title: 'Top 90s Noir Thrillers',
          description: 'Dark cinema list',
          is_private: false,
        },
      ],
      error: null,
    });

    const { container } = render(
      <PublicProfileModal
        username="cinephile99"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('@cinephile99')).toBeDefined();
      expect(screen.getByText('Cinema purist. 35mm enthusiast.')).toBeDefined();
      expect(screen.getByText(/Member since January 2026/i)).toBeDefined();
    });

    // Verify reviews are visible
    expect(screen.getByText('Masterpiece of modern cinema')).toBeDefined();
    expect(screen.getByText(/10\/10/)).toBeDefined();

    // Verify STRICT privacy: email string should NEVER be anywhere in rendered HTML
    expect(container.innerHTML).not.toContain('@example.com');
    expect(container.innerHTML).not.toContain('email');
  });

  it('toggles spoiler reviews when user clicks reveal', async () => {
    getProfileByUsername.mockResolvedValue({
      data: {
        id: 'user-uuid-99',
        username: 'cinephile99',
        bio: '',
        created_at: '2026-01-15T00:00:00Z',
      },
      error: null,
    });

    getUserReviews.mockResolvedValue({
      data: [
        {
          id: 'rev-spoiler',
          user_id: 'user-uuid-99',
          media_type: 'movie',
          tmdb_id: 550,
          rating: 9,
          headline: 'Huge plot twist',
          content: 'Tyler Durden is actually the narrator himself!',
          is_spoiler: true,
          created_at: '2026-02-10T12:00:00Z',
        },
      ],
      count: 1,
      error: null,
    });

    getUserPublicLists.mockResolvedValue({ data: [], error: null });

    render(
      <PublicProfileModal
        username="cinephile99"
        onClose={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Huge plot twist')).toBeDefined();
    });

    // Spoiler content should be hidden initially
    expect(screen.queryByText(/Tyler Durden is actually/i)).toBeNull();

    // Click spoiler reveal button
    const revealBtn = screen.getByText(/Contains Spoilers — Click to reveal/i);
    fireEvent.click(revealBtn);

    // Spoiler content should now be visible
    expect(screen.getByText(/Tyler Durden is actually the narrator himself!/i)).toBeDefined();
  });
});
