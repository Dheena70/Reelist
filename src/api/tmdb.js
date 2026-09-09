const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

// TMDB key can come from a user-saved localStorage value (takes precedence)
// or from a .env file (VITE_TMDB_API_KEY).
const PLACEHOLDER_KEYS = new Set(['', 'your_tmdb_api_key_here']);

function sanitizeKey(key) {
  if (typeof key !== 'string') return '';
  const clean = key.trim().replace(/^["']|["']$/g, '');
  if (!clean) return '';
  // TMDB tokens only contain alphanumeric characters, underscores, hyphens, or dots
  if (!/^[A-Za-z0-9._-]+$/.test(clean) || clean.length > 512) {
    return '';
  }
  return clean;
}

function getApiKey() {
  const localKey = sanitizeKey(localStorage.getItem('tmdb_api_key'));
  if (localKey && !PLACEHOLDER_KEYS.has(localKey)) {
    return localKey;
  }

  const envKey = sanitizeKey(import.meta.env.VITE_TMDB_API_KEY);
  if (envKey && !PLACEHOLDER_KEYS.has(envKey)) {
    return envKey;
  }

  return '';
}

function setApiKey(key) {
  const clean = sanitizeKey(key);
  if (clean) {
    localStorage.setItem('tmdb_api_key', clean);
  } else {
    localStorage.removeItem('tmdb_api_key');
  }
}

function clearApiKey() {
  localStorage.removeItem('tmdb_api_key');
}

async function tmdbFetch(path, params = {}) {
  const key = getApiKey();
  if (!key) {
    const err = new Error('MISSING_API_KEY');
    err.code = 'MISSING_API_KEY';
    throw err;
  }

  const isBearerToken = key.startsWith('eyJ') || key.length > 60;
  const url = new URL(`${BASE_URL}${path}`);

  if (!isBearerToken) {
    url.searchParams.set('api_key', key);
  }

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const headers = {
    Accept: 'application/json',
  };
  if (isBearerToken) {
    headers.Authorization = `Bearer ${key}`;
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    if (res.status === 401) {
      const err = new Error('INVALID_API_KEY');
      err.code = 'INVALID_API_KEY';
      throw err;
    }
    throw new Error(`TMDB request failed: ${res.status}`);
  }
  return res.json();
}

export function posterUrl(path, size = 'w500') {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path, size = 'w1280') {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function providerLogoUrl(path, size = 'w92') {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function profileUrl(path, size = 'w185') {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export const THEATRICAL_NOW_PLAYING = [
  {
    id: 969681,
    title: 'Spider-Man: Brand New Day',
    release_date: '2026-07-29',
    release_label: 'IN THEATERS',
    vote_average: 8.0,
    vote_count: 3200,
    poster_path: '/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg',
    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    overview: 'Peter Parker begins a fresh chapter fighting street-level crime in New York City with zero memory from his old allies, facing ruthless new syndicates.',
    genre_ids: [28, 12, 878],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 653346,
    title: 'Kingdom of the Planet of the Apes',
    release_date: '2024-05-08',
    release_label: 'GLOBAL BLOCKBUSTER',
    vote_average: 7.1,
    vote_count: 3100,
    poster_path: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    overview: 'Several generations following Caesar\'s reign, apes are now the dominant species and live harmoniously while humans have been reduced to living in the shadows.',
    genre_ids: [28, 12, 878],
    trailerKey: 'XtfiYmZxCu8',
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    release_date: '2024-06-11',
    release_label: 'BOX OFFICE RECORD',
    vote_average: 7.6,
    vote_count: 4800,
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/stKGOm8ffToIgIlSY9AmODFu02.jpg',
    overview: 'Teenager Riley\'s mind headquarters undergoes a sudden demolition to make room for unexpected new Emotions: Anxiety, Envy, Ennui, and Embarrassment.',
    genre_ids: [16, 10751, 35, 12],
    trailerKey: 'LEjhY15eCx0',
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    release_date: '2023-07-19',
    release_label: 'ACADEMY AWARD WINNER',
    vote_average: 8.1,
    vote_count: 8900,
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/rLb2cw6PxLwqEvPdChjw115UN2q.jpg',
    overview: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II and the harrowing moral fallout that followed.',
    genre_ids: [18, 36],
    trailerKey: 'uYPbbksJxIg',
  },
  {
    id: 299536,
    title: 'Avengers: Infinity War',
    release_date: '2018-04-25',
    release_label: 'EPIC SAGA',
    vote_average: 8.3,
    vote_count: 29000,
    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdrop_path: '/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg',
    overview: 'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.',
    genre_ids: [12, 28, 878],
    trailerKey: '6ZfuNTqbHE8',
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    release_date: '2024-07-24',
    release_label: 'IN THEATERS',
    vote_average: 7.7,
    vote_count: 5900,
    poster_path: '/8cdWjvZQUExUUTzyp4tmnmTShaX.jpg',
    backdrop_path: '/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him, until the TVA pulls him into an existential mission alongside Wolverine.',
    genre_ids: [28, 35, 878],
    trailerKey: '73_1biulkYk',
  },
  {
    id: 1204680,
    title: 'Coyote vs. Acme',
    release_date: '2026-08-20',
    release_label: 'IN THEATERS NOW',
    vote_average: 7.7,
    vote_count: 980,
    poster_path: '/orkLtdgMGiO9rTVMqJ1kKwrnup1.jpg',
    backdrop_path: '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',
    overview: 'After all the ACME products fail him in his pursuit of the Road Runner, Wile E. Coyote hires a down-and-out human attorney to take on the ACME Corporation.',
    genre_ids: [35, 16, 10751],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 1368337,
    title: 'The Odyssey',
    release_date: '2026-07-15',
    release_label: 'NOW SCREENING',
    vote_average: 8.0,
    vote_count: 1100,
    poster_path: '/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    overview: 'A breathtaking epic retelling of Odysseus\' perilous ten-year journey home across mythological waters following the fall of Troy.',
    genre_ids: [12, 18, 14],
    trailerKey: 'TcMBFSGVi1c',
  },
  {
    id: 1288445,
    title: 'Mutiny',
    release_date: '2026-08-19',
    release_label: 'IN CINEMAS',
    vote_average: 6.4,
    vote_count: 750,
    poster_path: '/pu2VxGlpGwffOx292w18b1tv96j.jpg',
    backdrop_path: '/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    overview: 'When his billionaire industrialist boss is murdered in front of him, an undercover bodyguard is framed for the crime and plunged into a global conspiracy.',
    genre_ids: [28, 53],
    trailerKey: 'coGmsT2iMls',
  },
  {
    id: 1375646,
    title: 'Colony',
    release_date: '2026-05-21',
    release_label: 'SEP 2026',
    vote_average: 8.1,
    vote_count: 850,
    poster_path: '/tN799oUR0f1gUKDYdMNrDaY7I51.jpg',
    backdrop_path: '/x4bi289iWkR7U8oUfJmgG22Xf6f.jpg',
    overview: 'Humanity\'s first off-world colony faces unprecedented subterranean phenomena that threaten to destabilize planetary terraforming.',
    genre_ids: [878, 9648],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 1386315,
    title: 'The Runner',
    release_date: '2026-09-03',
    release_label: 'SEP 03',
    vote_average: 6.7,
    vote_count: 620,
    poster_path: '/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg',
    backdrop_path: '/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    overview: 'A high-stakes courier must sprint across a quarantined city sector delivering an antidote before a deadly curfew falls.',
    genre_ids: [28, 53],
    trailerKey: 'wUn05hdkhSk',
  },
  {
    id: 1108427,
    title: 'Moana',
    release_date: '2026-07-08',
    release_label: 'FAMILY CINEMA',
    vote_average: 6.8,
    vote_count: 1400,
    poster_path: '/gaet1xQ2nxrG0V1Ep9T20ZMNEIC.jpg',
    backdrop_path: '/stKGOm8ffToIgIlSY9AmODFu02.jpg',
    overview: 'A live-action celebration of the Polynesian islands and mythology following an adventurous wayfinder and her journey with demigod Maui.',
    genre_ids: [12, 10751, 14],
    trailerKey: 'd9MyW72ELq0',
  }
];

export const THEATRICAL_COMING_SOON = [
  {
    id: 1204680,
    title: 'Coyote vs. Acme',
    release_date: '2026-08-20',
    release_label: 'AUG 20',
    duration: '1:45',
    vote_average: 7.7,
    vote_count: 980,
    poster_path: '/orkLtdgMGiO9rTVMqJ1kKwrnup1.jpg',
    backdrop_path: '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',
    overview: 'After all the ACME products fail him in his pursuit of the Road Runner, Wile E. Coyote hires a down-and-out human attorney to take on the ACME Corporation.',
    genre_ids: [35, 16, 10751],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 1288445,
    title: 'Mutiny',
    release_date: '2026-08-19',
    release_label: 'AUG 19',
    duration: '2:12',
    vote_average: 6.4,
    vote_count: 750,
    poster_path: '/pu2VxGlpGwffOx292w18b1tv96j.jpg',
    backdrop_path: '/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    overview: 'When his billionaire industrialist boss is murdered in front of him, an undercover bodyguard is framed for the crime and plunged into a global conspiracy.',
    genre_ids: [28, 53],
    trailerKey: 'coGmsT2iMls',
  },
  {
    id: 1375646,
    title: 'Colony',
    release_date: '2026-05-21',
    release_label: 'MAY 21',
    duration: '2:25',
    vote_average: 8.1,
    vote_count: 850,
    poster_path: '/tN799oUR0f1gUKDYdMNrDaY7I51.jpg',
    backdrop_path: '/x4bi289iWkR7U8oUfJmgG22Xf6f.jpg',
    overview: 'Humanity\'s first off-world colony faces unprecedented subterranean phenomena that threaten to destabilize planetary terraforming.',
    genre_ids: [878, 9648],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 1386315,
    title: 'The Runner',
    release_date: '2026-09-03',
    release_label: 'SEP 03',
    duration: '2:04',
    vote_average: 6.7,
    vote_count: 620,
    poster_path: '/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg',
    backdrop_path: '/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    overview: 'A high-stakes courier must sprint across a quarantined city sector delivering an antidote before a deadly curfew falls.',
    genre_ids: [28, 53],
    trailerKey: 'wUn05hdkhSk',
  },
  {
    id: 1101412,
    title: 'Fall 2: Deadpoint',
    release_date: '2026-09-01',
    release_label: 'SEP 01',
    duration: '1:58',
    vote_average: 6.9,
    vote_count: 430,
    poster_path: '/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg',
    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    overview: 'High-altitude climbers find themselves trapped atop an abandoned offshore radio tower with severe weather rapidly approaching.',
    genre_ids: [53, 28],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 1275779,
    title: 'Disclosure Day',
    release_date: '2026-06-10',
    release_label: 'JUN 10',
    duration: '2:15',
    vote_average: 7.5,
    vote_count: 890,
    poster_path: '/AnJ8IQJI23hNpYXVNaythu061Ru.jpg',
    backdrop_path: '/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    overview: 'World governments announce coordinated declassification hearings regarding extraterrestrial contact, sending shockwaves across geopolitical factions.',
    genre_ids: [878, 18],
    trailerKey: 'TcMBFSGVi1c',
  }
];

// Curated franchise continuations & sequels mapping
export const FRANCHISE_COLLECTIONS = {
  // Sardar Franchise
  sardar: {
    collectionName: 'Sardar Spy Franchise',
    parts: [
      {
        id: 1200401,
        title: 'Sardar',
        release_date: '2022-10-21',
        partNumber: 1,
        vote_average: 7.6,
        poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
      },
      {
        id: 12004,
        title: 'Sardar 2',
        release_date: '2026-09-08',
        partNumber: 2,
        vote_average: 8.6,
        poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      }
    ]
  },
  // Spider-Man MCU Saga
  spiderman: {
    collectionName: 'Spider-Man Cinematic Saga',
    parts: [
      {
        id: 315635,
        title: 'Spider-Man: Homecoming',
        release_date: '2017-07-05',
        partNumber: 1,
        vote_average: 7.4,
        poster_path: '/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg',
      },
      {
        id: 429617,
        title: 'Spider-Man: Far From Home',
        release_date: '2019-06-28',
        partNumber: 2,
        vote_average: 7.5,
        poster_path: '/4q2NNZ49Zbe2enAEWXBk7GhuFR5.jpg',
      },
      {
        id: 634649,
        title: 'Spider-Man: No Way Home',
        release_date: '2021-12-15',
        partNumber: 3,
        vote_average: 8.0,
        poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      },
      {
        id: 12007,
        title: 'Spider-Man: Brand New Day',
        release_date: '2026-07-31',
        partNumber: 4,
        vote_average: 8.0,
        poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      }
    ]
  },
  // Deadpool Trilogy
  deadpool: {
    collectionName: 'Deadpool Trilogy',
    parts: [
      {
        id: 293660,
        title: 'Deadpool',
        release_date: '2016-02-09',
        partNumber: 1,
        vote_average: 7.6,
        poster_path: '/inVq3wo8fHaHpVppQlTM1HXUp04.jpg',
      },
      {
        id: 383498,
        title: 'Deadpool 2',
        release_date: '2018-05-15',
        partNumber: 2,
        vote_average: 7.5,
        poster_path: '/to0spRl1CMDvyUbvuLFioQmVIYf.jpg',
      },
      {
        id: 533535,
        title: 'Deadpool & Wolverine',
        release_date: '2024-07-26',
        partNumber: 3,
        vote_average: 7.7,
        poster_path: '/8cdWjvZQUExUUTzyp4tmnmTShaX.jpg',
      }
    ]
  },
  // Avengers Saga
  avengers: {
    collectionName: 'Avengers Cinematic Saga',
    parts: [
      {
        id: 24428,
        title: 'The Avengers',
        release_date: '2012-04-25',
        partNumber: 1,
        vote_average: 7.7,
        poster_path: '/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
      },
      {
        id: 99861,
        title: 'Avengers: Age of Ultron',
        release_date: '2015-04-22',
        partNumber: 2,
        vote_average: 7.3,
        poster_path: '/4ssDuvEDkS9urOHL21rV1ph2x9Z.jpg',
      },
      {
        id: 299536,
        title: 'Avengers: Infinity War',
        release_date: '2018-04-25',
        partNumber: 3,
        vote_average: 8.3,
        poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
      },
      {
        id: 299534,
        title: 'Avengers: Endgame',
        release_date: '2019-04-24',
        partNumber: 4,
        vote_average: 8.3,
        poster_path: '/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
      },
      {
        id: 13004,
        title: 'Avengers: Doomsday',
        release_date: '2026-05-01',
        partNumber: 5,
        vote_average: 9.1,
        poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
      }
    ]
  },
  // Mirzapur Universe
  mirzapur: {
    collectionName: 'Mirzapur Gangland Saga',
    parts: [
      {
        id: 1200801,
        title: 'Mirzapur: Season 1',
        release_date: '2018-11-16',
        partNumber: 1,
        vote_average: 8.5,
        poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
      },
      {
        id: 1200802,
        title: 'Mirzapur: Season 2',
        release_date: '2020-10-23',
        partNumber: 2,
        vote_average: 8.4,
        poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
      },
      {
        id: 1200803,
        title: 'Mirzapur: Season 3',
        release_date: '2024-07-05',
        partNumber: 3,
        vote_average: 8.1,
        poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
      },
      {
        id: 12008,
        title: 'Mirzapur: The Movie',
        release_date: '2026-09-01',
        partNumber: 4,
        vote_average: 8.0,
        poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
      }
    ]
  }
};

export const tmdb = {
  getApiKey,
  setApiKey,
  clearApiKey,
  trending: (window = 'week') => tmdbFetch(`/trending/movie/${window}`),
  search: (query, page = 1) => tmdbFetch('/search/movie', { query, page, include_adult: false }),
  details: (id) =>
    tmdbFetch(`/movie/${id}`, {
      append_to_response: 'credits,videos,watch/providers,translations,similar,recommendations',
    }),
  nowPlaying: (page = 1) => tmdbFetch('/movie/now_playing', { page }),
  upcoming: (page = 1) => tmdbFetch('/movie/upcoming', { page }),
  collection: (id) => tmdbFetch(`/collection/${id}`),
  similar: (id, page = 1) => tmdbFetch(`/movie/${id}/similar`, { page }),
  recommendations: (id, page = 1) => tmdbFetch(`/movie/${id}/recommendations`, { page }),
  genres: () => tmdbFetch('/genre/movie/list'),
};
