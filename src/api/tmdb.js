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
  // Tamil Blockbusters
  {
    id: 927342,
    title: 'Amaran',
    original_language: 'ta',
    release_date: '2024-10-31',
    release_label: 'BLOCKBUSTER HIT',
    vote_average: 7.4,
    vote_count: 1450,
    poster_path: '/eCB06m1KUGilEOlIzb40nkQhVY0.jpg',
    backdrop_path: '/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg',
    overview: 'The heroic life story of Major Mukund Varadarajan, an Indian Army officer who laid down his life leading a counter-terrorism operation in Kashmir.',
    genre_ids: [28, 18, 10752],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 1097000,
    title: 'Lubber Pandhu',
    original_language: 'ta',
    release_date: '2024-09-20',
    release_label: 'SUPER HIT',
    vote_average: 7.6,
    vote_count: 980,
    poster_path: '/jNyLZjIgaYVkBli2JihHwABlAPY.jpg',
    backdrop_path: '/8BemLDPKS52ZKgqzwD21W5BEZAY.jpg',
    overview: 'Middle-aged gully cricket legend Poomalai finds an unyielding young rival in Anbu, leading to high-stakes rivalry and unexpected romantic twists.',
    genre_ids: [35, 18],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 1129608,
    title: 'The Greatest of All Time (GOAT)',
    original_language: 'ta',
    release_date: '2024-09-05',
    release_label: 'MEGA BLOCKBUSTER',
    vote_average: 7.0,
    vote_count: 3200,
    poster_path: '/kk9SmNt6QcP5thvSYELWvO0NWuC.jpg',
    backdrop_path: '/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg',
    overview: 'A decorated Special Anti-Terrorism Squad leader faces his most lethal adversary when ghosts from his past operation resurface to strike his family.',
    genre_ids: [28, 53, 878],
    trailerKey: 'wUn05hdkhSk',
  },
  {
    id: 1093966,
    title: 'Vettaiyan',
    original_language: 'ta',
    release_date: '2024-10-10',
    release_label: 'SUPERSTAR DHAMAKA',
    vote_average: 6.2,
    vote_count: 1800,
    poster_path: '/1q0dAC3OJZVKQcV2dG5sGvdUGqN.jpg',
    backdrop_path: '/b3AeMIsXPm6wvGp9E7mGmRZ6528.jpg',
    overview: 'A celebrated encounter specialist police officer finds his convictions challenged when an encounter triggers public outcry and moral reckoning.',
    genre_ids: [28, 80, 18],
    trailerKey: 'coGmsT2iMls',
  },
  {
    id: 1136423,
    title: 'Meiyazhagan',
    original_language: 'ta',
    release_date: '2024-09-27',
    release_label: 'CRITICALLY ACCLAIMED',
    vote_average: 8.2,
    vote_count: 1200,
    poster_path: '/ngDEH7YqVaMCAD4LpNxRl6ScJnw.jpg',
    backdrop_path: '/9v5Q5OOR9e83KBlK6SPQEcbm6Iw.jpg',
    overview: 'Returning to his hometown after 22 years for a family wedding, an introverted man forms an unforgettable bond with an exuberant, unnamed relative.',
    genre_ids: [18],
    trailerKey: 'TcMBFSGVi1c',
  },
  {
    id: 1136418,
    title: 'Raayan',
    original_language: 'ta',
    release_date: '2024-07-26',
    release_label: 'RATED HIT',
    vote_average: 6.5,
    vote_count: 1650,
    poster_path: '/dHMbqpG7vZk1iEJaEkCCyixFbos.jpg',
    backdrop_path: '/1Us0a54s7aFDwDtIfRjlwvnLJQg.jpg',
    overview: 'A quiet, protective elder brother is forced to unleash fury when ruthless gangland syndicates threaten the peaceful survival of his siblings.',
    genre_ids: [28, 80, 18],
    trailerKey: 'LEjhY15eCx0',
  },

  // Telugu Blockbusters
  {
    id: 857598,
    title: 'Pushpa 2 - The Rule',
    original_language: 'te',
    release_date: '2024-12-04',
    release_label: 'RECORD CRUSHER',
    vote_average: 7.8,
    vote_count: 5400,
    poster_path: '/bhxZj3y59cK7JtGdV285dhDRaMe.jpg',
    backdrop_path: '/5nEyyLkElpD7zkqh41aSkTCchcc.jpg',
    overview: 'Pushpa Raj commands his vast red sandalwood empire as police and rival cartels conspire to topple his dominion in a bloody showdown.',
    genre_ids: [28, 80, 18],
    trailerKey: 'g0XUf0y7g9Q',
  },
  {
    id: 811941,
    title: 'Devara: Part 1',
    original_language: 'te',
    release_date: '2024-09-26',
    release_label: 'OCEANIC BLOCKBUSTER',
    vote_average: 6.9,
    vote_count: 2800,
    poster_path: '/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg',
    backdrop_path: '/hAQnXxOwCjgYcKRgTdYPRC8neqL.jpg',
    overview: 'A courageous warrior guards coastal waters against treacherous sea smugglers, passing his fearless legacy down to his timid son.',
    genre_ids: [28, 12, 18],
    trailerKey: 'Jb8pXsp_nTI',
  },
  {
    id: 1239511,
    title: 'Lucky Baskhar',
    original_language: 'te',
    release_date: '2024-10-30',
    release_label: 'SUPER HIT',
    vote_average: 7.7,
    vote_count: 1350,
    poster_path: '/a47JQFl9L7VDa79tEvnTOJe0rPa.jpg',
    backdrop_path: '/q8UyN4XhpmChtneZXdZ8fktQka6.jpg',
    overview: 'A struggling middle-class cashier dives into high-stakes financial loopholes during the 1990s Mumbai stock market boom.',
    genre_ids: [18, 53, 80],
    trailerKey: '67vbA5ZJb3E',
  },
  {
    id: 801688,
    title: 'Kalki 2898-AD',
    original_language: 'te',
    release_date: '2024-06-26',
    release_label: 'SCI-FI PHENOMENON',
    vote_average: 6.8,
    vote_count: 4200,
    poster_path: '/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg',
    backdrop_path: '/o8XSR1SONnjcsv84NRu6Mwsl5io.jpg',
    overview: 'Six thousand years after the Kurukshetra War, immortal Ashwatthama defends an unborn savior in the dystopian desert kingdom of Kasi.',
    genre_ids: [28, 878, 14],
    trailerKey: 'kQDd1AhGIHk',
  },
  {
    id: 1194915,
    title: 'Saripodhaa Sanivaaram',
    original_language: 'te',
    release_date: '2024-08-29',
    release_label: 'ACTION THRILLER',
    vote_average: 6.7,
    vote_count: 1100,
    poster_path: '/e2yVhbMkpi4JvvdIhvRpS0Muge7.jpg',
    backdrop_path: '/yxQACC8pPE5RpRU8nFVU830LL6u.jpg',
    overview: 'An insurance agent sworn to anger management unleashes his stored fury only on Saturdays, colliding with a maniacal police officer.',
    genre_ids: [28, 53],
    trailerKey: 'hRFY_Fesa9Q',
  },

  // Hindi Blockbusters
  {
    id: 1112426,
    title: 'Stree 2',
    original_language: 'hi',
    release_date: '2024-08-15',
    release_label: 'ALL-TIME RECORD',
    vote_average: 7.2,
    vote_count: 3600,
    poster_path: '/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg',
    backdrop_path: '/fVV0A67kDjTTQ4CvUn8LoletRmI.jpg',
    overview: 'The town of Chanderi is terrorized by a headless ghost Sarkata, forcing Vicky and his eccentric squad to team up with the mysterious woman once again.',
    genre_ids: [35, 27],
    trailerKey: 'kv17X7wD_7Y',
  },
  {
    id: 980599,
    title: 'Bhool Bhulaiyaa 3',
    original_language: 'hi',
    release_date: '2024-11-01',
    release_label: 'DIWALI BLOCKBUSTER',
    vote_average: 6.5,
    vote_count: 1950,
    poster_path: '/3AfHD1HoaQpQwKH8kxRdBKVmzeU.jpg',
    backdrop_path: '/1TdCtQaAqZhKRSOSbPi1EPToJxN.jpg',
    overview: 'Rooh Baba enters a haunted royal palace in Bengal, confronting two vengeful spirits who both claim to be the real Manjulika.',
    genre_ids: [35, 27],
    trailerKey: '73_1biulkYk',
  },
  {
    id: 1014214,
    title: 'Singham Again',
    original_language: 'hi',
    release_date: '2024-11-01',
    release_label: 'COP UNIVERSE',
    vote_average: 6.0,
    vote_count: 1750,
    poster_path: '/2JbNkHg8m7LaBy61LyrnnlenaxY.jpg',
    backdrop_path: '/lexEx0B4WDOXGfqPTj4R8FCrE7H.jpg',
    overview: 'Bajirao Singham joins forces with Sooryavanshi, Simmba, Satya, and Shakti Shetty in an epic cross-border tactical rescue mission.',
    genre_ids: [28, 53],
    trailerKey: 'uYPbbksJxIg',
  },
  {
    id: 1196943,
    title: 'Chhaava',
    original_language: 'hi',
    release_date: '2025-02-14',
    release_label: 'HISTORICAL EPIC',
    vote_average: 7.0,
    vote_count: 850,
    poster_path: '/ubRsrzb6NRW8YhVTJ6jG1kpNvCi.jpg',
    backdrop_path: '/s37s21YPqS7txyB0x0TRel24vgi.jpg',
    overview: 'Chhatrapati Sambhaji Maharaj leads the Maratha Empire against Mughal Emperor Aurangzeb in legendary historical warfare.',
    genre_ids: [28, 18, 36],
    trailerKey: '6ZfuNTqbHE8',
  },

  // Malayalam Blockbusters
  {
    id: 1084812,
    title: 'Aavesham',
    original_language: 'ml',
    release_date: '2024-04-11',
    release_label: 'MOLWOOD BLOCKBUSTER',
    vote_average: 7.5,
    vote_count: 2900,
    poster_path: '/k5RWPaNjgRcNvGoawYaQHQwyctI.jpg',
    backdrop_path: '/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg',
    overview: 'Three college students in Bangalore befriend an eccentric local gangster Ranga to settle a college rivalry, leading to chaotic mayhem.',
    genre_ids: [28, 35],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 1069945,
    title: 'Manjummel Boys',
    original_language: 'ml',
    release_date: '2024-02-22',
    release_label: 'INDUSTRY HIT',
    vote_average: 7.9,
    vote_count: 3100,
    poster_path: '/bswrtewwthpsh6nABiqKevU4UBI.jpg',
    backdrop_path: '/stKGOm8ffToIgIlSY9AmODFu02.jpg',
    overview: 'Based on true events, a group of young friends embark on a daring unauthorized rescue mission into the perilous Guna Caves in Kodaikanal.',
    genre_ids: [12, 18, 53],
    trailerKey: 'TcMBFSGVi1c',
  },
  {
    id: 1025125,
    title: 'Kishkindha Kaandam',
    original_language: 'ml',
    release_date: '2024-09-12',
    release_label: 'MYSTERY THRILLER',
    vote_average: 7.7,
    vote_count: 1250,
    poster_path: '/rniBYHDRs6e8qMkPr4D4ZE5uMhF.jpg',
    backdrop_path: '/sqv6AUWkVLS7s9rWxhiChIiSQdd.jpg',
    overview: 'Strange disappearances occur near a monkey-inhabited forest reserve, leading forest officials and a newlywed couple into deep psychological secrets.',
    genre_ids: [9648, 53],
    trailerKey: 'coGmsT2iMls',
  },
  {
    id: 1166133,
    title: 'Bramayugam',
    original_language: 'ml',
    release_date: '2024-02-15',
    release_label: 'FOLK HORROR MASTERPIECE',
    vote_average: 7.6,
    vote_count: 1850,
    poster_path: '/snQLwRrfQAl5YFKVefZq9Lbscki.jpg',
    backdrop_path: '/3Y5pOfxMrG8SqbIcGhYy497eOXc.jpg',
    overview: 'In 17th-century Kerala, a lost singer seeks refuge in a mysterious ancient mansion ruled by an occultist master who holds supernatural sway.',
    genre_ids: [27, 9648, 14],
    trailerKey: 'wUn05hdkhSk',
  },

  // Kannada Blockbusters
  {
    id: 777292,
    title: 'Bagheera',
    original_language: 'kn',
    release_date: '2024-10-31',
    release_label: 'SANDALWOOD HIT',
    vote_average: 6.5,
    vote_count: 920,
    poster_path: '/oW3iHFiXpfRXXQJiSXScNFEBf7h.jpg',
    backdrop_path: '/r9GXAvybRDx613LzNRnZAPJyjrI.jpg',
    overview: 'Fed up with institutional corruption and organized crime, a fearless police officer assumes a masked vigilante identity to deliver swift justice.',
    genre_ids: [28, 53],
    trailerKey: 'LEjhY15eCx0',
  },
  {
    id: 858485,
    title: 'Kantara',
    original_language: 'kn',
    release_date: '2022-09-30',
    release_label: 'DEVINE BLOCKBUSTER',
    vote_average: 7.2,
    vote_count: 2400,
    poster_path: '/jIsKmkxMzdCZ0Ux1GVSnu8m6Na6.jpg',
    backdrop_path: '/kXElm7wt2kAXEVwJqW4cFhP43nW.jpg',
    overview: 'A fierce conflict erupts between villagers and forest authorities over sacred land, awakening ancient divine Bhoota Kola spirits.',
    genre_ids: [28, 12, 14],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 587412,
    title: 'K.G.F: Chapter 2',
    original_language: 'kn',
    release_date: '2022-04-14',
    release_label: 'ALL-TIME SENSATION',
    vote_average: 7.5,
    vote_count: 4900,
    poster_path: '/khNVygolU0TxLIDWff5tQlAhZ23.jpg',
    backdrop_path: '/nsV5Mfi9FAV4w8eDsdr7uqVswOk.jpg',
    overview: 'Rocky reigns supreme over the Kolar Gold Fields, defending his promised throne against ruthless warlord Adheera and government forces.',
    genre_ids: [28, 80, 18],
    trailerKey: '6ZfuNTqbHE8',
  },

  // English / Global Blockbusters
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    original_language: 'en',
    release_date: '2024-07-24',
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
    id: 653346,
    title: 'Kingdom of the Planet of the Apes',
    original_language: 'en',
    release_date: '2024-05-08',
    release_label: 'CINEMA EPIC',
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
    original_language: 'en',
    release_date: '2024-06-11',
    release_label: 'WORLDWIDE PHENOMENON',
    vote_average: 7.6,
    vote_count: 4800,
    poster_path: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    backdrop_path: '/stKGOm8ffToIgIlSY9AmODFu02.jpg',
    overview: 'Teenager Riley\'s mind headquarters undergoes a sudden demolition to make room for unexpected new Emotions: Anxiety, Envy, Ennui, and Embarrassment.',
    genre_ids: [16, 10751, 35, 12],
    trailerKey: 'LEjhY15eCx0',
  },
  {
    id: 969681,
    title: 'Spider-Man: Brand New Day',
    original_language: 'en',
    release_date: '2026-07-29',
    release_label: 'MARVEL SAGA',
    vote_average: 8.0,
    vote_count: 3200,
    poster_path: '/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg',
    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    overview: 'Peter Parker begins a fresh chapter fighting street-level crime in New York City with zero memory from his old allies, facing ruthless new syndicates.',
    genre_ids: [28, 12, 878],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    original_language: 'en',
    release_date: '2023-07-19',
    release_label: 'OSCAR WINNER',
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
    original_language: 'en',
    release_date: '2018-04-25',
    release_label: 'MCU EVENT',
    vote_average: 8.3,
    vote_count: 29000,
    poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdrop_path: '/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg',
    overview: 'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos.',
    genre_ids: [12, 28, 878],
    trailerKey: '6ZfuNTqbHE8',
  }
];

