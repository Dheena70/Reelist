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
  // Tamil 2026 Theatrical Releases
  {
    id: 1153399,
    title: 'Coolie',
    original_language: 'ta',
    release_date: '2026-09-04',
    release_label: 'SEP 04',
    vote_average: 8.5,
    vote_count: 2450,
    poster_path: '/4NHs0s9WynldKaOpz2UhwD6ZLXe.jpg',
    backdrop_path: '/b3AeMIsXPm6wvGp9E7mGmRZ6528.jpg',
    overview: 'Superstar Rajinikanth stars in Lokesh Kanagaraj\'s high-voltage gold-smuggling syndicate action spectacle as an enigmatic underworld kingpin.',
    genre_ids: [28, 80, 53],
    trailerKey: 'coGmsT2iMls',
  },
  {
    id: 1259024,
    title: 'Good Bad Ugly',
    original_language: 'ta',
    release_date: '2026-08-28',
    release_label: 'AUG 28',
    vote_average: 7.9,
    vote_count: 1980,
    poster_path: '/8DbYYluzdiGDAZzsaP7DWGbwfLd.jpg',
    backdrop_path: '/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg',
    overview: 'An adrenaline-pumping crime spectacle starring Ajith Kumar following three notorious anti-heroes embroiled in high-stakes syndicate betrayals.',
    genre_ids: [28, 53, 80],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 1045021,
    title: 'Thug Life',
    original_language: 'ta',
    release_date: '2026-09-01',
    release_label: 'SEP 01',
    vote_average: 8.2,
    vote_count: 2100,
    poster_path: '/vP01zuiaSDdDShyVp5rumqBsRXp.jpg',
    backdrop_path: '/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg',
    overview: 'A sprawling gangster saga reuniting legendary director Mani Ratnam and Kamal Haasan as Rangaraaya Sakthivel, navigating betrayal and power across decades.',
    genre_ids: [28, 18, 80],
    trailerKey: 'wUn05hdkhSk',
  },
  {
    id: 1020354,
    title: 'Viduthalai: Part II',
    original_language: 'ta',
    release_date: '2026-08-21',
    release_label: 'AUG 21',
    vote_average: 8.4,
    vote_count: 1800,
    poster_path: '/l2LVYzhCuwfPfN80v6lic55DIAc.jpg',
    backdrop_path: '/223v5btruh9KfS0m4eVj9BnEWBn.jpg',
    overview: 'The gripping conclusion to Vetrimaaran\'s political saga starring Vijay Sethupathi and Soori, exploring the origins of Vaathiyar and the armed struggle in the hills.',
    genre_ids: [18, 28, 80],
    trailerKey: 'TcMBFSGVi1c',
  },

  // Telugu 2026 Theatrical Releases
  {
    id: 811944,
    title: 'Game Changer',
    original_language: 'te',
    release_date: '2026-09-05',
    release_label: 'SEP 05',
    vote_average: 7.7,
    vote_count: 2600,
    poster_path: '/qtOGsZoLW7QceqKmsOy5nSM6Aik.jpg',
    backdrop_path: '/aBw406SvghTKV6CTK9t84Bo9Xik.jpg',
    overview: 'Ram Charan stars as a fierce and incorruptible IAS officer who wages war against entrenched political corruption to transform democratic elections, directed by S. Shankar.',
    genre_ids: [28, 18, 53],
    trailerKey: '67vbA5ZJb3E',
  },
  {
    id: 1080365,
    title: 'They Call Him OG',
    original_language: 'te',
    release_date: '2026-08-28',
    release_label: 'AUG 28',
    vote_average: 8.0,
    vote_count: 2300,
    poster_path: '/oWOJ4VMyF92IEcTmrQO0xFDqeyk.jpg',
    backdrop_path: '/yxQACC8pPE5RpRU8nFVU830LL6u.jpg',
    overview: 'Power Star Pawan Kalyan plays Ojas Gambheera, a ruthless underworld prodigy who returns to Mumbai ten years after leaving blood-soaked criminal syndicates behind.',
    genre_ids: [28, 80, 53],
    trailerKey: 'hRFY_Fesa9Q',
  },
  {
    id: 857598,
    title: 'Pushpa 2 - The Rule',
    original_language: 'te',
    release_date: '2026-09-02',
    release_label: 'SEP 02',
    vote_average: 7.8,
    vote_count: 5400,
    poster_path: '/bhxZj3y59cK7JtGdV285dhDRaMe.jpg',
    backdrop_path: '/5nEyyLkElpD7zkqh41aSkTCchcc.jpg',
    overview: 'Pushpa Raj commands his vast red sandalwood empire as police and rival cartels conspire to topple his dominion in an electrifying showdown.',
    genre_ids: [28, 80, 18],
    trailerKey: 'g0XUf0y7g9Q',
  },
  {
    id: 811941,
    title: 'Devara: Part 1',
    original_language: 'te',
    release_date: '2026-08-15',
    release_label: 'AUG 15',
    vote_average: 7.1,
    vote_count: 3100,
    poster_path: '/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg',
    backdrop_path: '/hAQnXxOwCjgYcKRgTdYPRC8neqL.jpg',
    overview: 'A courageous warrior guards coastal waters against treacherous sea smugglers, passing his fearless legacy down to his timid son.',
    genre_ids: [28, 12, 18],
    trailerKey: 'Jb8pXsp_nTI',
  },

  // Hindi 2026 Theatrical Releases
  {
    id: 1257960,
    title: 'Sikandar',
    original_language: 'hi',
    release_date: '2026-09-04',
    release_label: 'SEP 04',
    vote_average: 7.6,
    vote_count: 1950,
    poster_path: '/41s42CRXafa3OuRGvCtfYPEBmse.jpg',
    backdrop_path: '/4MNRH73XmwBK2ycv3qvLpa07O5F.jpg',
    overview: 'Salman Khan stars in AR Murugadoss\'s high-octane action drama as a righteous warrior standing up against a tyrannical pan-Indian syndicate.',
    genre_ids: [28, 18, 53],
    trailerKey: 'uYPbbksJxIg',
  },
  {
    id: 1109086,
    title: 'War 2',
    original_language: 'hi',
    release_date: '2026-08-28',
    release_label: 'AUG 28',
    vote_average: 8.1,
    vote_count: 2750,
    poster_path: '/j8Gl3S4L7LE8GIF1J1phZ2Cbo72.jpg',
    backdrop_path: '/lexEx0B4WDOXGfqPTj4R8FCrE7H.jpg',
    overview: 'Major Kabir Dhaliwal crosses paths with an enigmatic lethal operative in a globe-trotting clash of elite secret agents in the YRF Spy Universe.',
    genre_ids: [28, 53],
    trailerKey: '6ZfuNTqbHE8',
  },
  {
    id: 1196943,
    title: 'Chhaava',
    original_language: 'hi',
    release_date: '2026-09-01',
    release_label: 'SEP 01',
    vote_average: 7.4,
    vote_count: 1420,
    poster_path: '/ubRsrzb6NRW8YhVTJ6jG1kpNvCi.jpg',
    backdrop_path: '/s37s21YPqS7txyB0x0TRel24vgi.jpg',
    overview: 'Chhatrapati Sambhaji Maharaj leads the Maratha Empire against Mughal Emperor Aurangzeb in legendary historical warfare.',
    genre_ids: [28, 18, 36],
    trailerKey: 'kv17X7wD_7Y',
  },
  {
    id: 1014214,
    title: 'Singham Again',
    original_language: 'hi',
    release_date: '2026-08-21',
    release_label: 'AUG 21',
    vote_average: 6.8,
    vote_count: 2100,
    poster_path: '/2JbNkHg8m7LaBy61LyrnnlenaxY.jpg',
    backdrop_path: '/lexEx0B4WDOXGfqPTj4R8FCrE7H.jpg',
    overview: 'Bajirao Singham joins forces with Sooryavanshi, Simmba, Satya, and Shakti Shetty in an epic cross-border tactical rescue mission.',
    genre_ids: [28, 53],
    trailerKey: '73_1biulkYk',
  },

  // Malayalam 2026 Theatrical Releases
  {
    id: 627336,
    title: 'L2: Empuraan',
    original_language: 'ml',
    release_date: '2026-09-05',
    release_label: 'SEP 05',
    vote_average: 8.5,
    vote_count: 3100,
    poster_path: '/rlK1u6zJp8AJ93XX8dgiZVsE5w8.jpg',
    backdrop_path: '/jYaoVDJ9J6Me3J0EQCABzQ99YVG.jpg',
    overview: 'Stephen Nedumpally returns as Khureshi-Ab\'raam, navigating shadow alliances and international syndicates across multiple continents, directed by Prithviraj Sukumaran.',
    genre_ids: [28, 53, 80],
    trailerKey: 'coGmsT2iMls',
  },
  {
    id: 1084812,
    title: 'Aavesham',
    original_language: 'ml',
    release_date: '2026-08-28',
    release_label: 'AUG 28',
    vote_average: 7.7,
    vote_count: 2900,
    poster_path: '/k5RWPaNjgRcNvGoawYaQHQwyctI.jpg',
    backdrop_path: '/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg',
    overview: 'Three college students in Bangalore befriend an eccentric local gangster Ranga to settle a college rivalry, leading to chaotic mayhem.',
    genre_ids: [28, 35],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 1025125,
    title: 'Kishkindha Kaandam',
    original_language: 'ml',
    release_date: '2026-09-01',
    release_label: 'SEP 01',
    vote_average: 7.8,
    vote_count: 1450,
    poster_path: '/rniBYHDRs6e8qMkPr4D4ZE5uMhF.jpg',
    backdrop_path: '/sqv6AUWkVLS7s9rWxhiChIiSQdd.jpg',
    overview: 'Strange disappearances occur near a monkey-inhabited forest reserve, leading forest officials and a newlywed couple into deep psychological secrets.',
    genre_ids: [9648, 53],
    trailerKey: 'TcMBFSGVi1c',
  },

  // Kannada 2026 Theatrical Releases
  {
    id: 1213243,
    title: 'Toxic: A Fairy Tale for Grown-ups',
    original_language: 'kn',
    release_date: '2026-09-04',
    release_label: 'SEP 04',
    vote_average: 8.2,
    vote_count: 2400,
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
    release_date: '2026-08-28',
    release_label: 'AUG 28',
    vote_average: 8.4,
    vote_count: 2900,
    poster_path: '/hmprmTW6bwlYLNlNOICYrkXOr0e.jpg',
    backdrop_path: '/w57nxiBIODAYHLRs1xmrCY9zEFe.jpg',
    overview: 'Rishab Shetty returns to unveil the mythological origins of the sacred forest deity and the ancient Kadamba dynasty during a legendary era.',
    genre_ids: [28, 12, 14],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 777292,
    title: 'Bagheera',
    original_language: 'kn',
    release_date: '2026-09-01',
    release_label: 'SEP 01',
    vote_average: 6.9,
    vote_count: 1100,
    poster_path: '/oW3iHFiXpfRXXQJiSXScNFEBf7h.jpg',
    backdrop_path: '/r9GXAvybRDx613LzNRnZAPJyjrI.jpg',
    overview: 'Fed up with institutional corruption and organized crime, a fearless police officer assumes a masked vigilante identity to deliver swift justice.',
    genre_ids: [28, 53],
    trailerKey: 'LEjhY15eCx0',
  },

  // English / Global 2026 Theatrical Releases
  {
    id: 969681,
    title: 'Spider-Man: Brand New Day',
    original_language: 'en',
    release_date: '2026-07-29',
    release_label: 'JUL 29',
    vote_average: 8.0,
    vote_count: 3200,
    poster_path: '/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg',
    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    overview: 'Peter Parker begins a fresh chapter fighting street-level crime in New York City with zero memory from his old allies, facing ruthless new syndicates.',
    genre_ids: [28, 12, 878],
    trailerKey: 'JfVOs4VSpmA',
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    original_language: 'en',
    release_date: '2026-08-28',
    release_label: 'AUG 28',
    vote_average: 7.7,
    vote_count: 5900,
    poster_path: '/8cdWjvZQUExUUTzyp4tmnmTShaX.jpg',
    backdrop_path: '/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary Deadpool behind him, until the TVA pulls him into an existential mission alongside Wolverine.',
    genre_ids: [28, 35, 878],
    trailerKey: '73_1biulkYk',
  },
  {
    id: 1386315,
    title: 'The Runner',
    original_language: 'en',
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
    id: 1101412,
    title: 'Fall 2: Deadpoint',
    original_language: 'en',
    release_date: '2026-09-01',
    release_label: 'SEP 01',
    vote_average: 6.9,
    vote_count: 430,
    poster_path: '/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg',
    backdrop_path: '/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    overview: 'High-altitude climbers find themselves trapped atop an abandoned offshore radio tower with severe weather rapidly approaching.',
    genre_ids: [53, 28],
    trailerKey: 'd9MyW72ELq0',
  },
  {
    id: 1204680,
    title: 'Coyote vs. Acme',
    original_language: 'en',
    release_date: '2026-08-20',
    release_label: 'AUG 20',
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
    vote_average: 6.4,
    vote_count: 750,
    poster_path: '/pu2VxGlpGwffOx292w18b1tv96j.jpg',
    backdrop_path: '/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    overview: 'When his billionaire industrialist boss is murdered in front of him, an undercover bodyguard is framed for the crime and plunged into a global conspiracy.',
    genre_ids: [28, 53],
    trailerKey: 'coGmsT2iMls',
  }
];

