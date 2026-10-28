import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ArtistFilmographyChart from '../components/ArtistFilmographyChart.jsx';

describe('ArtistFilmographyChart Component', () => {
  const sampleFilmography = [
    {
      id: 1,
      title: 'Nayagan',
      year: '1987',
      vote_average: 8.7,
      vote_count: 500,
      popularity: 25.5,
    },
    {
      id: 2,
      title: 'Anbe Sivam',
      year: '2003',
      vote_average: 8.4,
      vote_count: 350,
      popularity: 30.1,
    },
    {
      id: 3,
      title: 'Vikram',
      year: '2022',
      vote_average: 7.9,
      vote_count: 1200,
      popularity: 88.0,
    },
    {
      id: 4,
      title: 'Experimental Film',
      year: '2010',
      vote_average: 5.5,
      vote_count: 80,
      popularity: 12.0,
    },
  ];

  it('renders career analytics and metrics', () => {
    render(<ArtistFilmographyChart filmography={sampleFilmography} />);

    // Average rating: (8.7 + 8.4 + 7.9 + 5.5) / 4 = 30.5 / 4 = 7.6
    expect(screen.getByText('★ 7.6')).toBeDefined();
    expect(screen.getByText(/Based on 4 catalog titles/)).toBeDefined();
    expect(screen.getByText(/Nayagan \(1987\)/)).toBeDefined();
  });

  it('renders rating brackets and responds to click', () => {
    render(<ArtistFilmographyChart filmography={sampleFilmography} />);

    expect(screen.getByText(/High Acclaim/i)).toBeDefined();
    expect(screen.getByText(/Critical Hits/i)).toBeDefined();

    // Click on 8.0 - 8.9 bracket to expand
    const acclaimedBracket = screen.getByText(/High Acclaim/i).closest('div');
    if (acclaimedBracket) {
      fireEvent.click(acclaimedBracket);
    }
  });

  it('switches between distribution and timeline views', () => {
    render(<ArtistFilmographyChart filmography={sampleFilmography} />);

    const timelineTab = screen.getByRole('button', { name: 'Timeline Chart' });
    fireEvent.click(timelineTab);

    expect(timelineTab.style.background).toBe('rgb(245, 197, 24)');
  });

  it('returns null when filmography has 0 rated films', () => {
    const { container } = render(<ArtistFilmographyChart filmography={[{ id: 9, title: 'Unrated', vote_average: 0 }]} />);
    expect(container.firstChild).toBeNull();
  });
});