export const THEATRICAL_COMING_SOON = [
  // Tamil Upcoming
  {
    id: 1259024,
    title: 'Good Bad Ugly',
    original_language: 'ta',
    release_date: '2025-05-01',
    release_label: 'MAY 2025',
    duration: '2:35',
    vote_average: 7.9,
    vote_count: 1400,
    poster_path: '/8DbYYluzdiGDAZzsaP7DWGbwfLd.jpg',
    backdrop_path: '/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg',
    overview: 'An adrenaline-pumping crime spectacle starring Ajith Kumar following three notorious anti-heroes embroiled in high-stakes syndicate betrayals.',
    genre_ids: [28, 53, 80],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 1020354,
    title: 'Viduthalai: Part II',
    original_language: 'ta',
    release_date: '2024-12-20',
    release_label: 'DEC 20',
    duration: '2:25',
    vote_average: 8.4,
    vote_count: 1600,
    poster_path: '/l2LVYzhCuwfPfN80v6lic55DIAc.jpg',
    backdrop_path: '/223v5btruh9KfS0m4eVj9BnEWBn.jpg',
    overview: 'The gripping conclusion to Vetrimaaran\'s political saga starring Vijay Sethupathi and Soori, exploring the origins of Vaathiyar and the armed struggle in the hills.',
    genre_ids: [18, 28, 80],
    trailerKey: 'TcMBFSGVi1c',
  },
  {
    id: 1045021,
    title: 'Thug Life',
    original_language: 'ta',
    release_date: '2025-06-05',
    release_label: 'JUN 05',
    duration: '2:40',
    vote_average: 8.2,
    vote_count: 2100,
    poster_path: '/vP01zuiaSDdDShyVp5rumqBsRXp.jpg',
    backdrop_path: '/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg',
    overview: 'A sprawling gangster saga reuniting legendary director Mani Ratnam and Kamal Haasan as Rangaraaya Sakthivel, navigating betrayal and power across decades.',
    genre_ids: [28, 18, 80],
    trailerKey: 'wUn05hdkhSk',
  },

  // Telugu Upcoming
  {
    id: 811944,
    title: 'Game Changer',
    original_language: 'te',
    release_date: '2025-01-10',
    release_label: 'JAN 10',
    duration: '2:45',
    vote_average: 7.2,
    vote_count: 2100,
    poster_path: '/qtOGsZoLW7QceqKmsOy5nSM6Aik.jpg',
    backdrop_path: '/aBw406SvghTKV6CTK9t84Bo9Xik.jpg',
    overview: 'Ram Charan stars as a fierce and incorruptible IAS officer who wages war against entrenched political corruption to transform democratic elections, directed by S. Shankar.',
    genre_ids: [28, 18, 53],
    trailerKey: '67vbA5ZJb3E',
  },

  // Hindi Upcoming
  {
    id: 1257960,
    title: 'Sikandar',
    original_language: 'hi',
    release_date: '2025-03-30',
    release_label: 'EID 2025',
    duration: '2:30',
    vote_average: 7.4,
    vote_count: 1500,
    poster_path: '/41s42CRXafa3OuRGvCtfYPEBmse.jpg',
    backdrop_path: '/4MNRH73XmwBK2ycv3qvLpa07O5F.jpg',
    overview: 'Salman Khan stars in AR Murugadoss\'s high-octane action drama as a righteous warrior standing up against a tyrannical pan-Indian syndicate.',
    genre_ids: [28, 18, 53],
    trailerKey: 'uYPbbksJxIg',
  },

  // Malayalam Upcoming
  {
    id: 627336,
    title: 'L2: Empuraan',
    original_language: 'ml',
    release_date: '2025-03-27',
    release_label: 'MAR 27',
    duration: '2:50',
    vote_average: 8.5,
    vote_count: 2800,
    poster_path: '/rlK1u6zJp8AJ93XX8dgiZVsE5w8.jpg',
    backdrop_path: '/jYaoVDJ9J6Me3J0EQCABzQ99YVG.jpg',
    overview: 'Stephen Nedumpally returns as Khureshi-Ab\'raam, navigating shadow alliances and international syndicates across multiple continents, directed by Prithviraj Sukumaran.',
    genre_ids: [28, 53, 80],
    trailerKey: 'coGmsT2iMls',
  },

  // Kannada Upcoming
  {
    id: 1213243,
    title: 'Toxic: A Fairy Tale for Grown-ups',
    original_language: 'kn',
    release_date: '2026-04-10',
    release_label: 'APR 10',
    duration: '2:40',
    vote_average: 8.0,
    vote_count: 1900,
    poster_path: '/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg',
    backdrop_path: '/nsV5Mfi9FAV4w8eDsdr7uqVswOk.jpg',
    overview: 'Rocking Star Yash stars in Geetu Mohandas\'s gritty, stylized period action crime drama set in the violent underworld of coastal cartels.',
    genre_ids: [28, 80, 53],
    trailerKey: 'LEjhY15eCx0',
  },
  {
    id: 1083637,
    title: 'Kantara - A Legend: Chapter 1',
    original_language: 'kn',
    release_date: '2025-10-02',
    release_label: 'OCT 02',
    duration: '2:35',
    vote_average: 8.3,
    vote_count: 2300,
    poster_path: '/hmprmTW6bwlYLNlNOICYrkXOr0e.jpg',
    backdrop_path: '/w57nxiBIODAYHLRs1xmrCY9zEFe.jpg',
    overview: 'Rishab Shetty returns to unveil the mythological origins of the sacred forest deity and the ancient Kadamba dynasty during a legendary era.',
    genre_ids: [28, 12, 14],
    trailerKey: 'JfVOs4VSpmA',
  },

  // English Upcoming
  {
    id: 1204680,
    title: 'Coyote vs. Acme',
    original_language: 'en',
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
    original_language: 'en',
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
    original_language: 'en',
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
    original_language: 'en',
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
    original_language: 'en',
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
    original_language: 'en',
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