export const THEATRICAL_COMING_SOON = [
  // Tamil Upcoming
  {
    id: 1041513,
    title: 'Sardar 2',
    original_language: 'ta',
    release_date: '2026-10-31',
    release_label: 'OCT 31',
    duration: '2:30',
    vote_average: 7.8,
    vote_count: 850,
    poster_path: '/vP01zuiaSDdDShyVp5rumqBsRXp.jpg',
    backdrop_path: '/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg',
    overview: 'Karthi returns as the veteran spy Chandra Bose and his police officer son Vijay Prakash in a globe-trotting mission across dangerous espionage networks.',
    genre_ids: [28, 53, 12],
    trailerKey: 'wUn05hdkhSk',
  },
  {
    id: 1111873,
    title: 'Kanguva: Part 2',
    original_language: 'ta',
    release_date: '2026-11-14',
    release_label: 'NOV 14',
    duration: '2:40',
    vote_average: 7.6,
    vote_count: 920,
    poster_path: '/l2LVYzhCuwfPfN80v6lic55DIAc.jpg',
    backdrop_path: '/223v5btruh9KfS0m4eVj9BnEWBn.jpg',
    overview: 'The epic conflict between archaic clans and modern covert factions culminates across continents in this sweeping fantasy action saga.',
    genre_ids: [28, 14, 12],
    trailerKey: 'coGmsT2iMls',
  },

  // Telugu Upcoming
  {
    id: 792293,
    title: 'Hari Hara Veera Mallu',
    original_language: 'te',
    release_date: '2026-10-15',
    release_label: 'OCT 15',
    duration: '2:35',
    vote_average: 7.5,
    vote_count: 1100,
    poster_path: '/oWOJ4VMyF92IEcTmrQO0xFDqeyk.jpg',
    backdrop_path: '/yxQACC8pPE5RpRU8nFVU830LL6u.jpg',
    overview: 'In the Mughal era, legendary outlaw Veera Mallu revolts against imperial tyranny to defend the oppressed.',
    genre_ids: [28, 18, 12],
    trailerKey: 'hRFY_Fesa9Q',
  },
  {
    id: 890665,
    title: 'Spirit',
    original_language: 'te',
    release_date: '2026-11-20',
    release_label: 'NOV 20',
    duration: '2:45',
    vote_average: 8.3,
    vote_count: 1400,
    poster_path: '/qtOGsZoLW7QceqKmsOy5nSM6Aik.jpg',
    backdrop_path: '/aBw406SvghTKV6CTK9t84Bo9Xik.jpg',
    overview: 'Prabhas plays a fierce, unhinged police officer who wages an unrelenting single-handed war against deep criminal cartels, directed by Sandeep Reddy Vanga.',
    genre_ids: [28, 80, 53],
    trailerKey: 'Jb8pXsp_nTI',
  },

  // Hindi Upcoming
  {
    id: 1094556,
    title: 'Housefull 5',
    original_language: 'hi',
    release_date: '2026-10-24',
    release_label: 'OCT 24',
    duration: '2:20',
    vote_average: 7.1,
    vote_count: 780,
    poster_path: '/41s42CRXafa3OuRGvCtfYPEBmse.jpg',
    backdrop_path: '/4MNRH73XmwBK2ycv3qvLpa07O5F.jpg',
    overview: 'An ensemble comic adventure set aboard a luxury cruise ship with eccentric millionaires, confused identities, and escalating chaos.',
    genre_ids: [35],
    trailerKey: '73_1biulkYk',
  },
  {
    id: 1133349,
    title: 'Brahmāstra Part 2: Dev',
    original_language: 'hi',
    release_date: '2026-12-18',
    release_label: 'DEC 18',
    duration: '2:50',
    vote_average: 8.0,
    vote_count: 1600,
    poster_path: '/j8Gl3S4L7LE8GIF1J1phZ2Cbo72.jpg',
    backdrop_path: '/lexEx0B4WDOXGfqPTj4R8FCrE7H.jpg',
    overview: 'The origins and terrifying awakening of Dev, the dark wielder of the Astras who seeks to subjugate the universe with celestial weapons.',
    genre_ids: [14, 28, 12],
    trailerKey: '6ZfuNTqbHE8',
  },

  // Malayalam Upcoming
  {
    id: 822119,
    title: 'Barroz',
    original_language: 'ml',
    release_date: '2026-10-02',
    release_label: 'OCT 02',
    duration: '2:10',
    vote_average: 7.3,
    vote_count: 850,
    poster_path: '/rlK1u6zJp8AJ93XX8dgiZVsE5w8.jpg',
    backdrop_path: '/jYaoVDJ9J6Me3J0EQCABzQ99YVG.jpg',
    overview: 'A 400-year-old mythical guardian spirit protects Vasco da Gama\'s legendary treasure in the deep sea caves of Kochi, directed by Mohanlal.',
    genre_ids: [14, 12, 10751],
    trailerKey: 'TcMBFSGVi1c',
  },

  // Kannada Upcoming
  {
    id: 1071215,
    title: 'KD - The Devil',
    original_language: 'kn',
    release_date: '2026-11-06',
    release_label: 'NOV 06',
    duration: '2:35',
    vote_average: 7.9,
    vote_count: 920,
    poster_path: '/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg',
    backdrop_path: '/nsV5Mfi9FAV4w8eDsdr7uqVswOk.jpg',
    overview: 'Set against the violent 1970s Bangalore underworld, Kaalidasa rises from the shadows to wage a brutal war against tyrannical syndicates.',
    genre_ids: [28, 80, 53],
    trailerKey: 'LEjhY15eCx0',
  },

  // English Upcoming
  {
    id: 1375646,
    title: 'Colony',
    original_language: 'en',
    release_date: '2026-09-21',
    release_label: 'SEP 21',
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
    id: 1275779,
    title: 'Disclosure Day',
    original_language: 'en',
    release_date: '2026-10-10',
    release_label: 'OCT 10',
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
