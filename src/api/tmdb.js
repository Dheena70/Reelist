import { tmdbCache } from '../utils/tmdbCache.js';
import { sanitizePath } from '../utils/tmdbValidation.js';
import overrides from '../data/overrides.json';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function posterUrl(path, size = 'w500') {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path, size = 'w1280') {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
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

export const LANGUAGE_NAMES = {
  ta: 'Tamil',
  te: 'Telugu',
  hi: 'Hindi',
  ml: 'Malayalam',
  kn: 'Kannada',
  en: 'English',
  bn: 'Bengali',
  mr: 'Marathi',
  pa: 'Punjabi',
  gu: 'Gujarati',
  or: 'Odia',
  ur: 'Urdu',
  ko: 'Korean',
  ja: 'Japanese',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  de: 'German',
  zh: 'Chinese',
  ar: 'Arabic',
  ru: 'Russian',
  pt: 'Portuguese',
  sv: 'Swedish',
  hu: 'Hungarian',
};

export function getLanguageLabel(code) {
  if (!code) return 'Other';
  const clean = code.toLowerCase().trim();
  return LANGUAGE_NAMES[clean] || clean.toUpperCase();
}

export const ARTIST_ALIASES = {
  sk: 'Sivakarthikeyan',
  str: 'Silambarasan TR',
  simbu: 'Silambarasan TR',
  tr: 'T. Rajendar',
  rdj: 'Robert Downey Jr.',
  vjs: 'Vijay Sethupathi',
  thala: 'Ajith Kumar',
  ak: 'Ajith Kumar',
  thalapathy: 'Thalapathy Vijay',
  vijay: 'Thalapathy Vijay',
  superstar: 'Rajinikanth',
  thalaivar: 'Rajinikanth',
  ulaganayagan: 'Kamal Haasan',
  kamal: 'Kamal Haasan',
  d: 'Dhanush',
  dhanush: 'Dhanush',
  chiyaan: 'Vikram',
  vikram: 'Vikram',
  prabhas: 'Prabhas',
  ntr: 'N. T. Rama Rao Jr.',
  'jr ntr': 'N. T. Rama Rao Jr.',
  rc: 'Ram Charan',
  'ram charan': 'Ram Charan',
  allu: 'Allu Arjun',
  'allu arjun': 'Allu Arjun',
  aa: 'Allu Arjun',
  bunny: 'Allu Arjun',
  mb: 'Mahesh Babu',
  'mahesh babu': 'Mahesh Babu',
  srk: 'Shah Rukh Khan',
  'king khan': 'Shah Rukh Khan',
  salman: 'Salman Khan',
  aamir: 'Aamir Khan',
  hr: 'Hrithik Roshan',
  hrithik: 'Hrithik Roshan',
  rk: 'Ranbir Kapoor',
  ranbir: 'Ranbir Kapoor',
  ranveer: 'Ranveer Singh',
  fafa: 'Fahadh Faasil',
  fahadh: 'Fahadh Faasil',
  dq: 'Dulquer Salmaan',
  dulquer: 'Dulquer Salmaan',
  tovino: 'Tovino Thomas',
  prithvi: 'Prithviraj Sukumaran',
  lalettan: 'Mohanlal',
};

export const FRANCHISE_COLLECTIONS = {
  devara: {
    collectionName: 'Devara Saga',
    parts: [
      { id: 811941, title: 'Devara: Part 1', release_date: '2024-09-27' },
      { id: 811942, title: 'Devara: Part 2' },
    ],
  },
  pushpa: {
    collectionName: 'Pushpa Trilogy',
    parts: [
      { id: 693134, title: 'Pushpa: The Rise', release_date: '2021-12-17' },
      { id: 857598, title: 'Pushpa 2: The Rule', release_date: '2024-12-05' },
    ],
  },
  kalki: {
    collectionName: 'Kalki Cinematic Universe',
    parts: [
      { id: 801688, title: 'Kalki 2898 AD', release_date: '2024-06-27' },
      { id: 1184918, title: 'Kalki 2898 AD - Part 2' },
    ],
  },
  stree: {
    collectionName: 'Maddock Supernatural Universe',
    parts: [
      { id: 533535, title: 'Stree', release_date: '2018-08-31' },
      { id: 1112426, title: 'Stree 2', release_date: '2024-08-15' },
    ],
  },
  deadpool: {
    collectionName: 'Deadpool Collection',
    parts: [
      { id: 293660, title: 'Deadpool', release_date: '2016-02-12' },
      { id: 383498, title: 'Deadpool 2', release_date: '2018-05-18' },
      { id: 533535, title: 'Deadpool & Wolverine', release_date: '2024-07-26' },
    ],
  },
  dune: {
    collectionName: 'Dune Saga',
    parts: [
      { id: 438631, title: 'Dune: Part One', release_date: '2021-10-22' },
      { id: 693134, title: 'Dune: Part Two', release_date: '2024-03-01' },
    ],
  },
  gladiator: {
    collectionName: 'Gladiator Collection',
    parts: [
      { id: 98, title: 'Gladiator', release_date: '2000-05-05' },
      { id: 558449, title: 'Gladiator II', release_date: '2024-11-22' },
    ],
  },
};

export async function tmdbGet(path, params = {}, signal) {
  const cleanPath = sanitizePath(path);
  if (!cleanPath) {
    throw new Error('tmdbGet: valid path is required');
  }

  const query = new URLSearchParams();
  query.set('path', cleanPath);

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      query.set(k, String(v));
    }
  });

  const cacheKey = `${cleanPath}?${query.toString()}`;
  const cached = tmdbCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const res = await fetch(`/api/tmdb?${query.toString()}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!res.ok) {
    const err = new Error(`TMDB request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  tmdbCache.set(cacheKey, data);
  return data;
}

