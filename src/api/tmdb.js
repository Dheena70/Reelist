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
    id: 12001,
    title: 'Immortal',
    release_date: '2026-09-04',
    release_label: 'SEP 4 CERTIFIED',
    vote_average: 9.3,
    vote_count: 1420,
    poster_path: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    overview: 'An immortal warrior navigates across centuries of concealed battles, confronting modern forces determined to unlock the secret of eternal life.',
    genre_ids: [28, 14, 53],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 12002,
    title: 'Mandaadi',
    release_date: '2026-08-28',
    release_label: 'IN THEATERS NOW',
    vote_average: 8.4,
    vote_count: 980,
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',
    overview: 'Set against coastal heritage and deep-sea mysteries, an unyielding fisherman fights corporate greed to protect ancestral fishing waters.',
    genre_ids: [18, 28],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 12003,
    title: 'Bethlehem Kudumba Unit',
    release_date: '2026-09-02',
    release_label: 'SEP 2026',
    vote_average: 8.3,
    vote_count: 850,
    poster_path: '/8CdWjvZQUExUUTzyp4tmnmTShaX.jpg',
    backdrop_path: '/x4bi289iWkR7U8oUfJmgG22Xf6f.jpg',
    overview: 'A heartwarming and humorous drama revolving around a close-knit township community as generations clash over heritage and modern ambitions.',
    genre_ids: [35, 18],
    trailerKey: 'TcMBFSGVi1c',
  },
  {
    id: 12004,
    title: 'Sardar 2',
    release_date: '2026-09-08',
    release_label: 'IN THEATERS • SEP 2026',
    vote_average: 8.6,
    vote_count: 2150,
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    overview: 'The legendary spy Sardar returns for his highest-stakes international covert operation yet, taking down a sinister deep-state syndicate.',
    genre_ids: [28, 53],
    trailerKey: 'L3pk_lBagcQ',
  },
  {
    id: 12005,
    title: "I'm Game",
    release_date: '2026-09-03',
    release_label: 'SEP 03',
    vote_average: 6.5,
    vote_count: 620,
    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdrop_path: '/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    overview: 'A high-octane cat-and-mouse thriller where an elite investigator enters an illegal underground gaming contest to catch a criminal mastermind.',
    genre_ids: [28, 80, 53],
    trailerKey: 'coGmsT2iMls',
  },
  {
    id: 12006,
    title: 'Modha Rathiri',
    release_date: '2026-08-21',
    release_label: 'AUG 21',
    vote_average: 8.9,
    vote_count: 1740,
    poster_path: '/kKGQzkTyMbAg9GxqqvllPaIyq0Z.jpg',
    backdrop_path: '/stKGOm8ffToIgIlSY9AmODFu02.jpg',
    overview: 'A wedding night unravels into a rollercoaster of hilarious misunderstandings, suspenseful twists, and unexpected family secrets.',
    genre_ids: [35, 10749, 9648],
    trailerKey: 'wUn05hdkhSk',
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    release_date: '2024-07-26',
    release_label: 'GLOBAL BLOCKBUSTER',
    vote_average: 7.7,
    vote_count: 5900,
    poster_path: '/8cdWjvZQUExUUTzyp4tmnmTShaX.jpg',
    backdrop_path: '/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him, until the TVA pulls him into an existential mission alongside Wolverine.',
    genre_ids: [28, 35, 878],
    trailerKey: '73_1biulkYk',
  },
  {
    id: 12007,
    title: 'Spider-Man: Brand New Day',
    release_date: '2026-07-31',
    release_label: 'IN THEATERS',
    vote_average: 8.0,
    vote_count: 3200,
    poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    overview: 'Peter Parker begins a fresh chapter fighting street-level crime in New York City with zero memory from his old allies, facing ruthless new syndicates.',
    genre_ids: [28, 12, 878],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 12008,
    title: 'Mirzapur: The Movie',
    release_date: '2026-09-01',
    release_label: 'SEPTEMBER 2026',
    vote_average: 8.0,
    vote_count: 2400,
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',
    overview: 'The battle for the throne of Mirzapur reaches the big screen in a colossal cinematic gangland showdown between Kaleen Bhaiya, Guddu, and Sharad.',
    genre_ids: [80, 18, 28],
    trailerKey: 'ZNEp1nI2x1c',
  },
  {
    id: 12009,
    title: 'Hanuman Ansh',
    release_date: '2026-08-07',
    release_label: 'IN CINEMAS 7TH AUG',
    vote_average: 9.0,
    vote_count: 1890,
    poster_path: '/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    overview: 'An ordinary villager in the Himalayas discovers his divine lineage, rising to defend ancient sanctums against dark technological incursions.',
    genre_ids: [28, 14, 12],
    trailerKey: '2Gg6Seob5Mg',
  }
];

export const THEATRICAL_COMING_SOON = [
  {
    id: 13001,
    title: 'Practical Magic 2',
    release_date: '2026-09-10',
    release_label: 'SEP 10',
    duration: '2:39',
    vote_average: 7.8,
    vote_count: 420,
    poster_path: '/8CdWjvZQUExUUTzyp4tmnmTShaX.jpg',
    backdrop_path: '/x4bi289iWkR7U8oUfJmgG22Xf6f.jpg',
    overview: 'The Owens sisters return as a new generation of witches must embrace their lineage to break an ancient ancestral curse threatening their town.',
    genre_ids: [14, 35, 10749],
    trailerKey: 'coGmsT2iMls',
  },
  {
    id: 13002,
    title: 'Runner',
    release_date: '2026-09-11',
    release_label: 'SEP 11',
    duration: '2:23',
    vote_average: 8.1,
    vote_count: 510,
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/zfbjgQE1uSd9wiPTX4VzsLi0rGG.jpg',
    overview: 'A former covert operative turned long-distance smuggler must cross a militarized borderline in under 48 hours to save his family.',
    genre_ids: [28, 53, 80],
    trailerKey: 'wUn05hdkhSk',
  },
  {
    id: 13003,
    title: 'Street Fighter',
    release_date: '2026-10-16',
    release_label: 'OCT 16',
    duration: '2:48',
    vote_average: 8.4,
    vote_count: 890,
    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdrop_path: '/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    overview: 'World martial artists gather for the ultimate tournament engineered by Shadaloo, unleashing iconic elemental strikes and unforgettable rivalries.',
    genre_ids: [28, 12, 878],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 13004,
    title: 'Avengers: Doomsday',
    release_date: '2026-05-01',
    release_label: 'MAY 2026',
    duration: '2:45',
    vote_average: 9.1,
    vote_count: 1200,
    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    overview: 'Earth\'s Mightiest Heroes confront the supreme monarch of Latveria, Doctor Victor von Doom, in a battle across parallel timelines.',
    genre_ids: [28, 12, 878],
    trailerKey: 'TcMBFSGVi1c',
  },
  {
    id: 13005,
    title: 'Avatar: Fire and Ash',
    release_date: '2026-12-18',
    release_label: 'DEC 2026',
    duration: '3:10',
    vote_average: 8.9,
    vote_count: 950,
    poster_path: '/kKGQzkTyMbAg9GxqqvllPaIyq0Z.jpg',
    backdrop_path: '/stKGOm8ffToIgIlSY9AmODFu02.jpg',
    overview: 'Jake Sully and Neytiri encounter the aggressive Ash People of Pandora, exploring uncharted volcanic territories and new philosophical conflicts.',
    genre_ids: [28, 12, 878, 14],
    trailerKey: 'd9MyW72ELq0',
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