function getRollingDateRange(daysPast = 30, daysFuture = 30) {
  const now = new Date();
  const past = new Date(now.getTime() - daysPast * 24 * 60 * 60 * 1000);
  const future = new Date(now.getTime() + daysFuture * 24 * 60 * 60 * 1000);
  return {
    gte: past.toISOString().split('T')[0],
    lte: future.toISOString().split('T')[0],
  };
}

function formatPersonDetails(target) {
  if (!target) return null;
  const credits = target.combined_credits?.cast || target.known_for || [];
  const filmography = [];
  const seenIds = new Set();
  const langCounts = {};

  for (const item of credits) {
    if (!item || !item.id || seenIds.has(item.id)) continue;
    seenIds.add(item.id);

    const title = item.title || item.name || 'Untitled';
    const releaseDate = item.release_date || item.first_air_date || '';
    const year = releaseDate && releaseDate.length >= 4 ? releaseDate.slice(0, 4) : '—';
    const lang = (item.original_language || 'en').toLowerCase();
    const langLabel = getLanguageLabel(lang);

    langCounts[lang] = (langCounts[lang] || 0) + 1;

    filmography.push({
      ...item,
      title,
      name: title,
      character: item.character || '',
      release_date: releaseDate,
      first_air_date: releaseDate,
      year,
      original_language: lang,
      language_name: langLabel,
      poster_path: item.poster_path || null,
      backdrop_path: item.backdrop_path || null,
      vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : null,
      vote_count: item.vote_count || 0,
      overview: item.overview || '',
      media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
      popularity: item.popularity || 0,
    });
  }

  filmography.sort((a, b) => {
    const yearA = parseInt(a.year, 10) || 0;
    const yearB = parseInt(b.year, 10) || 0;
    if (yearB !== yearA) return yearB - yearA;
    return (b.popularity || 0) - (a.popularity || 0);
  });

  const sortedLangEntries = Object.entries(langCounts).sort((a, b) => b[1] - a[1]);
  const languages = [
    { code: 'all', name: 'All Languages', count: filmography.length },
    ...sortedLangEntries.map(([code, count]) => ({
      code,
      name: getLanguageLabel(code),
      count,
    })),
  ];

  return {
    id: target.id,
    tmdb_id: target.id,
    name: target.name || 'Artist',
    profile_path: target.profile_path || null,
    known_for_department: target.known_for_department || 'Acting',
    biography: target.biography || '',
    birthday: target.birthday || null,
    deathday: target.deathday || null,
    place_of_birth: target.place_of_birth || null,
    popularity: target.popularity || 0,
    total_films: filmography.length,
    languages,
    filmography,
  };
}

export const tmdb = {
  tmdbGet,

  trending: async (window = 'week', signal) => {
    return tmdbGet(`/trending/movie/${window}`, {}, signal);
  },

  trendingTv: async (window = 'week', signal) => {
    const data = await tmdbGet(`/trending/tv/${window}`, {}, signal);
    if (data?.results) {
      data.results = data.results.map((item) => ({
        ...item,
        media_type: 'tv',
        title: item.title || item.name,
        release_date: item.release_date || item.first_air_date,
      }));
    }
    return data;
  },

  nowPlaying: async (page = 1, region = 'IN', signal) => {
    return tmdbGet('/movie/now_playing', { page, region }, signal);
  },

  upcoming: async (page = 1, region = 'IN', signal) => {
    return tmdbGet('/movie/upcoming', { page, region }, signal);
  },

  topRatedMovies: async (page = 1, region = 'IN', signal) => {
    return tmdbGet('/movie/top_rated', { page, region }, signal);
  },

  topRatedTv: async (page = 1, signal) => {
    const data = await tmdbGet('/tv/top_rated', { page }, signal);
    if (data?.results) {
      data.results = data.results.map((item) => ({
        ...item,
        media_type: 'tv',
        title: item.title || item.name,
        release_date: item.release_date || item.first_air_date,
      }));
    }
    return data;
  },

  regional: async (langCode, page = 1, signal) => {
    const { gte, lte } = getRollingDateRange(30, 30);
    return tmdbGet('/discover/movie', {
      with_original_language: langCode,
      region: 'IN',
      'primary_release_date.gte': gte,
      'primary_release_date.lte': lte,
      sort_by: 'popularity.desc',
      page,
    }, signal);
  },

  details: async (id, mediaType = 'movie', signal) => {
    // Check manual overrides if any
    const manualOverride = Array.isArray(overrides)
      ? overrides.find((o) => o.id === Number(id) || String(o.id) === String(id))
      : null;

    const isTv = mediaType === 'tv';
    const primaryPath = isTv ? `/tv/${id}` : `/movie/${id}`;

    try {
      const data = await tmdbGet(primaryPath, {
        append_to_response: 'videos,credits,watch/providers,similar,recommendations,release_dates',
      }, signal);

      const resolved = {
        ...data,
        media_type: isTv ? 'tv' : 'movie',
        title: data.title || data.name,
        release_date: data.release_date || data.first_air_date,
        ...(manualOverride || {}),
      };
      return resolved;
    } catch (err) {
      // Fallback: If movie lookup fails, attempt tv lookup
      if (!isTv) {
        try {
          const tvData = await tmdbGet(`/tv/${id}`, {
            append_to_response: 'videos,credits,watch/providers,similar,recommendations',
          }, signal);
          return {
            ...tvData,
            media_type: 'tv',
            title: tvData.name || tvData.title,
            release_date: tvData.first_air_date || tvData.release_date,
            ...(manualOverride || {}),
          };
        } catch {
          throw err;
        }
      }
      throw err;
    }
  },

  search: async (query, page = 1, signal) => {
    const rawQ = (query || '').toLowerCase().trim();
    if (!rawQ) {
      return { page: 1, results: [], total_pages: 0, total_results: 0, artist: null, similarArtists: [] };
    }

    const resolvedCanonical = ARTIST_ALIASES[rawQ] || null;
    const queryForApi = resolvedCanonical || query;

    let artist = null;
    const similarArtists = [];

    try {
      const [multiData, personData] = await Promise.allSettled([
        tmdbGet('/search/multi', { query: queryForApi, page, include_adult: false }, signal),
        tmdbGet('/search/person', { query: queryForApi, page: 1, include_adult: false }, signal),
      ]);

      const rawPersonResults = (personData.status === 'fulfilled' && personData.value?.results)
        ? personData.value.results
        : [];

      for (const p of rawPersonResults.slice(0, 5)) {
        similarArtists.push({
          id: p.id,
          tmdb_id: p.id,
          name: p.name,
          profile_path: p.profile_path,
          known_for_department: p.known_for_department || 'Acting',
          total_films: (p.known_for || []).length,
          popularity: p.popularity || 10,
        });
      }

      const topPerson = rawPersonResults[0];
      if (topPerson && (topPerson.name.toLowerCase() === rawQ || topPerson.name.toLowerCase() === queryForApi.toLowerCase() || topPerson.popularity > 15)) {
        try {
          const fullPerson = await tmdbGet(`/person/${topPerson.id}`, { append_to_response: 'combined_credits' }, signal);
          artist = formatPersonDetails(fullPerson);
        } catch {
          // ignore person detail failure
        }
      }

      if (multiData.status === 'fulfilled' && multiData.value?.results) {
        const filtered = multiData.value.results
          .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
          .map((item) => ({
            ...item,
            title: item.title || item.name,
            release_date: item.release_date || item.first_air_date,
          }));

        return {
          page: multiData.value.page || 1,
          results: filtered,
          total_pages: multiData.value.total_pages || 1,
          total_results: filtered.length,
          artist,
          similarArtists,
        };
      }
    } catch {
      // Fallback empty search
    }

    return {
      page: 1,
      results: [],
      total_pages: 0,
      total_results: 0,
      artist: null,
      similarArtists: [],
    };
  },

  personDetails: async (id, signal) => {
    try {
      const full = await tmdbGet(`/person/${id}`, { append_to_response: 'combined_credits' }, signal);
      return formatPersonDetails(full);
    } catch {
      return null;
    }
  },

  collection: (id, signal) => tmdbGet(`/collection/${id}`, {}, signal),
  genres: (signal) => tmdbGet('/genre/movie/list', {}, signal),
};
