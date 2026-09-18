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
  if (typeof window !== 'undefined' && window.localStorage) {
    const localKey = sanitizeKey(window.localStorage.getItem('tmdb_api_key'));
    if (localKey && !PLACEHOLDER_KEYS.has(localKey)) {
      return localKey;
    }
  }

  const envKey = sanitizeKey(import.meta.env?.VITE_TMDB_API_KEY);
  if (envKey && !PLACEHOLDER_KEYS.has(envKey)) {
    return envKey;
  }

  return '';
}

function setApiKey(key) {
  const clean = sanitizeKey(key);
  if (typeof window !== 'undefined' && window.localStorage) {
    if (clean) {
      window.localStorage.setItem('tmdb_api_key', clean);
    } else {
      window.localStorage.removeItem('tmdb_api_key');
    }
  }
}

function clearApiKey() {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem('tmdb_api_key');
  }
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

export const THEATRICAL_NOW_PLAYING = [
  {
    "id": 1235877,
    "title": "Jana Nayagan",
    "original_title": "ஜன நாயகன்",
    "original_language": "ta",
    "release_date": "2026-07-22",
    "release_label": "JUL 22",
    "full_release_date": "2026-07-22 (Theatrical)",
    "duration": "3h 3m",
    "runtime": 183,
    "director": "H. Vinoth",
    "production_companies": "KVN Productions",
    "vote_average": 6,
    "vote_count": 20,
    "poster_path": "/jt8pfSIdi47YpFMMWVRr8w5u2S0.jpg",
    "backdrop_path": "/v3lNH2gCojWYXVuXcT9FZLBxcSq.jpg",
    "overview": "A clash of ideologies. One stands for the people, the other feeds on control. Their paths collided once before. Years later, a child’s silent fear ignites the past, drawing a former police officer into a battle far bigger than personal revenge.",
    "genre_ids": [
      28,
      18
    ],
    "trailerKey": "",
    "ratings": {
      "imdb": "6.0/10",
      "prime": "6.3/10",
      "rottenTomatoes": "75%",
      "tmdb": "6.0/10"
    },
    "cast": [
      {
        "adult": false,
        "gender": 2,
        "id": 91547,
        "known_for_department": "Acting",
        "name": "Vijay",
        "original_name": "விஜய்",
        "popularity": 2.1557,
        "profile_path": "/zbQ1sDRVRHkroWwvrnqYKMerl66.jpg",
        "cast_id": 1,
        "character": "Thalapathy Vetri Kondan 'Vetri'",
        "credit_id": "65b23a702866fa017be3da00",
        "order": 0
      },
      {
        "adult": false,
        "gender": 1,
        "id": 587753,
        "known_for_department": "Acting",
        "name": "Pooja Hegde",
        "original_name": "పూజా హెగ్డే",
        "popularity": 2.4528,
        "profile_path": "/9wdyzZz0Fu81pnKNDBVOcxkPBIp.jpg",
        "cast_id": 29,
        "character": "Kayal",
        "credit_id": "66fbfe07d8064165bdf185ae",
        "order": 1
      },
      {
        "adult": false,
        "gender": 2,
        "id": 77235,
        "known_for_department": "Acting",
        "name": "Bobby Deol",
        "original_name": "बॉबी द्योल",
        "popularity": 1.2936,
        "profile_path": "/2npVa3PduichY8e7qBiE54m9VVP.jpg",
        "cast_id": 28,
        "character": "John Himler / Amrish Poojari",
        "credit_id": "66ee71257ff2bf57cd25eeb1",
        "order": 2
      },
      {
        "adult": false,
        "gender": 1,
        "id": 2191938,
        "known_for_department": "Acting",
        "name": "Mamitha Baiju",
        "original_name": "Mamitha Baiju",
        "popularity": 4.4602,
        "profile_path": "/9ySiE3j7ep16fhKi3u5iq5rbOk6.jpg",
        "cast_id": 27,
        "character": "Vijayalakshmi 'Viji'",
        "credit_id": "66ee71147ff2bf57cd25eeab",
        "order": 3
      },
      {
        "adult": false,
        "gender": 1,
        "id": 1107197,
        "known_for_department": "Acting",
        "name": "Priyamani",
        "original_name": "ప్రియమణి",
        "popularity": 1.6781,
        "profile_path": "/grcW2eMm77Q2Kj1xX0HvZlRpGRR.jpg",
        "cast_id": 30,
        "character": "Sheela Rani",
        "credit_id": "66fbfe27f17b887599d64001",
        "order": 4
      }
    ]
  },
  {
    "id": 969681,
    "title": "Spider-Man: Brand New Day",
    "original_title": "Spider-Man: Brand New Day",
    "original_language": "en",
    "release_date": "2026-07-29",
    "release_label": "JUL 29",
    "full_release_date": "2026-07-29 (Theatrical)",
    "duration": "2h 25m",
    "runtime": 145,
    "director": "Destin Daniel Cretton",
    "production_companies": "Major Studio",
    "vote_average": 7.8,
    "vote_count": 2746,
    "poster_path": "/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
    "backdrop_path": "/qeQJx07rK2xm8SD2sJxFKhE7gs0.jpg",
    "overview": "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat to the city and those he loves - a powerful villain no one can even see.",
    "genre_ids": [
      878,
      28,
      12
    ],
    "trailerKey": "P3uI5sLosKU",
    "ratings": {
      "imdb": "7.8/10",
      "prime": "8.1/10",
      "rottenTomatoes": "86%",
      "tmdb": "7.8/10"
    },
    "cast": [
      {
        "id": 1136406,
        "name": "Tom Holland",
        "character": "Peter Parker / Spider-Man",
        "gender": 2,
        "profile_path": "/5OK84Wn1bIEIThFKcVoaN087mLj.jpg"
      },
      {
        "id": 505710,
        "name": "Zendaya",
        "character": "MJ",
        "gender": 1,
        "profile_path": "/3WdOloHpjtjL96uVOhFRRCcYSwq.jpg"
      },
      {
        "id": 103,
        "name": "Mark Ruffalo",
        "character": "Bruce Banner / Hulk",
        "gender": 2,
        "profile_path": "/5GilHMOt5PAQh6rlUKZzGmaKEI7.jpg"
      },
      {
        "id": 19498,
        "name": "Jon Bernthal",
        "character": "Frank Castle / Punisher",
        "gender": 2,
        "profile_path": "/aSH27tGD4PJoCO54RQnARSSSIQy.jpg"
      },
      {
        "id": 1649152,
        "name": "Jacob Batalon",
        "character": "Ned Leeds",
        "gender": 2,
        "profile_path": "/53YhaL4xw4Sb1ssoHkeSSBaO29c.jpg"
      }
    ]
  },
  {
    "id": 1213243,
    "title": "Toxic: A Fairy Tale for Grown-ups",
    "original_title": "ಟಾಕ್ಸಿಕ್",
    "original_language": "kn",
    "release_date": "2026-08-26",
    "release_label": "AUG 26",
    "full_release_date": "2026-08-26 (Theatrical)",
    "duration": "3h 12m",
    "runtime": 192,
    "director": "Geetu Mohandas",
    "production_companies": "Major Studio",
    "vote_average": 8.1,
    "vote_count": 73,
    "poster_path": "/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg",
    "backdrop_path": "/tBRSSfgqOAq7YlG8udcoJIBm2FG.jpg",
    "overview": "A powerful drug cartel pulls the strings behind a facade of sun-soaked beaches as a gritty, violent underworld power struggle emerges during the crumbling of Portuguese colonial rule.",
    "genre_ids": [
      28,
      80,
      18
    ],
    "trailerKey": "EfluEyQ5QIA",
    "ratings": {
      "imdb": "8.1/10",
      "prime": "8.4/10",
      "rottenTomatoes": "89%",
      "tmdb": "8.1/10"
    },
    "cast": [
      {
        "id": 1293681,
        "name": "Yash",
        "character": "Raya / Ticket",
        "gender": 2,
        "profile_path": "/ixHvgN8hGh8YgWd3j9RqUATvBiy.jpg"
      },
      {
        "id": 1340978,
        "name": "Kiara Advani",
        "character": "Nadia",
        "gender": 1,
        "profile_path": "/2xmU03a6kTWUvuTPMdofiFLxdAw.jpg"
      },
      {
        "id": 91548,
        "name": "Nayanthara",
        "character": "Ganga",
        "gender": 1,
        "profile_path": "/sYUzvjsSsqeOgBblSzda6ZwwbEa.jpg"
      },
      {
        "id": 1108805,
        "name": "Huma Qureshi",
        "character": "Elizabeth",
        "gender": 1,
        "profile_path": "/nJWauZQdRjMJxwY3UP4SXrqh9CM.jpg"
      },
      {
        "id": 2030881,
        "name": "Tara Sutaria",
        "character": "Rebecca",
        "gender": 1,
        "profile_path": "/tF2OxFzOaDOMX1Sn4k17qZxhvFL.jpg"
      }
    ]
  },
  {
    "id": 1122030,
    "title": "Alpha",
    "original_title": "अल्फा",
    "original_language": "hi",
    "release_date": "2026-07-02",
    "release_label": "JUL 02",
    "full_release_date": "2026-07-02 (Theatrical)",
    "duration": "2h 21m",
    "runtime": 141,
    "director": "Shiv Rawail",
    "production_companies": "Major Studio",
    "vote_average": 5.3,
    "vote_count": 24,
    "poster_path": "/bPtRt3ajQ0EkyeQ1O6iJwAIi9Py.jpg",
    "backdrop_path": "/b4WXm5ahmtubYXy3wqHUG2nUKoM.jpg",
    "overview": "When Sita, a highly trained assassin raised in isolation as a super-soldier by a rogue commander, discovers the dark truth about her family and her stolen childhood, she teams up with her long lost sister to take down her creator and his illicit military program.",
    "genre_ids": [
      28,
      53
    ],
    "trailerKey": "YP1uSAggr6Y",
    "ratings": {
      "imdb": "5.3/10",
      "prime": "5.6/10",
      "rottenTomatoes": "75%",
      "tmdb": "5.3/10"
    },
    "cast": [
      {
        "id": 1108120,
        "name": "Alia Bhatt",
        "character": "Sita",
        "gender": 1,
        "profile_path": "/lAgBZgHKTo6amIO9CfNxUbm1usH.jpg"
      },
      {
        "id": 2518564,
        "name": "Sharvari",
        "character": "Durga",
        "gender": 1,
        "profile_path": "/zAkx24qd7eH1Ck3ouBnPOysAOaJ.jpg"
      },
      {
        "id": 77235,
        "name": "Bobby Deol",
        "character": "Fateh Singh Lakhawat",
        "gender": 2,
        "profile_path": "/2npVa3PduichY8e7qBiE54m9VVP.jpg"
      },
      {
        "id": 72118,
        "name": "Anil Kapoor",
        "character": "Vikrant Kaul",
        "gender": 2,
        "profile_path": "/dwvnpiwg9m2zj0VHzlgzEotFl0G.jpg"
      },
      {
        "id": 101823,
        "name": "Dibyendu Bhattacharya",
        "character": "Dr. John Verghese",
        "gender": 2,
        "profile_path": "/uLlGKCL9y5CFBwcAafTDQhupz5h.jpg"
      }
    ]
  },
  {
    "id": 1378537,
    "title": "Mirzapur: The Movie",
    "original_title": "मिर्ज़ापुर - द मूवी",
    "original_language": "hi",
    "release_date": "2026-09-03",
    "release_label": "SEP 03",
    "full_release_date": "2026-09-03 (Theatrical)",
    "duration": "3h 17m",
    "runtime": 197,
    "director": "Gurmmeet Singh",
    "production_companies": "Major Studio",
    "vote_average": 7.6,
    "vote_count": 18,
    "poster_path": "/cdDKdCRyq6BYuNblpKUYqRPWvEg.jpg",
    "backdrop_path": "/nTkQBI8ldvPByIkxsemGxtKlr8E.jpg",
    "overview": "The battle for Mirzapur’s throne intensifies as old enemies resurface and a new threat emerges in the form of Babban Babua, a ruthless businessman from Jaisalmer with ambitions of his own. As the Tripathis face enemies from both the past and present, loyalties are tested while Guddu and Bablu Pandit fight to establish themselves in the power struggle for Mirzapur.",
    "genre_ids": [
      28,
      80,
      18,
      53
    ],
    "trailerKey": "",
    "ratings": {
      "imdb": "7.6/10",
      "prime": "7.9/10",
      "rottenTomatoes": "84%",
      "tmdb": "7.6/10"
    },
    "cast": [
      {
        "id": 1179460,
        "name": "Pankaj Tripathi",
        "character": "Akhandanand 'Kaleen' Tripathi",
        "gender": 2,
        "profile_path": "/f3Vxz0QB7PHeyPcXrfJX14Xkxnu.jpg"
      },
      {
        "id": 492791,
        "name": "Ali Fazal",
        "character": "Govind 'Guddu' Pandit",
        "gender": 2,
        "profile_path": "/lLDmx3RDuMXObASvdFXeUh1GOgd.jpg"
      },
      {
        "id": 1158934,
        "name": "Divyendu Sharma",
        "character": "Phoolchand 'Munna' Tripathi",
        "gender": 2,
        "profile_path": "/rGlCCQtOBiNJULfB5w0FXgPPKw0.jpg"
      },
      {
        "id": 1485519,
        "name": "Jitendra Kumar",
        "character": "Vinay 'Bablu' Pandit",
        "gender": 2,
        "profile_path": "/562Mucw9YaDHUlFBqK5aot3H2lJ.jpg"
      },
      {
        "id": 85882,
        "name": "Ravi Kishan",
        "character": "Babban Babua",
        "gender": 2,
        "profile_path": "/rkUTRk0tuA98RepP9jhgcCbhHqy.jpg"
      }
    ]
  },
  {
    "id": 1108427,
    "title": "Moana",
    "original_title": "Moana",
    "original_language": "en",
    "release_date": "2026-07-08",
    "release_label": "JUL 08",
    "full_release_date": "2026-07-08 (Theatrical)",
    "duration": "1h 55m",
    "runtime": 115,
    "director": "Thomas Kail",
    "production_companies": "Major Studio",
    "vote_average": 7.6,
    "vote_count": 681,
    "poster_path": "/s20ZqOKFqGVWOUtDz9XurwwBoF1.jpg",
    "backdrop_path": "/c6BPbkO5Npt1OdwttAxCFo06wtH.jpg",
    "overview": "Teenage Moana answers the Ocean's call and, for the first time, voyages beyond the reef of her island of Motunui with infamous demigod Maui on an unforgettable journey to restore prosperity to her people.",
    "genre_ids": [
      10751,
      14,
      35,
      12
    ],
    "trailerKey": "EEz5xbzYPKI",
    "ratings": {
      "imdb": "7.6/10",
      "prime": "7.9/10",
      "rottenTomatoes": "84%",
      "tmdb": "7.6/10"
    },
    "cast": [
      {
        "id": 4247263,
        "name": "Catherine Lagaʻaia",
        "character": "Moana",
        "gender": 1,
        "profile_path": "/2KRIRDwy1CtY7Bge3aqVZrORelc.jpg"
      },
      {
        "id": 18918,
        "name": "Dwayne Johnson",
        "character": "Maui",
        "gender": 2,
        "profile_path": "/5QApZVV8FUFlVxQpIK3Ew6cqotq.jpg"
      },
      {
        "id": 7241,
        "name": "Rena Owen",
        "character": "Gramma Tala",
        "gender": 1,
        "profile_path": "/648ZdDBmlx6OFDFRmgAbh6q5LBo.jpg"
      },
      {
        "id": 205406,
        "name": "John Tui",
        "character": "Chief Tui",
        "gender": 2,
        "profile_path": "/2jIc9M5kl2GmK8fZtbtUr2s1jkS.jpg"
      },
      {
        "id": 1753341,
        "name": "Frankie Adams",
        "character": "Sina",
        "gender": 1,
        "profile_path": "/aAUHUSf0lh3OBRoaiCRL9ep8lfL.jpg"
      }
    ]
  },
  {
    "id": 1509599,
    "title": "Gatta Kusthi 2",
    "original_title": "கட்டா குஸ்தி 2",
    "original_language": "ta",
    "release_date": "2026-07-03",
    "release_label": "JUL 03",
    "full_release_date": "2026-07-03 (Theatrical)",
    "duration": "2h 33m",
    "runtime": 153,
    "director": "Chella Ayyavu",
    "production_companies": "KVN Productions",
    "vote_average": 5.7,
    "vote_count": 7,
    "poster_path": "/5U8MWIk9XZ60NALyOTpyX7vXIR7.jpg",
    "backdrop_path": "/nLMUoZn09tjeqae7lzK3x9Wf84V.jpg",
    "overview": "Picks up after the first film, with Veera and Keerthi balancing parenthood and Keerthi's wrestling career, featuring a role reversal where Veera takes on more domestic responsibilities.",
    "genre_ids": [
      35,
      18
    ],
    "trailerKey": "KZ4W78J_PrM",
    "ratings": {
      "imdb": "5.7/10",
      "prime": "6.0/10",
      "rottenTomatoes": "75%",
      "tmdb": "5.7/10"
    },
    "cast": [
      {
        "id": 584250,
        "name": "Vishnu Vishal",
        "character": "Veera",
        "gender": 2,
        "profile_path": "/ce1735USZaHA6w7sacqRDGSy9bL.jpg"
      },
      {
        "id": 1861484,
        "name": "Aishwarya Lekshmi",
        "character": "Keerthi",
        "gender": 1,
        "profile_path": "/b3yxjhc62X0JZghaRTYNMVrI78a.jpg"
      },
      {
        "id": 5226910,
        "name": "Zara Zyanna",
        "character": "Madhi",
        "gender": 0,
        "profile_path": null
      },
      {
        "id": 120949,
        "name": "Karunas",
        "character": "'Mama' Ratnam",
        "gender": 2,
        "profile_path": "/dnh00MeOyiWFQ21l5az3UVJ5rhp.jpg"
      },
      {
        "id": 1336122,
        "name": "Munishkanth",
        "character": "'Chithappa' Ganesan",
        "gender": 2,
        "profile_path": "/n2SjFPNv3EN1ziqfdpyjiEvoqt7.jpg"
      }
    ]
  },
  {
    "id": 1368337,
    "title": "The Odyssey",
    "original_title": "The Odyssey",
    "original_language": "en",
    "release_date": "2026-07-15",
    "release_label": "JUL 15",
    "full_release_date": "2026-07-15 (Theatrical)",
    "duration": "2h 53m",
    "runtime": 173,
    "director": "Christopher Nolan",
    "production_companies": "Major Studio",
    "vote_average": 8.7,
    "vote_count": 3761,
    "poster_path": "/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
    "backdrop_path": "/RMXG8myu1aGlNUsRjtxzmpdMK0.jpg",
    "overview": "Odysseus, the legendary King of Ithaca, embarks on a long and perilous journey home following the Trojan War. Throughout his voyage, he is forced to confront the whims of gods, mythological monsters, and trials that stretch both his cunning and his humanity to the breaking point.",
    "genre_ids": [
      12,
      28,
      14
    ],
    "trailerKey": "AyIZ9tiiN8I",
    "ratings": {
      "imdb": "8.7/10",
      "prime": "9.0/10",
      "rottenTomatoes": "95%",
      "tmdb": "8.7/10"
    },
    "cast": [
      {
        "id": 1892,
        "name": "Matt Damon",
        "character": "Odysseus",
        "gender": 2,
        "profile_path": "/aCvBXTAR9B1qRjIRzMBYhhbm1fR.jpg"
      },
      {
        "id": 1136406,
        "name": "Tom Holland",
        "character": "Telemachus",
        "gender": 2,
        "profile_path": "/5OK84Wn1bIEIThFKcVoaN087mLj.jpg"
      },
      {
        "id": 1813,
        "name": "Anne Hathaway",
        "character": "Penelope",
        "gender": 1,
        "profile_path": "/nbccV2pMoyLTCeg5DQip24Eq0Jp.jpg"
      },
      {
        "id": 11288,
        "name": "Robert Pattinson",
        "character": "Antinous",
        "gender": 2,
        "profile_path": "/3qZ09UE7lN6AtorfXFRYpEtSY93.jpg"
      },
      {
        "id": 1227717,
        "name": "Himesh Patel",
        "character": "Eurylochus",
        "gender": 2,
        "profile_path": "/icqsXLmU0FxBGTv63kkA0GcrecO.jpg"
      }
    ]
  },
  {
    "id": 1441228,
    "title": "Irumudi",
    "original_title": "ఇరుముడి",
    "original_language": "te",
    "release_date": "2026-08-20",
    "release_label": "AUG 20",
    "full_release_date": "2026-08-20 (Theatrical)",
    "duration": "2h 32m",
    "runtime": 152,
    "director": "Shiva Nirvana",
    "production_companies": "Major Studio",
    "vote_average": 6.9,
    "vote_count": 18,
    "poster_path": "/sPePQmJRKkB14sGjB7zBkLJkaTW.jpg",
    "backdrop_path": "/578jrGVEN4a5rxJGtkt9sMI2w6c.jpg",
    "overview": "An alcoholic with a violent past—living peacefully with his daughter beside a waterfall—decides to take Ayyappa Deeksha (a 41-day spiritual vow and period of intense austerity) at her request.",
    "genre_ids": [
      18,
      10751,
      28
    ],
    "trailerKey": "lqlYx4MdsAY",
    "ratings": {
      "imdb": "6.9/10",
      "prime": "7.2/10",
      "rottenTomatoes": "77%",
      "tmdb": "6.9/10"
    },
    "cast": [
      {
        "id": 146935,
        "name": "Ravi Teja",
        "character": "Trinadh Rama Kasu",
        "gender": 2,
        "profile_path": "/5a9g645O30Qzhe3VFjvkhjnNfm2.jpg"
      },
      {
        "id": 5850342,
        "name": "Nakshathra C M",
        "character": "Manikanta / Manamma",
        "gender": 1,
        "profile_path": "/1PxA7kkWPLpqDE0UpLaqhMapYA2.jpg"
      },
      {
        "id": 1900674,
        "name": "Priya Bhavani Shankar",
        "character": "Kaveri",
        "gender": 1,
        "profile_path": "/sX5Ue02f5kzOzVCa0R3dV2yPRmO.jpg"
      },
      {
        "id": 146148,
        "name": "Sai Kumar",
        "character": "Guru Swamy / Goparaju",
        "gender": 2,
        "profile_path": "/Xq5VNf8rPgQF0tuQLjl5YwHPoc.jpg"
      },
      {
        "id": 1289211,
        "name": "Ajay Ghosh",
        "character": "Erraji",
        "gender": 2,
        "profile_path": "/bvexSjSRhZM8ke753Sq1oZf5pxY.jpg"
      }
    ]
  },
  {
    "id": 1036081,
    "title": "Khalifa: The Ruler",
    "original_title": "ഖലീഫ: The Ruler",
    "original_language": "ml",
    "release_date": "2026-08-20",
    "release_label": "AUG 20",
    "full_release_date": "2026-08-20 (Theatrical)",
    "duration": "2h 37m",
    "runtime": 157,
    "director": "Vysakh",
    "production_companies": "Major Studio",
    "vote_average": 7.1,
    "vote_count": 4,
    "poster_path": "/cAl7uuRojdxysptYBj9Mg0czGmI.jpg",
    "backdrop_path": "/6Jz7rnnZrSkgs9ySWUxewpcxr7Q.jpg",
    "overview": "Aamir Ali, a notorious gold smuggling kingpin who inherited his multi-million dollar criminal enterprise from a lineage of gangsters, is drawn into a web of vengeance, legacy and power.",
    "genre_ids": [
      80,
      28
    ],
    "trailerKey": "",
    "ratings": {
      "imdb": "7.1/10",
      "prime": "7.4/10",
      "rottenTomatoes": "79%",
      "tmdb": "7.1/10"
    },
    "cast": [
      {
        "id": 117690,
        "name": "Prithviraj Sukumaran",
        "character": "Aamir Ali",
        "gender": 2,
        "profile_path": "/1xhG42QU8tMQRTDdP1Ed3y9GRvm.jpg"
      },
      {
        "id": 82732,
        "name": "Mohanlal",
        "character": "Mambarakkal Ahmed Ali",
        "gender": 2,
        "profile_path": "/wvoBULQimwguAGPOHZ8TDoy7jBJ.jpg"
      },
      {
        "id": 85045,
        "name": "Neil Nitin Mukesh",
        "character": "Harris Basheer",
        "gender": 2,
        "profile_path": "/7lfd8WfMc2hOXYpCRFwhjiVZ7fl.jpg"
      },
      {
        "id": 1061913,
        "name": "Indrans",
        "character": "Hamsa",
        "gender": 2,
        "profile_path": "/vs5Acy2hJ4dWoM3xRGdnFKdVXzw.jpg"
      },
      {
        "id": 584910,
        "name": "Shammi Thilakan",
        "character": "Raghavan",
        "gender": 2,
        "profile_path": "/7lDFgyfGXbQEFFrbnVA24XaYGW.jpg"
      }
    ]
  },
  {
    "id": 1288445,
    "title": "Mutiny",
    "original_title": "Mutiny",
    "original_language": "en",
    "release_date": "2026-08-19",
    "release_label": "AUG 19",
    "full_release_date": "2026-08-19 (Theatrical)",
    "duration": "1h 36m",
    "runtime": 96,
    "director": "Jean-François Richet",
    "production_companies": "Major Studio",
    "vote_average": 6.6,
    "vote_count": 411,
    "poster_path": "/pu2VxGlpGwffOx292w18b1tv96j.jpg",
    "backdrop_path": "/e2QAGrEmbpmZpMymDRkDisJkvg9.jpg",
    "overview": "After witnessing his billionaire boss' murder and being framed for the crime, Cole Reed boards a cargo ship on a one-man crusade to avenge his boss' death only to discover an international conspiracy.",
    "genre_ids": [
      28,
      53
    ],
    "trailerKey": "2Iqvbe98Gb4",
    "ratings": {
      "imdb": "6.6/10",
      "prime": "6.9/10",
      "rottenTomatoes": "75%",
      "tmdb": "6.6/10"
    },
    "cast": [
      {
        "id": 976,
        "name": "Jason Statham",
        "character": "Cole Reed",
        "gender": 2,
        "profile_path": "/8l6lmrmKFDvhDjMJPj6tBpJdhaA.jpg"
      },
      {
        "id": 82809,
        "name": "Annabelle Wallis",
        "character": "Angie Ellis",
        "gender": 1,
        "profile_path": "/2ZmO2Zz9TcR0rmSJHOkivcu0heR.jpg"
      },
      {
        "id": 141876,
        "name": "Roland Møller",
        "character": "Captain Marko Madsen",
        "gender": 2,
        "profile_path": "/bF7wrJ5mrIhSwyi6ylhyQWj9BoN.jpg"
      },
      {
        "id": 178622,
        "name": "Ramon Tikaram",
        "character": "Tibu Campallo",
        "gender": 2,
        "profile_path": "/wtBLiI8tzeqPLMB9uswkyFhChva.jpg"
      },
      {
        "id": 1156305,
        "name": "Arnas Fedaravičius",
        "character": "Mateo Pineda",
        "gender": 2,
        "profile_path": "/7WfcGugvkuPqEzu0cUJBeJPt1lD.jpg"
      }
    ]
  },
  {
    "id": 1204680,
    "title": "Coyote vs. Acme",
    "original_title": "Coyote vs. Acme",
    "original_language": "en",
    "release_date": "2026-08-20",
    "release_label": "AUG 20",
    "full_release_date": "2026-08-20 (Theatrical)",
    "duration": "1h 43m",
    "runtime": 103,
    "director": "Dave Green",
    "production_companies": "Major Studio",
    "vote_average": 7.5,
    "vote_count": 432,
    "poster_path": "/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg",
    "backdrop_path": "/7GOW6jod9lLurW5utokAatxg7ql.jpg",
    "overview": "After Acme products fail him one too many times in his dogged pursuit of the Roadrunner, Wile E. Coyote decides to hire a billboard lawyer to sue the Acme Corporation.",
    "genre_ids": [
      35,
      12,
      10751
    ],
    "trailerKey": "kMsiD1Nky5I",
    "ratings": {
      "imdb": "7.5/10",
      "prime": "7.8/10",
      "rottenTomatoes": "83%",
      "tmdb": "7.5/10"
    },
    "cast": [
      {
        "id": 62831,
        "name": "Will Forte",
        "character": "Kevin Avery",
        "gender": 2,
        "profile_path": "/4VEzbkL3HwHTUZAPA5PyypFG2U.jpg"
      },
      {
        "id": 1452046,
        "name": "Lana Condor",
        "character": "Paige Avery",
        "gender": 1,
        "profile_path": "/vWn27Fk2GLwH7o9fBG9hBWZI6OR.jpg"
      },
      {
        "id": 56446,
        "name": "John Cena",
        "character": "Buddy Crane",
        "gender": 2,
        "profile_path": "/rgB2eIOt7WyQjdgJCOuESdDlrjg.jpg"
      },
      {
        "id": 1120700,
        "name": "Tone Bell",
        "character": "Sal Maltese",
        "gender": 2,
        "profile_path": "/fB06Xj5FgwvHcZESsNGMupGBTyY.jpg"
      },
      {
        "id": 1572541,
        "name": "Martha Kelly",
        "character": "Dottie Jones",
        "gender": 1,
        "profile_path": "/ac7HoARDIHdYNqpzgJBzpmKHXHR.jpg"
      }
    ]
  },
  {
    "id": 1376856,
    "title": "The Paradise",
    "original_title": "ది ప్యారడైస్",
    "original_language": "te",
    "release_date": "2026-09-23",
    "release_label": "SEP 23",
    "full_release_date": "2026-09-23 (Theatrical)",
    "duration": "2h 45m",
    "runtime": 165,
    "director": "Srikanth Odela",
    "production_companies": "Major Studio",
    "vote_average": 7.1,
    "vote_count": 120,
    "poster_path": "/9k5F5Lk2bUP7ODifk1KP5Vw8yGm.jpg",
    "backdrop_path": "/7AcH5TFppoMusNkCBLaQP6UOODp.jpg",
    "overview": "In 1980s Secunderabad, a marginalized tribe battles discrimination and fights for citizenship under an unexpected leader's guidance, challenging systemic oppression.",
    "genre_ids": [
      28,
      53,
      18
    ],
    "trailerKey": "Y3xewv1ZnHc",
    "ratings": {
      "imdb": "7.1/10",
      "prime": "7.4/10",
      "rottenTomatoes": "79%",
      "tmdb": "7.1/10"
    },
    "cast": [
      {
        "id": 225387,
        "name": "Nani",
        "character": "Jadal Zamana",
        "gender": 2,
        "profile_path": "/jfOH4sUWs3VXuGUlo0VLMYNRBQ4.jpg"
      },
      {
        "id": 2578168,
        "name": "Kayadu Lohar",
        "character": "Subbu",
        "gender": 1,
        "profile_path": "/pHaMPnrfnWvTPZA4IOmZk8BHY0U.jpg"
      },
      {
        "id": 585268,
        "name": "Mohan Babu",
        "character": "Shikanja Maalik",
        "gender": 2,
        "profile_path": "/zwqcXtnk0ju0nhuhvZXSLL2nLIy.jpg"
      },
      {
        "id": 1374676,
        "name": "Raghav Juyal",
        "character": "Vikram Maalik",
        "gender": 2,
        "profile_path": "/ncJa8IBYfDknQLpjeciaQy6dXkH.jpg"
      },
      {
        "id": 78920,
        "name": "Sonali Kulkarni",
        "character": "",
        "gender": 1,
        "profile_path": "/aQeM6N2JgGFbI5VoltWhkxw6OQC.jpg"
      }
    ]
  },
  {
    "id": 1408162,
    "title": "Vishwanath & Sons",
    "original_title": "விஸ்வநாத் & சன்ஸ்",
    "original_language": "ta",
    "release_date": "2026-08-14",
    "release_label": "AUG 14",
    "full_release_date": "2026-08-14 (Theatrical)",
    "duration": "2h 41m",
    "runtime": 161,
    "director": "Venky Atluri",
    "production_companies": "KVN Productions",
    "vote_average": 7.3,
    "vote_count": 26,
    "poster_path": "/adDZVEQZnMJ380zPOmVj6vBWHgk.jpg",
    "backdrop_path": "/nfNaAiiILjYRc2CKkId1ZfPTtlh.jpg",
    "overview": "A celebrated Olympian shooter travels to America looking for a donor to help his sick child — but unexpected romance complicates his search.",
    "genre_ids": [
      18,
      10749,
      35
    ],
    "trailerKey": "",
    "ratings": {
      "imdb": "7.3/10",
      "prime": "7.6/10",
      "rottenTomatoes": "81%",
      "tmdb": "7.3/10"
    },
    "cast": [
      {
        "id": 85720,
        "name": "Suriya",
        "character": "Sanjay 'Sanju' Vishwanath",
        "gender": 2,
        "profile_path": "/hIFXv3gIjlNS78gJmaguEOxvfPH.jpg"
      },
      {
        "id": 2191938,
        "name": "Mamitha Baiju",
        "character": "Madanakameshwari 'Maddy Jay' Jothilingam",
        "gender": 1,
        "profile_path": "/9ySiE3j7ep16fhKi3u5iq5rbOk6.jpg"
      },
      {
        "id": 562177,
        "name": "Radhika Sarathkumar",
        "character": "Nirmala Devi",
        "gender": 1,
        "profile_path": "/kEKzT8HAJw8lfFUtWWd0SoQ9kC9.jpg"
      },
      {
        "id": 123180,
        "name": "Raveena Tandon",
        "character": "Anjali Devi",
        "gender": 1,
        "profile_path": "/4z0X9ZMgyNZRHfJG4G2Z10rhLpu.jpg"
      },
      {
        "id": 2261843,
        "name": "Sunil",
        "character": "Ramu",
        "gender": 0,
        "profile_path": "/w92Vawfw4DcLYSLtUeFTm46KNIe.jpg"
      }
    ]
  },
  {
    "id": 1303331,
    "title": "Dhamaal 4",
    "original_title": "धमाल ४",
    "original_language": "hi",
    "release_date": "2026-07-10",
    "release_label": "JUL 10",
    "full_release_date": "2026-07-10 (Theatrical)",
    "duration": "2h 23m",
    "runtime": 143,
    "director": "Indra Kumar",
    "production_companies": "Major Studio",
    "vote_average": 4.4,
    "vote_count": 11,
    "poster_path": "/5d7hpbefNiuebl5eqP5cRrckVxs.jpg",
    "backdrop_path": "/95sjD0dRajtU6SKD6Gq6PtrGoGY.jpg",
    "overview": "The Dhamaal boys are back for another treasure hunt, facing hilarious challenges in their quest for the Treasure of Life.",
    "genre_ids": [
      35
    ],
    "trailerKey": "Mf8Yiy3FL24",
    "ratings": {
      "imdb": "4.4/10",
      "prime": "4.7/10",
      "rottenTomatoes": "75%",
      "tmdb": "4.4/10"
    },
    "cast": [
      {
        "id": 42803,
        "name": "Ajay Devgn",
        "character": "Guddu",
        "gender": 2,
        "profile_path": "/vnHQQFzTjJ0sv14DGMIoKa3qTxN.jpg"
      },
      {
        "id": 85889,
        "name": "Arshad Warsi",
        "character": "Adi",
        "gender": 2,
        "profile_path": "/1Hv35hhpfwNXNm0DqJxpfNJt1q.jpg"
      },
      {
        "id": 84957,
        "name": "Riteish Deshmukh",
        "character": "Lallan",
        "gender": 2,
        "profile_path": "/b4Mwk9dDgMS82269iBX7V1YsOpu.jpg"
      },
      {
        "id": 86086,
        "name": "Javed Jaffrey",
        "character": "Manav",
        "gender": 2,
        "profile_path": "/5JvPPxLsDEUFy6qDVawM3Itl6NV.jpg"
      },
      {
        "id": 85879,
        "name": "Sanjay Mishra",
        "character": "Johnny",
        "gender": 2,
        "profile_path": "/4MGKohKGU4v9SoXcQKCcC4e4Bpi.jpg"
      }
    ]
  },
  {
    "id": 1137844,
    "title": "Mayday",
    "original_title": "Mayday",
    "original_language": "en",
    "release_date": "2026-09-03",
    "release_label": "SEP 03",
    "full_release_date": "2026-09-03 (Theatrical)",
    "duration": "1h 51m",
    "runtime": 111,
    "director": "Jonathan Goldstein",
    "production_companies": "Major Studio",
    "vote_average": 8.1,
    "vote_count": 655,
    "poster_path": "/hVXjX1jLZ1ljFSNGXpjJfbTUOa7.jpg",
    "backdrop_path": "/g7Ccid5kuD7A8hXWlsQiNfwOxaD.jpg",
    "overview": "When a U.S. Navy pilot on a top-secret mission during the Cold War gets trapped behind enemy lines, his only chance at survival is to form an alliance with an eccentric ex-KGB agent.",
    "genre_ids": [
      28,
      35
    ],
    "trailerKey": "om5Un9X720M",
    "ratings": {
      "imdb": "8.1/10",
      "prime": "8.4/10",
      "rottenTomatoes": "89%",
      "tmdb": "8.1/10"
    },
    "cast": [
      {
        "id": 10859,
        "name": "Ryan Reynolds",
        "character": "Troy Kelly",
        "gender": 2,
        "profile_path": "/trzgptffGvAlAT6MEu01fz47cLW.jpg"
      },
      {
        "id": 11181,
        "name": "Kenneth Branagh",
        "character": "Nikolai Ustinov",
        "gender": 2,
        "profile_path": "/AbCqqFxNi5w3nDUFdQt0DGMFh5H.jpg"
      },
      {
        "id": 591295,
        "name": "Marcin Dorociński",
        "character": "Alexander Volkov",
        "gender": 2,
        "profile_path": "/pyPUnMHxNPKKYxn8PehQJfSbZzO.jpg"
      },
      {
        "id": 2408703,
        "name": "Maria Bakalova",
        "character": "Anna Ustinov",
        "gender": 1,
        "profile_path": "/vCz0ycZr1PgJVOAeS29fIiZE8pN.jpg"
      },
      {
        "id": 52,
        "name": "David Morse",
        "character": "Harold Kelly",
        "gender": 2,
        "profile_path": "/A6zGbkFjM3uajIakgsSeNTmSKqY.jpg"
      }
    ]
  },
  {
    "id": 980431,
    "title": "Avatar Aang: The Last Airbender",
    "original_title": "Avatar Aang: The Last Airbender",
    "original_language": "en",
    "release_date": "2026-07-24",
    "release_label": "JUL 24",
    "full_release_date": "2026-07-24 (Theatrical)",
    "duration": "1h 39m",
    "runtime": 99,
    "director": "Lauren Montgomery",
    "production_companies": "Major Studio",
    "vote_average": 9.6,
    "vote_count": 1148,
    "poster_path": "/3sgnSfNT27Bx5O5ukr7B26mhEQq.jpg",
    "backdrop_path": "/ezbrL1dMymKQZw7mDEWa2ZTzN7d.jpg",
    "overview": "Avatar Aang, the world's last Airbender, learns of an ancient power that could save his culture from extinction. With the help of his friends, he embarks on a global quest to find it before it falls into the wrong hands and threatens to upend the peace they sacrificed everything to achieve.",
    "genre_ids": [
      16,
      12,
      14,
      28
    ],
    "trailerKey": "7b20GRFZBFE",
    "ratings": {
      "imdb": "9.6/10",
      "prime": "9.9/10",
      "rottenTomatoes": "96%",
      "tmdb": "9.6/10"
    },
    "cast": [
      {
        "id": 1610783,
        "name": "Eric Nam",
        "character": "Aang (voice)",
        "gender": 2,
        "profile_path": "/gEH0b5q9tupL49dmUFkjm9dnxP2.jpg"
      },
      {
        "id": 543530,
        "name": "Dave Bautista",
        "character": "Tagah (voice)",
        "gender": 2,
        "profile_path": "/snk6JiXOOoRjPtHU5VMoy6qbd32.jpg"
      },
      {
        "id": 1703912,
        "name": "Jessica Matten",
        "character": "Katara (voice)",
        "gender": 1,
        "profile_path": "/EQsPxsav8AZmaeT3mpU3Evilee.jpg"
      },
      {
        "id": 2775164,
        "name": "Román Zaragoza",
        "character": "Sokka (voice)",
        "gender": 2,
        "profile_path": "/uWkOkSLqj2POMqkeLk5E5UJzebv.jpg"
      },
      {
        "id": 215055,
        "name": "Steven Yeun",
        "character": "Zuko (voice)",
        "gender": 2,
        "profile_path": "/fOMFO2Xx4duzpNgS9Q5ytO44yGb.jpg"
      }
    ]
  },
  {
    "id": 1489543,
    "title": "G.D.N",
    "original_title": "ஜி.டி.என்",
    "original_language": "ta",
    "release_date": "2026-08-07",
    "release_label": "AUG 07",
    "full_release_date": "2026-08-07 (Theatrical)",
    "duration": "2h 27m",
    "runtime": 147,
    "director": "Krishnakumar Ramakumar",
    "production_companies": "KVN Productions",
    "vote_average": 7.1,
    "vote_count": 1,
    "poster_path": "/aAbvbKbNU6YyYDZ5ntSQcOygliw.jpg",
    "backdrop_path": "/hR0QpzOO2Gx1Lt7KxqKFWZvj5Vl.jpg",
    "overview": "G.D. Naidu overcomes challenges and defies a repressive colonial regime to become one of India's greatest innovators.",
    "genre_ids": [
      18
    ],
    "trailerKey": "DC11NRrn9Vc",
    "ratings": {
      "imdb": "7.1/10",
      "prime": "7.4/10",
      "rottenTomatoes": "79%",
      "tmdb": "7.1/10"
    },
    "cast": [
      {
        "id": 85519,
        "name": "R. Madhavan",
        "character": "GD Naidu",
        "gender": 2,
        "profile_path": "/gaDrAdXxIrbBRCd9cX8YvJDEuLb.jpg"
      },
      {
        "id": 1107197,
        "name": "Priyamani",
        "character": "Chellammal",
        "gender": 1,
        "profile_path": "/grcW2eMm77Q2Kj1xX0HvZlRpGRR.jpg"
      },
      {
        "id": 581895,
        "name": "Sathyaraj",
        "character": "Ramaiah Pillai",
        "gender": 2,
        "profile_path": "/lnlBZ7V3K3Z3OIsjCd0zkKx26L3.jpg"
      },
      {
        "id": 141704,
        "name": "Jayaram",
        "character": "Ambalapara Krishnan",
        "gender": 2,
        "profile_path": "/cc1SfVFctuYH353NgxXNBoAFX2d.jpg"
      },
      {
        "id": 1974753,
        "name": "Dushara Vijayan",
        "character": "Ranganayaki",
        "gender": 1,
        "profile_path": "/5C5V9qdYil7LVCp8LqctZCEsu1n.jpg"
      }
    ]
  },
  {
    "id": 1442396,
    "title": "Nagabandham: The Secret Treasure",
    "original_title": "నాగబంధం",
    "original_language": "te",
    "release_date": "2026-07-02",
    "release_label": "JUL 02",
    "full_release_date": "2026-07-02 (Theatrical)",
    "duration": "3h 16m",
    "runtime": 196,
    "director": "Abhishek Nama",
    "production_companies": "Major Studio",
    "vote_average": 5.1,
    "vote_count": 4,
    "poster_path": "/fsiQ0twZbmbLo0F2CDUt44riRxL.jpg",
    "backdrop_path": "/bZLEd10wI75F7u8eZKwi8WCZtFe.jpg",
    "overview": "A chosen warrior protects a mystical, serpent-bound Himalayan temple from those seeking to steal the power of the Brahma Kamalam, a divine relic.",
    "genre_ids": [
      18,
      14,
      28
    ],
    "trailerKey": "",
    "ratings": {
      "imdb": "5.1/10",
      "prime": "5.4/10",
      "rottenTomatoes": "75%",
      "tmdb": "5.1/10"
    },
    "cast": [
      {
        "id": 4254066,
        "name": "Virat Karrna",
        "character": "Rudhra",
        "gender": 0,
        "profile_path": null
      },
      {
        "id": 1559686,
        "name": "Nabha Natesh",
        "character": "Parvathi",
        "gender": 1,
        "profile_path": "/3aIzQiJlV9CQDINd6PxXCexShca.jpg"
      },
      {
        "id": 2252345,
        "name": "Daksha Nagarkar",
        "character": "Priyamani",
        "gender": 1,
        "profile_path": "/vnYsR2Vynqx21pMwRBCxm0CsUmh.jpg"
      },
      {
        "id": 1587861,
        "name": "Anasuya Bharadwaj",
        "character": "Leelavathi",
        "gender": 1,
        "profile_path": "/cZMxb2I5XZHVrRG9RrpbffFxTuZ.jpg"
      },
      {
        "id": 85456,
        "name": "Mahesh Manjrekar",
        "character": "Suvarna",
        "gender": 2,
        "profile_path": "/4lFytre6m4SruIUpUIoyNjsMo7F.jpg"
      }
    ]
  },
  {
    "id": 1355228,
    "title": "Gandhari",
    "original_title": "गांधारी",
    "original_language": "hi",
    "release_date": "2026-09-03",
    "release_label": "SEP 03",
    "full_release_date": "2026-09-03 (Theatrical)",
    "duration": "1h 57m",
    "runtime": 117,
    "director": "Devashish Makhija",
    "production_companies": "Major Studio",
    "vote_average": 5.7,
    "vote_count": 9,
    "poster_path": "/aF3IhwS1mrVfvM9OMXmTaXAT0l8.jpg",
    "backdrop_path": "/sT5WVT8LzvDwIbfy9BGXK0fvf3s.jpg",
    "overview": "When a mother loses her eyesight and her daughter in a kidnapping, she takes matters into her own hands to hunt down those responsible.",
    "genre_ids": [
      28,
      18,
      53
    ],
    "trailerKey": "TRyBiPD1bUc",
    "ratings": {
      "imdb": "5.7/10",
      "prime": "6.0/10",
      "rottenTomatoes": "75%",
      "tmdb": "5.7/10"
    },
    "cast": [
      {
        "id": 550167,
        "name": "Taapsee Pannu",
        "character": "Bani",
        "gender": 1,
        "profile_path": "/43e24aeOC8AZITo6ShaKKG9aV0Y.jpg"
      },
      {
        "id": 1424750,
        "name": "Ishwak Singh",
        "character": "Gokul",
        "gender": 2,
        "profile_path": "/iN1QUGzN7c4qBps3xpuWYVzpMag.jpg"
      },
      {
        "id": 1140663,
        "name": "Mita Vashisht",
        "character": "",
        "gender": 1,
        "profile_path": "/mcnaQTCmuz3lXNotFFdkwCO7FTY.jpg"
      },
      {
        "id": 1144344,
        "name": "Swastika Mukherjee",
        "character": "",
        "gender": 1,
        "profile_path": "/xjEdXwco3KjWU7zFDhJgMJYmerh.jpg"
      },
      {
        "id": 1550351,
        "name": "Chhaya Kadam",
        "character": "",
        "gender": 1,
        "profile_path": "/umOPkpPA4JUWLkVziYU5GF6gELD.jpg"
      }
    ]
  },
  {
    "id": 1542187,
    "title": "Varavu",
    "original_title": "വരവ്",
    "original_language": "ml",
    "release_date": "2026-07-16",
    "release_label": "JUL 16",
    "full_release_date": "2026-07-16 (Theatrical)",
    "duration": "2h 23m",
    "runtime": 143,
    "director": "Shaji Kailas",
    "production_companies": "Major Studio",
    "vote_average": 4.8,
    "vote_count": 2,
    "poster_path": "/xUBo6JBHGV52xbfPwg3xxyvBLPx.jpg",
    "backdrop_path": "/321ed6TvXWw5Y6SRcFF2DuAgpjC.jpg",
    "overview": "A family falls victim to the powerful elite in a small town. One man's return forces a confrontation that will expose decades of lies and corruption",
    "genre_ids": [
      28,
      53
    ],
    "trailerKey": "aQ7tTufi63s",
    "ratings": {
      "imdb": "4.8/10",
      "prime": "5.1/10",
      "rottenTomatoes": "75%",
      "tmdb": "4.8/10"
    },
    "cast": [
      {
        "id": 1357376,
        "name": "Joju George",
        "character": "Paulson",
        "gender": 2,
        "profile_path": "/jCObRH5idadzrTvyC9XnlnR8rXH.jpg"
      },
      {
        "id": 1061905,
        "name": "Murali Gopy",
        "character": "Medayil Kochettan",
        "gender": 2,
        "profile_path": "/oNEKhIL7PmE6yXzOcaVNGqPMnmw.jpg"
      },
      {
        "id": 1440952,
        "name": "Arjun Ashokan",
        "character": "Williams \"Willy\"",
        "gender": 2,
        "profile_path": "/fA9V9ImvGlLGQ9HWB68j8d8eo0J.jpg"
      },
      {
        "id": 584238,
        "name": "Sukanya",
        "character": "Sister Daisy",
        "gender": 1,
        "profile_path": "/q15g0PQN0sCtMN82aU0sPYGtW8D.jpg"
      },
      {
        "id": 1274871,
        "name": "Deepak Parambol",
        "character": "Seban",
        "gender": 2,
        "profile_path": "/ri2gQM9o9MmcZQZjjq6pQmdbIxb.jpg"
      }
    ]
  },
  {
    "id": 1215812,
    "title": "Karavali",
    "original_title": "ಕರಾವಳಿ",
    "original_language": "kn",
    "release_date": "2026-07-24",
    "release_label": "JUL 24",
    "full_release_date": "2026-07-24 (Theatrical)",
    "duration": "2h 20m",
    "runtime": 140,
    "director": "Gurudatha Ganiga",
    "production_companies": "Major Studio",
    "vote_average": 9.5,
    "vote_count": 1,
    "poster_path": "/buxVz5LZQY1QLfFIIZnfe6t2F4I.jpg",
    "backdrop_path": "/tKBoVyOMrL0xp6NtBZEHcxthLfZ.jpg",
    "overview": "Karavali is a film that explores the struggles between man and nature, set against the raw, untamed beauty of coastal Karnataka. The story revolves around the world of Kambala, a traditional annual buffalo race, showcasing the unique culture and challenges of the region.",
    "genre_ids": [
      28,
      18,
      12,
      53
    ],
    "trailerKey": "TGYTlowY0zM",
    "ratings": {
      "imdb": "9.5/10",
      "prime": "9.8/10",
      "rottenTomatoes": "96%",
      "tmdb": "9.5/10"
    },
    "cast": [
      {
        "id": 1859636,
        "name": "Prajwal Devaraj",
        "character": "Dhananjaya aka Dhana",
        "gender": 2,
        "profile_path": "/8zmHfxisRn5kkQOPR09z1cm5YmX.jpg"
      },
      {
        "id": 1906560,
        "name": "Raj B Shetty",
        "character": "Maveera",
        "gender": 2,
        "profile_path": "/vlNvrGhaYzmRxhkd4GOKFNfSkHY.jpg"
      },
      {
        "id": 3403383,
        "name": "Sampada Hulivana",
        "character": "Dakshina",
        "gender": 0,
        "profile_path": null
      },
      {
        "id": 2262422,
        "name": "Ramesh Indira",
        "character": "Doddavru",
        "gender": 0,
        "profile_path": null
      },
      {
        "id": 2071782,
        "name": "Mithra",
        "character": "Maabla",
        "gender": 0,
        "profile_path": null
      }
    ]
  },
  {
    "id": 1538457,
    "title": "Meesaya Murukku 2",
    "original_title": "மீசைய முறுக்கு 2",
    "original_language": "ta",
    "release_date": "2026-09-25",
    "release_label": "SEP 25",
    "full_release_date": "2026-09-25 (Theatrical)",
    "duration": "2h 20m",
    "runtime": 140,
    "director": "HipHop Tamizha Adhi",
    "production_companies": "KVN Productions",
    "vote_average": 7.2,
    "vote_count": 120,
    "poster_path": "/qD1QwmInB9ezd2peVb5EbhaM4Mo.jpg",
    "backdrop_path": "/8iG6naruSFn4CuSWB01F0JuImCc.jpg",
    "overview": "After facing rejection in love and getting into a fight, Jeeva learns about his father Siva's struggles and sacrifices. Inspired by his grandfather's legacy and father's dedication, Jeeva changes his outlook and works hard toward his musical dream. Through determination and perseverance, Jeeva earns recognition in the music industry and brings pride to his family.",
    "genre_ids": [
      35,
      10749,
      18
    ],
    "trailerKey": "",
    "ratings": {
      "imdb": "7.2/10",
      "prime": "7.5/10",
      "rottenTomatoes": "80%",
      "tmdb": "7.2/10"
    },
    "cast": [
      {
        "id": 1414019,
        "name": "HipHop Tamizha Adhi",
        "character": "Jeeva/Tiger Shiva",
        "gender": 2,
        "profile_path": "/k2oEkE6Du42QpDn8Ss6dphr5nll.jpg"
      },
      {
        "id": 2994489,
        "name": "Ketika Sharma",
        "character": "Laila",
        "gender": 1,
        "profile_path": "/jvElVKGhzwMUFNNxijYCK8pubdW.jpg"
      },
      {
        "id": 2488387,
        "name": "Chaithra J Achar",
        "character": "Latchumi",
        "gender": 1,
        "profile_path": "/mCpqijk7HhguNYcffPhprGVHts5.jpg"
      },
      {
        "id": 4446230,
        "name": "Ramya Ranganathan",
        "character": "Vaani",
        "gender": 1,
        "profile_path": "/8yRztudKzhaigLfiIgPcSHTZFvg.jpg"
      },
      {
        "id": 4492069,
        "name": "Harshath Khan",
        "character": "",
        "gender": 0,
        "profile_path": "/kE3DLC2XkpRAnuHOZq6YnaJrU9g.jpg"
      }
    ]
  },
  {
    "id": 1250502,
    "title": "I'm Game",
    "original_title": "ഐ ആം ഗെയിം",
    "original_language": "ml",
    "release_date": "2026-09-03",
    "release_label": "SEP 03",
    "full_release_date": "2026-09-03 (Theatrical)",
    "duration": "2h 53m",
    "runtime": 173,
    "director": "Nahas Hidayath",
    "production_companies": "Major Studio",
    "vote_average": 8.1,
    "vote_count": 1,
    "poster_path": "/h1ezPKcMYv5FHbHDuHcZfTbWTY5.jpg",
    "backdrop_path": "/z8PMsnvYs2t3fmKpK1ZYPMz4QQ9.jpg",
    "overview": "A fearless gambler who trusts luck more than life gets caught in a series of crazy and unexpected events that turn his world upside down.",
    "genre_ids": [
      28,
      53,
      18
    ],
    "trailerKey": "",
    "ratings": {
      "imdb": "8.1/10",
      "prime": "8.4/10",
      "rottenTomatoes": "89%",
      "tmdb": "8.1/10"
    },
    "cast": [
      {
        "id": 1115225,
        "name": "Dulquer Salmaan",
        "character": "Dan John",
        "gender": 2,
        "profile_path": "/cKngC3leAnZRXTzg0N8N2DYn4HY.jpg"
      },
      {
        "id": 2578168,
        "name": "Kayadu Lohar",
        "character": "Isha",
        "gender": 1,
        "profile_path": "/pHaMPnrfnWvTPZA4IOmZk8BHY0U.jpg"
      },
      {
        "id": 1758913,
        "name": "Antony Varghese",
        "character": "Vignesh 'Vicky' Das",
        "gender": 2,
        "profile_path": "/dKRa8ghSXw6J1OTcxMziZh3l1jb.jpg"
      },
      {
        "id": 560039,
        "name": "Mysskin",
        "character": "David Abraham",
        "gender": 2,
        "profile_path": "/2g65eG5FBh9oOMAhxpfk5T6um6A.jpg"
      },
      {
        "id": 1044337,
        "name": "Kathir",
        "character": "Jason Antony",
        "gender": 2,
        "profile_path": "/cQNlW5ztPIANrUNRos81cxZuZe5.jpg"
      }
    ]
  },
  {
    "id": 1101412,
    "title": "Fall 2: Deadpoint",
    "original_title": "Fall 2: Deadpoint",
    "original_language": "en",
    "release_date": "2026-09-01",
    "release_label": "SEP 01",
    "full_release_date": "2026-09-01 (Theatrical)",
    "duration": "1h 38m",
    "runtime": 98,
    "director": "Michael Spierig",
    "production_companies": "Major Studio",
    "vote_average": 7.3,
    "vote_count": 37,
    "poster_path": "/fgSm5ylwiXbIHn8UbUXDjk9RRu4.jpg",
    "backdrop_path": "/yBDxqDB29kpH9VojTytjGWBgmdJ.jpg",
    "overview": "On a perilous climb across Thailand's Mount Kwan, two climbers become trapped thousands of feet above the ground, where vertigo-inducing heights, sheer exposure, and impossible odds turn every moment into a fight for survival.",
    "genre_ids": [
      53
    ],
    "trailerKey": "Krs0VDIjhmE",
    "ratings": {
      "imdb": "7.3/10",
      "prime": "7.6/10",
      "rottenTomatoes": "81%",
      "tmdb": "7.3/10"
    },
    "cast": [
      {
        "id": 2480853,
        "name": "Harriet Slater",
        "character": "Jax Hunter",
        "gender": 1,
        "profile_path": "/9BJxdhi4tuiQdgT8bfDuiPipnsx.jpg"
      },
      {
        "id": 3486664,
        "name": "Arsema Thomas",
        "character": "Luce",
        "gender": 1,
        "profile_path": "/lvzhZIbkWIVLSRHsOICs9o37g2I.jpg"
      },
      {
        "id": 1626604,
        "name": "Tom Brittney",
        "character": "Jon Platt",
        "gender": 2,
        "profile_path": "/qSe3SuZHVPR5AMOuOAGxLdD6kYv.jpg"
      },
      {
        "id": 1279279,
        "name": "Virginia Gardner",
        "character": "Shiloh Hunter",
        "gender": 1,
        "profile_path": "/1DnNysK267b0te48KCkUlTKoTzj.jpg"
      },
      {
        "id": 521673,
        "name": "Sahajak Boonthanakit",
        "character": "Thai Barman",
        "gender": 2,
        "profile_path": "/a36MI02S0f11bJZjBoxkZTsUDAK.jpg"
      }
    ]
  },
  {
    "id": 1185806,
    "title": "PAW Patrol: The Dino Movie",
    "original_title": "PAW Patrol: The Dino Movie",
    "original_language": "en",
    "release_date": "2026-07-23",
    "release_label": "JUL 23",
    "full_release_date": "2026-07-23 (Theatrical)",
    "duration": "1h 28m",
    "runtime": 88,
    "director": "Cal Brunker",
    "production_companies": "Major Studio",
    "vote_average": 8,
    "vote_count": 115,
    "poster_path": "/qnin56Syy5rbG7KCaxWY7SPuy6p.jpg",
    "backdrop_path": "/6TSxLmwT7j1ugtKi8NyMmdzWAGj.jpg",
    "overview": "The Paw Patrol lands on a mysterious dinosaur island after a storm, where they meet Rex, a stranded pup. When Humdinger's reckless mining triggers a volcano, the team faces their biggest rescue mission yet to save the island.",
    "genre_ids": [
      16,
      12,
      10751,
      14,
      35
    ],
    "trailerKey": "xgI5iYmOf5Q",
    "ratings": {
      "imdb": "8.0/10",
      "prime": "8.3/10",
      "rottenTomatoes": "88%",
      "tmdb": "8.0/10"
    },
    "cast": [
      {
        "id": 3572176,
        "name": "Carter Young",
        "character": "Marshall (voice)",
        "gender": 2,
        "profile_path": "/ezkMRnYOjsYXrcwHEJ2JIDWTJJq.jpg"
      },
      {
        "id": 1172108,
        "name": "Mckenna Grace",
        "character": "Skye (voice)",
        "gender": 1,
        "profile_path": "/sK0CVa56IIpFhCDrcXSTqPWxNbx.jpg"
      },
      {
        "id": 53256,
        "name": "Terry Crews",
        "character": "Alistair Stonewall (voice)",
        "gender": 2,
        "profile_path": "/pxTY4SglLo5hFcMH00MxPeC5u55.jpg"
      },
      {
        "id": 63606,
        "name": "Meredith MacNeill",
        "character": "Harper Cutlass (voice)",
        "gender": 1,
        "profile_path": "/jcJq5Af7KSleMFVhrla5xbv8TOg.jpg"
      },
      {
        "id": 1227611,
        "name": "Ron Pardo",
        "character": "Mayor Humdinger (voice)",
        "gender": 2,
        "profile_path": "/hE4QOBmPqstfmBVXmlcJmsljUMw.jpg"
      }
    ]
  },
  {
    "id": 1423191,
    "title": "Resident Evil",
    "original_title": "Resident Evil",
    "original_language": "en",
    "release_date": "2026-09-16",
    "release_label": "SEP 16",
    "full_release_date": "2026-09-16 (Theatrical)",
    "duration": "1h 34m",
    "runtime": 94,
    "director": "Zach Cregger",
    "production_companies": "Major Studio",
    "vote_average": 8.1,
    "vote_count": 57,
    "poster_path": "/i7UyjfPio0VFHB9rBUZSFyhOoM8.jpg",
    "backdrop_path": "/1CIaRYKf3zg2Xyce1CSfCMg2Vfw.jpg",
    "overview": "A hapless medical courier fights for his life amid an outbreak of a deadly mutagenic virus in an isolated mountain town.",
    "genre_ids": [
      27,
      878,
      12
    ],
    "trailerKey": "mNd1gb19A-c",
    "ratings": {
      "imdb": "8.1/10",
      "prime": "8.4/10",
      "rottenTomatoes": "89%",
      "tmdb": "8.1/10"
    },
    "cast": [
      {
        "id": 148992,
        "name": "Austin Abrams",
        "character": "Bryan",
        "gender": 2,
        "profile_path": "/5S7ahFPQk4NUh8GTwp8zZlUQNFs.jpg"
      },
      {
        "id": 1838225,
        "name": "Zach Cherry",
        "character": "Dave",
        "gender": 2,
        "profile_path": "/fT3Wv8ef0Vn0daHWAObCp2Bd4Y.jpg"
      },
      {
        "id": 3119545,
        "name": "Kali Reis",
        "character": "Pauline",
        "gender": 1,
        "profile_path": "/ruLDXHnKA4aHEQCcFGDAJ7bLTdt.jpg"
      },
      {
        "id": 1294982,
        "name": "Paul Walter Hauser",
        "character": "Carl",
        "gender": 2,
        "profile_path": "/hXjjbYg1Ah8mFf5ZcaakyXzDKMx.jpg"
      },
      {
        "id": 1169291,
        "name": "Johnno Wilson",
        "character": "Max",
        "gender": 2,
        "profile_path": "/eZtBoBE0F7Qb9ZyNpacMOQtmWnM.jpg"
      }
    ]
  },
  {
    "id": 1212763,
    "title": "Evil Dead Burn",
    "original_title": "Evil Dead Burn",
    "original_language": "en",
    "release_date": "2026-07-07",
    "release_label": "JUL 07",
    "full_release_date": "2026-07-07 (Theatrical)",
    "duration": "1h 50m",
    "runtime": 110,
    "director": "Sébastien Vaniček",
    "production_companies": "Major Studio",
    "vote_average": 7.8,
    "vote_count": 1536,
    "poster_path": "/uRxrNXQWkHoENm3nwVOZDYSCx2F.jpg",
    "backdrop_path": "/o0jkkpcN81QqSl8DMLScBCXyUH9.jpg",
    "overview": "After her husband's abrupt death, Alice seeks solace with his remaining family — descendants of a leading researcher on demonic possession. As her in-laws transform one by one into creatures that feed on fear, she comes to discover that the vows she took in life survive even in death.",
    "genre_ids": [
      27
    ],
    "trailerKey": "RddZObTlmA8",
    "ratings": {
      "imdb": "7.8/10",
      "prime": "8.1/10",
      "rottenTomatoes": "86%",
      "tmdb": "7.8/10"
    },
    "cast": [
      {
        "id": 2037046,
        "name": "Souheila Yacoub",
        "character": "Alice",
        "gender": 1,
        "profile_path": "/A233BHgXw0dzbeOpvHfJwL9gLy1.jpg"
      },
      {
        "id": 33310,
        "name": "Tandi Wright",
        "character": "Susan",
        "gender": 1,
        "profile_path": "/xLQ9j4pJ46HZhs5jMJ87w9zjv82.jpg"
      },
      {
        "id": 1911865,
        "name": "Hunter Doohan",
        "character": "Joseph",
        "gender": 2,
        "profile_path": "/ihno5ut6ha8TaubQFgl5Ozco2K1.jpg"
      },
      {
        "id": 1399806,
        "name": "Luciane Buchanan",
        "character": "Thya",
        "gender": 1,
        "profile_path": "/9fTzSU4310StDoO9T0nQyGOLurn.jpg"
      },
      {
        "id": 150396,
        "name": "Erroll Shand",
        "character": "Edgar",
        "gender": 2,
        "profile_path": "/75nc5lUcp1So9RTNNr08NZ0oQDG.jpg"
      }
    ]
  }
];

export const THEATRICAL_COMING_SOON = [
  {
    "id": 1153399,
    "title": "Coolie",
    "original_language": "ta",
    "release_date": "2025-08-13",
    "release_label": "MAY 01",
    "duration": "2h 45m",
    "director": "Lokesh Kanagaraj",
    "music_director": "Anirudh Ravichander",
    "producers": "Kalanithi Maran (Sun Pictures)",
    "vote_average": 6.2,
    "vote_count": 95,
    "poster_path": "/kr36awqmziEI5mfUElsHB0pj9zP.jpg",
    "backdrop_path": "/bLn0CPzrrqFLicjNTgrzaIyE0gZ.jpg",
    "overview": "Deva, once living a quiet life, is shaken when his close friend dies under suspicious circumstances. Determined to uncover the truth, he infiltrates a powerful gang operating in the shadows. As he investigates, Deva becomes entangled in a dangerous web of crime, betrayal, and secrets from his own past, forcing him to confront powerful enemies while protecting the ones he loves.",
    "genre_ids": [
      28,
      80,
      53
    ],
    "trailerKey": "6xqNk5Sf5jo",
    "runtime": 170,
    "cast": [
      {
        "id": 91555,
        "name": "Rajinikanth",
        "character": "Devaraj 'Deva'",
        "order": 0
      },
      {
        "id": 149958,
        "name": "Nagarjuna Akkineni",
        "character": "Simon",
        "order": 1
      },
      {
        "id": 1470729,
        "name": "Soubin Shahir",
        "character": "Dhayal/Dilip",
        "order": 2
      },
      {
        "id": 1054336,
        "name": "Upendra",
        "character": "Kaleesha",
        "order": 3
      },
      {
        "id": 85883,
        "name": "Shruti Haasan",
        "character": "Preeti",
        "order": 4
      },
      {
        "id": 581895,
        "name": "Sathyaraj",
        "character": "Rajasekar",
        "order": 5
      },
      {
        "id": 52763,
        "name": "Aamir Khan",
        "character": "Dahaa",
        "order": 6
      },
      {
        "id": 1840670,
        "name": "Rachita Ram",
        "character": "Kalyani",
        "order": 7
      }
    ]
  },
  {
    "id": 1020354,
    "title": "Viduthalai: Part II",
    "original_language": "ta",
    "release_date": "2024-12-20",
    "release_label": "DEC 20",
    "duration": "2h 30m",
    "director": "Vetrimaaran",
    "music_director": "Ilaiyaraaja",
    "producers": "Elred Kumar",
    "vote_average": 6.9,
    "vote_count": 21,
    "poster_path": "/l2LVYzhCuwfPfN80v6lic55DIAc.jpg",
    "backdrop_path": "/223v5btruh9KfS0m4eVj9BnEWBn.jpg",
    "overview": "Troubles worsen for Kumaresan after the capture of Perumal, and soon he is confronted with having to make a choice between performing his duties as a police constable, or taking a stand for what is right.",
    "genre_ids": [
      18,
      28,
      80
    ],
    "trailerKey": "HOxXrrwa_8o",
    "runtime": 172,
    "cast": [
      {
        "id": 1123766,
        "name": "Vijay Sethupathi",
        "character": "Perumal \"Vaathiyaar\"",
        "order": 0
      },
      {
        "id": 544897,
        "name": "Soori",
        "character": "Kumaresan",
        "order": 1
      },
      {
        "id": 1178639,
        "name": "Manju Warrier",
        "character": "Mahalakshmi",
        "order": 2
      },
      {
        "id": 550166,
        "name": "Kishore",
        "character": "KK",
        "order": 3
      },
      {
        "id": 2036697,
        "name": "Bhavani Sre",
        "character": "Tamilarasi",
        "order": 4
      },
      {
        "id": 120953,
        "name": "Gautham Vasudev Menon",
        "character": "Sunil Menon",
        "order": 5
      },
      {
        "id": 139896,
        "name": "Rajiv Menon",
        "character": "A. Subramaniyan",
        "order": 6
      },
      {
        "id": 586621,
        "name": "Bose Venkat",
        "character": "Zamindar",
        "order": 7
      }
    ]
  },
  {
    "id": 1259024,
    "title": "Good Bad Ugly",
    "original_language": "ta",
    "release_date": "2025-04-09",
    "release_label": "JAN 10",
    "duration": "2h 38m",
    "director": "Adhik Ravichandran",
    "music_director": "Devi Sri Prasad",
    "producers": "Mythri Movie Makers",
    "vote_average": 5.9,
    "vote_count": 31,
    "poster_path": "/8DbYYluzdiGDAZzsaP7DWGbwfLd.jpg",
    "backdrop_path": "/16tXEu1C3GCZZ0uPcA91DlWINbj.jpg",
    "overview": "AK, a powerful gangster, surrenders to the police, in hopes that his wife and son will live a peaceful life. When he is released 17 years later, he learns that his son is falsely accused of serious crimes. To protect him, he is forced to go back to his old ways, facing enemies, both old and new.",
    "genre_ids": [
      28,
      53,
      80
    ],
    "trailerKey": "OEHA-cE-FMQ",
    "runtime": 139,
    "cast": [
      {
        "id": 148360,
        "name": "Ajith Kumar",
        "character": "AK 'Red Dragon'",
        "order": 0
      },
      {
        "id": 116925,
        "name": "Trisha Krishnan",
        "character": "Ramya",
        "order": 1
      },
      {
        "id": 2483439,
        "name": "Arjun Das",
        "character": "Johnny / Jammy",
        "order": 2
      },
      {
        "id": 213428,
        "name": "Sunil Varma",
        "character": "'Baby' Tyson",
        "order": 3
      },
      {
        "id": 85722,
        "name": "Prabhu",
        "character": "Jayaprakash",
        "order": 4
      },
      {
        "id": 223160,
        "name": "Prasanna",
        "character": "Jaeger",
        "order": 5
      },
      {
        "id": 86014,
        "name": "Jackie Shroff",
        "character": "Babel",
        "order": 6
      },
      {
        "id": 4444704,
        "name": "Karthikeya Dev",
        "character": "Vihaan",
        "order": 7
      }
    ]
  },
  {
    "id": 1045021,
    "title": "Thug Life",
    "original_language": "ta",
    "release_date": "2025-06-04",
    "release_label": "JUN 05",
    "duration": "2h 40m",
    "director": "Mani Ratnam",
    "music_director": "A. R. Rahman",
    "producers": "Kamal Haasan, Mani Ratnam, R. Mahendran",
    "vote_average": 5,
    "vote_count": 27,
    "poster_path": "/jH2wFFESmlPgfqO5LgCMVFJymFY.jpg",
    "backdrop_path": "/xI3c07VIq7WIYswXLFshNRvkmo.jpg",
    "overview": "In a world ruled by crime and betrayal, mafia kingpin Sakthivel and his brother Manikkam rescue a young boy, Amaran, during a violent police shootout and raise him as their own. Years later, when an assassination attempt shakes Sakthivel's empire, suspicion turns inward. Consumed by vengeance, Sakthivel sets out to destroy the very family he once built.",
    "genre_ids": [
      28,
      18,
      80
    ],
    "trailerKey": "VChwoluq5-s",
    "runtime": 165,
    "cast": [
      {
        "id": 93193,
        "name": "Kamal Haasan",
        "character": "Rangaraya Sakthivel",
        "order": 0
      },
      {
        "id": 222760,
        "name": "Silambarasan",
        "character": "Amaran",
        "order": 1
      },
      {
        "id": 116925,
        "name": "Trisha Krishnan",
        "character": "Indrani",
        "order": 2
      },
      {
        "id": 584496,
        "name": "Abhirami",
        "character": "Jeeva",
        "order": 3
      },
      {
        "id": 1187398,
        "name": "Ashok Selvan",
        "character": "Jaikumar Royappa",
        "order": 4
      },
      {
        "id": 1861484,
        "name": "Aishwarya Lekshmi",
        "character": "Anna / Chandra",
        "order": 5
      },
      {
        "id": 130111,
        "name": "Nassar",
        "character": "Manikkam",
        "order": 6
      },
      {
        "id": 1357376,
        "name": "Joju George",
        "character": "Kanjirapally Pathros",
        "order": 7
      }
    ]
  },
  {
    "id": 1317872,
    "title": "Sardar 2",
    "original_language": "ta",
    "release_date": "2026-09-10",
    "release_label": "JUL 15",
    "duration": "2h 30m",
    "director": "P. S. Mithran",
    "music_director": "Yuvan Shankar Raja",
    "producers": "Prince Pictures",
    "vote_average": 4,
    "vote_count": 1,
    "poster_path": "/muGsRtsNrG1gnlF2fPYrBa4TGlr.jpg",
    "backdrop_path": "/i39M5xz57fEkPLtuiAXqWwMNMyN.jpg",
    "overview": "When the mysterious Black Dagger threatens national security, Inspector Vijay embarks on his most dangerous mission yet. As the battle unfolds, the extraordinary origin of legendary spy Sardar is finally revealed, uncovering the sacrifices that forged a legend and the secrets that could shape the future.",
    "genre_ids": [
      28,
      53,
      12
    ],
    "trailerKey": "UlVxhSsMx0Y",
    "runtime": 165,
    "cast": [
      {
        "id": 123066,
        "name": "Karthi",
        "character": "Agent “Sardar” Chandra Bose / Inspector Vijay Prakash",
        "order": 0
      },
      {
        "id": 292250,
        "name": "S. J. Suryah",
        "character": "Yoganandan \"Yogi\" a.k.a Black Dagger",
        "order": 1
      },
      {
        "id": 1289455,
        "name": "Malavika Mohanan",
        "character": "Agent “Zara”",
        "order": 2
      },
      {
        "id": 2015323,
        "name": "Ashika Ranganath",
        "character": "Faiza",
        "order": 3
      },
      {
        "id": 1649677,
        "name": "Rajisha Vijayan",
        "character": "Indhra Rani",
        "order": 4
      },
      {
        "id": 1333834,
        "name": "Achyuth Kumar",
        "character": "Agent “Walrus”",
        "order": 5
      },
      {
        "id": 130111,
        "name": "Nassar",
        "character": "Quartermaster Shekar Dattatri",
        "order": 6
      },
      {
        "id": 458928,
        "name": "Babu Antony",
        "character": "Agent Tiger",
        "order": 7
      }
    ]
  },
  {
    "id": 857598,
    "title": "Pushpa 2 - The Rule",
    "original_language": "te",
    "release_date": "2024-12-04",
    "release_label": "DEC 05",
    "duration": "3h 21m",
    "director": "Sukumar",
    "music_director": "Devi Sri Prasad",
    "producers": "Naveen Yerneni, Y. Ravi Shankar (Mythri Movie Makers)",
    "vote_average": 6.2,
    "vote_count": 164,
    "poster_path": "/1T21FblunT0y8fz7YaW8JMYgUKm.jpg",
    "backdrop_path": "/7jGItf7idJsBm9QTNoTNTU3KiGe.jpg",
    "overview": "As his smuggling empire grows, a brazen Pushpa longs for power and respect on his vengeful journey, while facing old rivals and new.",
    "genre_ids": [
      28,
      80,
      18
    ],
    "trailerKey": "g0XUf0y7g9Q",
    "runtime": 225,
    "cast": [
      {
        "id": 108215,
        "name": "Allu Arjun",
        "character": "Pushpa Raj",
        "order": 0
      },
      {
        "id": 1752056,
        "name": "Rashmika Mandanna",
        "character": "Srivalli",
        "order": 1
      },
      {
        "id": 1072750,
        "name": "Fahadh Faasil",
        "character": "Bhanwar Singh Shekhawat",
        "order": 2
      },
      {
        "id": 2198106,
        "name": "Jagadeesh Bandari",
        "character": "Kesava",
        "order": 3
      },
      {
        "id": 586629,
        "name": "Rao Ramesh",
        "character": "Bhumireddy Siddappa Naidu",
        "order": 4
      },
      {
        "id": 213428,
        "name": "Sunil Varma",
        "character": "Mangalam Srinu",
        "order": 5
      },
      {
        "id": 1587861,
        "name": "Anasuya Bharadwaj",
        "character": "Dakshayani",
        "order": 6
      },
      {
        "id": 586625,
        "name": "Ajay",
        "character": "Molleti Mohan Raj",
        "order": 7
      }
    ]
  },
  {
    "id": 811944,
    "title": "Game Changer",
    "original_language": "te",
    "release_date": "2025-01-09",
    "release_label": "JAN 10",
    "duration": "2h 45m",
    "director": "Shankar",
    "music_director": "Thaman S",
    "producers": "Dil Raju, Sirish (Sri Venkateswara Creations)",
    "vote_average": 5,
    "vote_count": 31,
    "poster_path": "/qtOGsZoLW7QceqKmsOy5nSM6Aik.jpg",
    "backdrop_path": "/aBw406SvghTKV6CTK9t84Bo9Xik.jpg",
    "overview": "Ram, a newly appointed district collector, takes charge in a city in Andhra Pradesh and immediately confronts the deeply entrenched corruption and inefficiency plaguing the government. Determined to bring reforms, he initiates sweeping changes, sparking a fierce conflict with a powerful state Minister.",
    "genre_ids": [
      28,
      18,
      53
    ],
    "trailerKey": "QSu9-DBjMPI",
    "runtime": 164,
    "cast": [
      {
        "id": 147023,
        "name": "Ram Charan",
        "character": "H. Ram Nandan / Appanna",
        "order": 0
      },
      {
        "id": 1340978,
        "name": "Kiara Advani",
        "character": "Deepika Nandan",
        "order": 1
      },
      {
        "id": 123068,
        "name": "Anjali",
        "character": "Parvathy",
        "order": 2
      },
      {
        "id": 292250,
        "name": "S. J. Suryah",
        "character": "Bobbili Mopidevi",
        "order": 3
      },
      {
        "id": 1003981,
        "name": "Srikanth",
        "character": "Bobbili Sathyamurthy",
        "order": 4
      },
      {
        "id": 141704,
        "name": "Jayaram",
        "character": "Bobbili Magadheera Munimanikyam",
        "order": 5
      },
      {
        "id": 585397,
        "name": "Samuthirakani",
        "character": "Savi",
        "order": 6
      },
      {
        "id": 213428,
        "name": "Sunil Varma",
        "character": "\"Side\" Sathyam",
        "order": 7
      }
    ]
  },
  {
    "id": 1080365,
    "title": "They Call Him OG",
    "original_language": "te",
    "release_date": "2025-09-24",
    "release_label": "MAR 28",
    "duration": "2h 32m",
    "director": "Sujeeth",
    "music_director": "Thaman S",
    "producers": "DVV Danayya (DVV Entertainment)",
    "vote_average": 5.8,
    "vote_count": 38,
    "poster_path": "/oWOJ4VMyF92IEcTmrQO0xFDqeyk.jpg",
    "backdrop_path": "/lBJR69jrQ8I84irRexFfO70v0EA.jpg",
    "overview": "Trained to fight in Japan, a man's peaceful life in exile abruptly ends when trouble pulls him back to Mumbai to help those he swore to protect.",
    "genre_ids": [
      28,
      80,
      53
    ],
    "trailerKey": "7Y5q41D8_hs",
    "runtime": 155,
    "cast": [
      {
        "id": 237048,
        "name": "Pawan Kalyan",
        "character": "Ojas 'OG' Gambheera",
        "order": 0
      },
      {
        "id": 85969,
        "name": "Emraan Hashmi",
        "character": "Omkar 'Omi Bhau' Varthaman",
        "order": 1
      },
      {
        "id": 2243286,
        "name": "Priyanka Arul Mohan",
        "character": "Kanmani",
        "order": 2
      },
      {
        "id": 89153,
        "name": "Prakash Raj",
        "character": "Satya Dada",
        "order": 3
      },
      {
        "id": 574772,
        "name": "Sriya Reddy",
        "character": "Geetha",
        "order": 4
      },
      {
        "id": 2483439,
        "name": "Arjun Das",
        "character": "Arjun",
        "order": 5
      },
      {
        "id": 1289211,
        "name": "Ajay Ghosh",
        "character": "Politician",
        "order": 6
      },
      {
        "id": 1064131,
        "name": "Rajendran",
        "character": "Politician",
        "order": 7
      }
    ]
  },
  {
    "id": 881903,
    "title": "Spirit",
    "original_language": "te",
    "release_date": "2027-03-05",
    "release_label": "OCT 02",
    "duration": "2h 45m",
    "director": "Sandeep Reddy Vanga",
    "music_director": "Harshavardhan Rameshwar",
    "producers": "Bhushan Kumar, Krishan Kumar (T-Series, Bhadrakali Pictures)",
    "vote_average": 8.3,
    "vote_count": 1400,
    "poster_path": "/5N3e8nCYZdOyEyh1IuQDdkKF9sQ.jpg",
    "backdrop_path": "/yzu6Gb2fbC8GPxSKIn9BAHt9hFw.jpg",
    "overview": "Prabhas stars as an unhinged, morally ferocious police officer who takes down an entire international underworld drug racket.",
    "genre_ids": [
      28,
      80,
      53
    ],
    "trailerKey": "Jb8pXsp_nTI",
    "cast": [
      {
        "id": 237045,
        "name": "Prabhas",
        "character": "Ajanubahudu",
        "order": 0
      },
      {
        "id": 85668,
        "name": "Vivek Oberoi",
        "character": "",
        "order": 1
      },
      {
        "id": 2100209,
        "name": "Triptii Dimri",
        "character": "",
        "order": 2
      },
      {
        "id": 1047330,
        "name": "Kanchana",
        "character": "",
        "order": 3
      },
      {
        "id": 2707240,
        "name": "Aishwarya Desai",
        "character": "",
        "order": 4
      },
      {
        "id": 586625,
        "name": "Ajay",
        "character": "",
        "order": 5
      },
      {
        "id": 4412296,
        "name": "Manjjot Singhh",
        "character": "",
        "order": 6
      }
    ]
  },
  {
    "id": 727121,
    "title": "Hari Hara Veera Mallu",
    "original_language": "te",
    "release_date": "2025-07-23",
    "release_label": "MAR 28",
    "duration": "2h 35m",
    "director": "Jyothi Krishna",
    "music_director": "M. M. Keeravani",
    "producers": "A. Dayakar Rao",
    "vote_average": 6.1,
    "vote_count": 8,
    "poster_path": "/mKM3yC7kepjfs8A723dqd9hOky8.jpg",
    "backdrop_path": "/vg0n59EwKomMNJwlbt1CqlgFDI2.jpg",
    "overview": "Set in the 1650s Mughal Era, Veera Mallu, a Robin Hood-like outlaw with secret motives is hired to steal the Koh-i-Noor from Aurangzeb’s palace. He is joined by a crew of misfits, each talented in their own way, to complete the mission.",
    "genre_ids": [
      28,
      18,
      12
    ],
    "trailerKey": "2CN7t3571NM",
    "runtime": 161,
    "cast": [
      {
        "id": 237048,
        "name": "Pawan Kalyan",
        "character": "Veera Mallu",
        "order": 0
      },
      {
        "id": 77235,
        "name": "Bobby Deol",
        "character": "Aurangazeb",
        "order": 1
      },
      {
        "id": 1830991,
        "name": "Nidhhi Agerwal",
        "character": "Panchami",
        "order": 2
      },
      {
        "id": 130111,
        "name": "Nassar",
        "character": "Vissanna",
        "order": 3
      },
      {
        "id": 213428,
        "name": "Sunil Varma",
        "character": "Subbana",
        "order": 4
      },
      {
        "id": 591153,
        "name": "Raghu Babu",
        "character": "Munimanikhyam",
        "order": 5
      },
      {
        "id": 225315,
        "name": "Subbaraju",
        "character": "Abbanna",
        "order": 6
      },
      {
        "id": 11861,
        "name": "Dalip Tahil",
        "character": "Abul Hasan Qutb Shah",
        "order": 7
      }
    ]
  },
  {
    "id": 1109086,
    "title": "War 2",
    "original_language": "hi",
    "release_date": "2025-08-13",
    "release_label": "AUG 14",
    "duration": "2h 40m",
    "director": "Ayan Mukerji",
    "music_director": "Pritam",
    "producers": "Aditya Chopra (Yash Raj Films)",
    "vote_average": 6,
    "vote_count": 74,
    "poster_path": "/fxxVbjhIOl8ZPS69dH8xeeuxvmh.jpg",
    "backdrop_path": "/pKIRUTnwY3YYU9urSdsuobdcliP.jpg",
    "overview": "Years ago Agent Kabir went rogue, became India’s greatest villain ever.  As he descends further into the deepest shadows... India sends its deadliest, most lethal agent after him, Agent Vikram  A Special Units Officer who is more than Kabir’s equal and a relentless Terminator driven by his own demons, determined to put a bullet into Kabir’s skull.",
    "genre_ids": [
      28,
      53
    ],
    "trailerKey": "dK1W-AViQ-M",
    "runtime": 173,
    "cast": [
      {
        "id": 148037,
        "name": "N.T. Rama Rao Jr.",
        "character": "Vikram",
        "order": 0
      },
      {
        "id": 78749,
        "name": "Hrithik Roshan",
        "character": "Kabir Dhaliwal",
        "order": 1
      },
      {
        "id": 1340978,
        "name": "Kiara Advani",
        "character": "Kavya Luthra",
        "order": 2
      },
      {
        "id": 86508,
        "name": "Ashutosh Rana",
        "character": "Colonel Sunil Luthra",
        "order": 3
      },
      {
        "id": 72118,
        "name": "Anil Kapoor",
        "character": "Vikrant Kaul",
        "order": 4
      },
      {
        "id": 77235,
        "name": "Bobby Deol",
        "character": "Unnamed",
        "order": 5
      },
      {
        "id": 2365591,
        "name": "K.C. Shankar",
        "character": "Gautam Gulati",
        "order": 6
      },
      {
        "id": 122498,
        "name": "Varun Badola",
        "character": "Vilasrao Sarang",
        "order": 7
      }
    ]
  },
  {
    "id": 1196943,
    "title": "Chhaava",
    "original_language": "hi",
    "release_date": "2025-02-14",
    "release_label": "DEC 06",
    "duration": "2h 45m",
    "director": "Laxman Utekar",
    "music_director": "A. R. Rahman",
    "producers": "Dinesh Vijan (Maddock Films)",
    "vote_average": 7,
    "vote_count": 63,
    "poster_path": "/ubRsrzb6NRW8YhVTJ6jG1kpNvCi.jpg",
    "backdrop_path": "/s37s21YPqS7txyB0x0TRel24vgi.jpg",
    "overview": "Shivaji's death sparks the Maratha-Mughal conflict. His son Sambhaji leads resistance against Aurangzeb's forces. Amid battles and intrigue, both sides face challenges in a struggle for power.",
    "genre_ids": [
      28,
      18,
      36
    ],
    "trailerKey": "F6dGg2JX8Lc",
    "runtime": 161,
    "cast": [
      {
        "id": 1469935,
        "name": "Vicky Kaushal",
        "character": "Chhatrapati Sambhaji Maharaj",
        "order": 0
      },
      {
        "id": 1752056,
        "name": "Rashmika Mandanna",
        "character": "Yesubai Bhonsale",
        "order": 1
      },
      {
        "id": 87328,
        "name": "Akshaye Khanna",
        "character": "Aurangzeb",
        "order": 2
      },
      {
        "id": 86508,
        "name": "Ashutosh Rana",
        "character": "Sarlashkar Hambirrao Mohite",
        "order": 3
      },
      {
        "id": 35778,
        "name": "Divya Dutta",
        "character": "Rajmata Soyarabai Bhosale",
        "order": 4
      },
      {
        "id": 584887,
        "name": "Pradeep Ram Singh Rawat",
        "character": "Yesaji Kank",
        "order": 5
      },
      {
        "id": 1427894,
        "name": "Vineet Kumar Singh",
        "character": "Chandogamatya Kavi Kalash",
        "order": 6
      },
      {
        "id": 557212,
        "name": "Neil Bhoopalam",
        "character": "Shehzada Akbar",
        "order": 7
      }
    ]
  },
  {
    "id": 1257960,
    "title": "Sikandar",
    "original_language": "hi",
    "release_date": "2025-03-29",
    "release_label": "MAR 30",
    "duration": "2h 35m",
    "director": "A. R. Murugadoss",
    "music_director": "Pritam",
    "producers": "Sajid Nadiadwala (Nadiadwala Grandson Entertainment)",
    "vote_average": 4.9,
    "vote_count": 69,
    "poster_path": "/41s42CRXafa3OuRGvCtfYPEBmse.jpg",
    "backdrop_path": "/4MNRH73XmwBK2ycv3qvLpa07O5F.jpg",
    "overview": "A tragic accident pushes the powerful Sikandar to protect the less fortunate by standing up to corruption and greed — using any means necessary.",
    "genre_ids": [
      28,
      18,
      53
    ],
    "trailerKey": "uYPbbksJxIg",
    "runtime": 133,
    "cast": [
      {
        "id": 42802,
        "name": "Salman Khan",
        "character": "Sanjay Rajkot \"Sikandar\"",
        "order": 0
      },
      {
        "id": 1752056,
        "name": "Rashmika Mandanna",
        "character": "Saisri Rajkot",
        "order": 1
      },
      {
        "id": 581895,
        "name": "Sathyaraj",
        "character": "Minister Rakesh Pradhan",
        "order": 2
      },
      {
        "id": 53674,
        "name": "Sharman Joshi",
        "character": "Amar",
        "order": 3
      },
      {
        "id": 126500,
        "name": "Prateik Smita Patil",
        "character": "Arjun Pradhan",
        "order": 4
      },
      {
        "id": 113809,
        "name": "Kajal Aggarwal",
        "character": "Vaidehi",
        "order": 5
      },
      {
        "id": 1119739,
        "name": "Nawab Shah",
        "character": "Virat Bakshi",
        "order": 6
      },
      {
        "id": 550166,
        "name": "Kishore",
        "character": "Inspector Prakash",
        "order": 7
      }
    ]
  },
  {
    "id": 496331,
    "title": "Brahmāstra Part One: Shiva",
    "original_language": "hi",
    "release_date": "2022-09-08",
    "release_label": "DEC 18",
    "duration": "2h 50m",
    "director": "Ayan Mukerji",
    "music_director": "Pritam",
    "producers": "Karan Johar, Ayan Mukerji (Dharma Productions)",
    "vote_average": 6.3,
    "vote_count": 206,
    "poster_path": "/x61qdvHIsr9U53FwoLVDQqAGur0.jpg",
    "backdrop_path": "/9oAqll65ytlOBLzZwUwkmo5RwIK.jpg",
    "overview": "The story of Shiva – a young man on the brink of an epic love, with a girl named Isha. But their world is turned upside down when Shiva learns that he has a mysterious connection to the Brahmāstra... and a great power within him that he doesn’t understand just yet - the power of Fire.",
    "genre_ids": [
      14,
      28,
      12
    ],
    "trailerKey": "JwZRx6IGL_k",
    "runtime": 168,
    "cast": [
      {
        "id": 85034,
        "name": "Ranbir Kapoor",
        "character": "Shiva",
        "order": 0
      },
      {
        "id": 1108120,
        "name": "Alia Bhatt",
        "character": "Isha Chatterjee",
        "order": 1
      },
      {
        "id": 1251224,
        "name": "Mouni Roy",
        "character": "Junoon",
        "order": 2
      },
      {
        "id": 35780,
        "name": "Amitabh Bachchan",
        "character": "Guru",
        "order": 3
      },
      {
        "id": 149958,
        "name": "Nagarjuna Akkineni",
        "character": "Anish Shetty",
        "order": 4
      },
      {
        "id": 35742,
        "name": "Shah Rukh Khan",
        "character": "Mohan Bhargav",
        "order": 5
      },
      {
        "id": 78921,
        "name": "Dimple Kapadia",
        "character": "Savitri Devi",
        "order": 6
      },
      {
        "id": 2997770,
        "name": "Saurav Gurjar",
        "character": "Zor",
        "order": 7
      }
    ]
  },
  {
    "id": 1146210,
    "title": "Housefull 5",
    "original_language": "hi",
    "release_date": "2025-06-05",
    "release_label": "JUN 06",
    "duration": "2h 20m",
    "director": "Tarun Mansukhani",
    "music_director": "Tanishk Bagchi",
    "producers": "Sajid Nadiadwala",
    "vote_average": 5.2,
    "vote_count": 49,
    "poster_path": "/iGvGkVOfsooO0ZBrhN5i6zXYUCy.jpg",
    "backdrop_path": "/5DGn5HwIvTyY2bfv6V12dasN9GW.jpg",
    "overview": "A father writes his will — his son \"Jolly\" is going to get it all. But who is Jolly? The comedy unfolds as different people pose as the \"real\" Jolly on a cruise celebrating the father's birthday — where a murder takes place.",
    "genre_ids": [
      35
    ],
    "trailerKey": "e2eX1HGeBFE",
    "runtime": 163,
    "cast": [
      {
        "id": 35070,
        "name": "Akshay Kumar",
        "character": "Julius / Jolly No. 3",
        "order": 0
      },
      {
        "id": 35793,
        "name": "Abhishek Bachchan",
        "character": "Jalbhushan / Jolly No. 2",
        "order": 1
      },
      {
        "id": 84957,
        "name": "Riteish Deshmukh",
        "character": "Jalabuddin / Jolly No. 1",
        "order": 2
      },
      {
        "id": 95505,
        "name": "Jacqueline Fernandez",
        "character": "Sashikala",
        "order": 3
      },
      {
        "id": 1210757,
        "name": "Sonam Bajwa",
        "character": "Zara Akhtar",
        "order": 4
      },
      {
        "id": 932503,
        "name": "Nargis Fakhri",
        "character": "Kaanchi",
        "order": 5
      },
      {
        "id": 84956,
        "name": "Nana Patekar",
        "character": "Dagdu Hulgund",
        "order": 6
      },
      {
        "id": 85881,
        "name": "Sanjay Dutt",
        "character": "Bhidu",
        "order": 7
      }
    ]
  },
  {
    "id": 627336,
    "title": "L2: Empuraan",
    "original_language": "ml",
    "release_date": "2025-03-27",
    "release_label": "MAR 27",
    "duration": "2h 45m",
    "director": "Prithviraj Sukumaran",
    "music_director": "Deepak Dev",
    "producers": "Antony Perumbavoor (Aashirvad Cinemas), Subaskaran (Lyca Productions)",
    "vote_average": 6.2,
    "vote_count": 33,
    "poster_path": "/rlK1u6zJp8AJ93XX8dgiZVsE5w8.jpg",
    "backdrop_path": "/jYaoVDJ9J6Me3J0EQCABzQ99YVG.jpg",
    "overview": "Five years after becoming Chief Minister of Kerala, Jathin Ramdas' move to align with communal forces led by Balraj 'Baba' Bajrangi, triggers Stephen Nedumpally aka Khureshi Ab'raam to return with his Man Friday Zayed Masood to save his home state and settle scores.",
    "genre_ids": [
      28,
      53,
      80
    ],
    "trailerKey": "82RiI2Dx89s",
    "runtime": 179,
    "cast": [
      {
        "id": 82732,
        "name": "Mohanlal",
        "character": "Stephen Nedumpally / Khureshi-Ab'raam",
        "order": 0
      },
      {
        "id": 117690,
        "name": "Prithviraj Sukumaran",
        "character": "Zayed Masood",
        "order": 1
      },
      {
        "id": 1178639,
        "name": "Manju Warrier",
        "character": "Priyadarshini Ramdas",
        "order": 2
      },
      {
        "id": 1263974,
        "name": "Tovino Thomas",
        "character": "Jathin Ramdas",
        "order": 3
      },
      {
        "id": 109743,
        "name": "Abhimanyu Singh",
        "character": "Balraj / Baba Bajrangi",
        "order": 4
      },
      {
        "id": 2359361,
        "name": "Sukant Goel",
        "character": "Munna",
        "order": 5
      },
      {
        "id": 448468,
        "name": "Indrajith Sukumaran",
        "character": "Govardhan",
        "order": 6
      },
      {
        "id": 195930,
        "name": "Jerome Flynn",
        "character": "Boris Oliver",
        "order": 7
      }
    ]
  },
  {
    "id": 627304,
    "title": "Barroz: Guardian of Treasures",
    "original_language": "ml",
    "release_date": "2024-12-25",
    "release_label": "DEC 25",
    "duration": "2h 10m",
    "director": "Mohanlal",
    "music_director": "Lydian Nadhaswaram",
    "producers": "Antony Perumbavoor (Aashirvad Cinemas)",
    "vote_average": 1.7,
    "vote_count": 6,
    "poster_path": "/uv0MQn1EYH9qK7bO8jZG0Cu8R4P.jpg",
    "backdrop_path": "/x98XsOziE1ehRJ8XOs45OqDjKzT.jpg",
    "overview": "Barroz has been protecting D' Gama's treasure for 400 years and has been entrusted to hand over the treasure to a true descendant of D' Gama. One day, a boy comes in search of Barroz, claiming that he is a descendant of Vasco da Gama. Barroz sets on a journey to find out the boy's true ancestors and history.",
    "genre_ids": [
      14,
      12,
      10751
    ],
    "trailerKey": "b09pMFMNuLI",
    "runtime": 154,
    "cast": [
      {
        "id": 82732,
        "name": "Mohanlal",
        "character": "Barroz",
        "order": 0
      },
      {
        "id": 5201876,
        "name": "Maya Rao West",
        "character": "Isa Ron / Isabella da Gama",
        "order": 1
      },
      {
        "id": 5350904,
        "name": "Tuhin Menon",
        "character": "Ron Madhav",
        "order": 2
      },
      {
        "id": 1490110,
        "name": "Ignacio Mateos",
        "character": "Cristóvão da Gama",
        "order": 3
      },
      {
        "id": 3206722,
        "name": "Gopalan Adat",
        "character": "Voodoo",
        "order": 4
      },
      {
        "id": 6349251,
        "name": "Joshua Okesalako",
        "character": "Muwesi Maria",
        "order": 5
      },
      {
        "id": 1739730,
        "name": "Kallirroi Tziafeta",
        "character": "Theresa da Gama",
        "order": 6
      },
      {
        "id": 3023280,
        "name": "Caesar Lorrento",
        "character": "Mendoza",
        "order": 7
      }
    ]
  },
  {
    "id": 983219,
    "title": "Bazooka",
    "original_language": "ml",
    "release_date": "2025-01-26",
    "release_label": "JAN 26",
    "duration": "2h 25m",
    "director": "Deeno Dennis",
    "music_director": "Midhun Mukundan",
    "producers": "Jinu V. Abraham, Dolwin Kuriakose",
    "vote_average": 7.5,
    "vote_count": 920,
    "poster_path": "/xVXDB8t3iso84UkYqLQN0DzfoXX.jpg",
    "backdrop_path": "/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg",
    "overview": "Megastar Mammootty stars as an enigmatic mastermind playing high-stakes psychological mind games against ruthless international syndicates.",
    "genre_ids": [
      28,
      53
    ],
    "trailerKey": "LkKChCQnjB4"
  },
  {
    "id": 1083637,
    "title": "Kantara - A Legend: Chapter 1",
    "original_language": "kn",
    "release_date": "2025-10-01",
    "release_label": "OCT 02",
    "duration": "2h 45m",
    "director": "Rishab Shetty",
    "music_director": "B. Ajaneesh Loknath",
    "producers": "Vijay Kiragandur (Hombale Films)",
    "vote_average": 7.2,
    "vote_count": 98,
    "poster_path": "/ehQPboTPaIMkMUOoNOh8e7pZ5Rp.jpg",
    "backdrop_path": "/w57nxiBIODAYHLRs1xmrCY9zEFe.jpg",
    "overview": "During the Kadamba reign, King Vijayendra, the ruler of the fictional feudatory land of Bangra, meets his final fate while venturing into the mystical forest of Kantara. Witnessing this, his son Rajashekara seals the borders of their realm. Later, Prince Kulashekara reopens them through a brutal massacre. The protagonist, Berme, in search of prosperity, crosses the divide and ignites a conflict of faith, power, and destiny between the Kingdom and Nature.",
    "genre_ids": [
      28,
      12,
      14
    ],
    "trailerKey": "TMQUFhWm8C0",
    "runtime": 165,
    "cast": [
      {
        "id": 1752058,
        "name": "Rishab Shetty",
        "character": "Berme / Mayakara",
        "order": 0
      },
      {
        "id": 2252714,
        "name": "Rukmini Vasanth",
        "character": "Princess Kanakavathi",
        "order": 1
      },
      {
        "id": 141704,
        "name": "Jayaram",
        "character": "King Rajashekara",
        "order": 2
      },
      {
        "id": 1047711,
        "name": "Gulshan Devaiah",
        "character": "Prince Kulashekara",
        "order": 3
      },
      {
        "id": 5787008,
        "name": "Ramitha Shailendra",
        "character": "Rajamatha Rajalakshmi",
        "order": 4
      },
      {
        "id": 1752069,
        "name": "Pramod Shetty",
        "character": "Bhogendra",
        "order": 5
      },
      {
        "id": 3471891,
        "name": "Naveen D. Padil",
        "character": "Booba",
        "order": 6
      },
      {
        "id": 5577200,
        "name": "Rakesh Poojari",
        "character": "Peppe",
        "order": 7
      }
    ]
  },
  {
    "id": 1213243,
    "title": "Toxic: A Fairy Tale for Grown-ups",
    "original_language": "kn",
    "release_date": "2026-08-26",
    "release_label": "APR 10",
    "duration": "2h 50m",
    "director": "Geetu Mohandas",
    "music_director": "Jeremy Stack",
    "producers": "Venkat K. Narayana, Yash (KVN Productions, Monster Mind Creations)",
    "vote_average": 8,
    "vote_count": 73,
    "poster_path": "/oiIPU4lvnI0Ag2K9cyAi44eCaoE.jpg",
    "backdrop_path": "/tBRSSfgqOAq7YlG8udcoJIBm2FG.jpg",
    "overview": "A powerful drug cartel pulls the strings behind a facade of sun-soaked beaches as a gritty, violent underworld power struggle emerges during the crumbling of Portuguese colonial rule.",
    "genre_ids": [
      28,
      80,
      53
    ],
    "trailerKey": "EfluEyQ5QIA",
    "runtime": 192,
    "cast": [
      {
        "id": 1293681,
        "name": "Yash",
        "character": "Raya / Ticket",
        "order": 0
      },
      {
        "id": 1340978,
        "name": "Kiara Advani",
        "character": "Nadia",
        "order": 1
      },
      {
        "id": 91548,
        "name": "Nayanthara",
        "character": "Ganga",
        "order": 2
      },
      {
        "id": 1108805,
        "name": "Huma Qureshi",
        "character": "Elizabeth",
        "order": 3
      },
      {
        "id": 2030881,
        "name": "Tara Sutaria",
        "character": "Rebecca",
        "order": 4
      },
      {
        "id": 2252714,
        "name": "Rukmini Vasanth",
        "character": "Mellisa",
        "order": 5
      },
      {
        "id": 1544619,
        "name": "Sudev Nair",
        "character": "Karmadi",
        "order": 6
      },
      {
        "id": 1342538,
        "name": "Akshay Oberoi",
        "character": "Tony",
        "order": 7
      }
    ]
  },
  {
    "id": 1103473,
    "title": "KD – The Devil",
    "original_language": "kn",
    "release_date": "2026-04-30",
    "release_label": "MAY 15",
    "duration": "2h 35m",
    "director": "Prem",
    "music_director": "Arjun Janya",
    "producers": "Suprith (KVN Productions)",
    "vote_average": 5.3,
    "vote_count": 3,
    "poster_path": "/nEuEMJrnLBneE9tJlmzbhCFLu95.jpg",
    "backdrop_path": "/cNvaYDnGSfmOFi2yGnOmRIM5pce.jpg",
    "overview": "In the early 1970s, a petty criminal Kaali unwittingly involves himself with underworld thugs, catalyzing events beyond his control.",
    "genre_ids": [
      28,
      80,
      53
    ],
    "trailerKey": "yQLKrS5N4KU",
    "runtime": 141,
    "cast": [
      {
        "id": 1474037,
        "name": "Dhruva Sarja",
        "character": "Kaalidasa",
        "order": 0
      },
      {
        "id": 86060,
        "name": "Shilpa Shetty Kundra",
        "character": "Satyavathi",
        "order": 1
      },
      {
        "id": 85881,
        "name": "Sanjay Dutt",
        "character": "Dhak Deva",
        "order": 2
      },
      {
        "id": 2556830,
        "name": "Reeshma Nanaiah",
        "character": "Machh Lakshmi",
        "order": 3
      },
      {
        "id": 1293569,
        "name": "V. Ravichandran",
        "character": "",
        "order": 4
      },
      {
        "id": 141699,
        "name": "Ramesh Aravind",
        "character": "Dharma",
        "order": 5
      },
      {
        "id": 1488785,
        "name": "Nora Fatehi",
        "character": "",
        "order": 6
      },
      {
        "id": 389604,
        "name": "Kichcha Sudeepa",
        "character": "Kaala Bhairava",
        "order": 7
      }
    ]
  },
  {
    "id": 1241982,
    "title": "Moana 2",
    "original_language": "en",
    "release_date": "2024-11-21",
    "release_label": "NOV 27",
    "duration": "1h 40m",
    "director": "David G. Derrick Jr.",
    "music_director": "Mark Mancina, Opetaia Foa'i",
    "producers": "Christina Chen, Yvett Merino (Walt Disney Animation)",
    "vote_average": 7,
    "vote_count": 3283,
    "poster_path": "/aLVkiINlIeCkcZIzb7XHzPYgO6L.jpg",
    "backdrop_path": "/vYqt6kb4lcF8wwqsMMaULkP9OEn.jpg",
    "overview": "After receiving an unexpected call from her wayfinding ancestors, Moana journeys alongside Maui and a new crew to the far seas of Oceania and into dangerous, long-lost waters for an adventure unlike anything she's ever faced.",
    "genre_ids": [
      16,
      12,
      10751
    ],
    "trailerKey": "JdSl4RMNtGE",
    "runtime": 100,
    "cast": [
      {
        "id": 1564846,
        "name": "Auliʻi Cravalho",
        "character": "Moana (voice)",
        "order": 0
      },
      {
        "id": 18918,
        "name": "Dwayne Johnson",
        "character": "Maui (voice)",
        "order": 1
      },
      {
        "id": 4775908,
        "name": "Hualālai Chung",
        "character": "Moni (voice)",
        "order": 2
      },
      {
        "id": 1868823,
        "name": "Rose Matafeo",
        "character": "Loto (voice)",
        "order": 3
      },
      {
        "id": 55937,
        "name": "David Fane",
        "character": "Kele (voice)",
        "order": 4
      },
      {
        "id": 3819173,
        "name": "Awhimai Fraser",
        "character": "Matangi (voice)",
        "order": 5
      },
      {
        "id": 4775906,
        "name": "Khaleesi Lambert-Tsuda",
        "character": "Simea (voice)",
        "order": 6
      },
      {
        "id": 7242,
        "name": "Temuera Morrison",
        "character": "Chief Tui (voice)",
        "order": 7
      }
    ]
  },
  {
    "id": 83533,
    "title": "Avatar: Fire and Ash",
    "original_language": "en",
    "release_date": "2025-12-17",
    "release_label": "DEC 19",
    "duration": "3h 15m",
    "director": "James Cameron",
    "music_director": "Simon Franglen",
    "producers": "James Cameron, Jon Landau (Lightstorm Entertainment)",
    "vote_average": 7.6,
    "vote_count": 4329,
    "poster_path": "/bRBeSHfGHwkEpImlhxPmOcUsaeg.jpg",
    "backdrop_path": "/iN41Ccw4DctL8npfmYg1j5Tr1eb.jpg",
    "overview": "In the wake of the devastating war against the RDA and the loss of their eldest son, Jake Sully and Neytiri face a new threat on Pandora: the Ash People, a violent and power-hungry Na'vi tribe led by the ruthless Varang. Jake's family must fight for their survival and the future of Pandora in a conflict that pushes them to their emotional and physical limits.",
    "genre_ids": [
      28,
      12,
      878
    ],
    "trailerKey": "Ma1x7ikpid8",
    "runtime": 198,
    "cast": [
      {
        "id": 65731,
        "name": "Sam Worthington",
        "character": "Jake",
        "order": 0
      },
      {
        "id": 8691,
        "name": "Zoe Saldaña",
        "character": "Neytiri",
        "order": 1
      },
      {
        "id": 10205,
        "name": "Sigourney Weaver",
        "character": "Kiri",
        "order": 2
      },
      {
        "id": 32747,
        "name": "Stephen Lang",
        "character": "Quaritch",
        "order": 3
      },
      {
        "id": 566331,
        "name": "Oona Chaplin",
        "character": "Varang",
        "order": 4
      },
      {
        "id": 1895760,
        "name": "Jack Champion",
        "character": "Spider",
        "order": 5
      },
      {
        "id": 204,
        "name": "Kate Winslet",
        "character": "Ronal",
        "order": 6
      },
      {
        "id": 7248,
        "name": "Cliff Curtis",
        "character": "Tonowari",
        "order": 7
      }
    ]
  },
  {
    "id": 822119,
    "title": "Captain America: Brave New World",
    "original_language": "en",
    "release_date": "2024-03-27",
    "release_label": "FEB 14",
    "duration": "2h 15m",
    "director": "Adam Wingard",
    "music_director": "Laura Karpman",
    "producers": "Kevin Feige, Nate Moore (Marvel Studios)",
    "vote_average": 7,
    "vote_count": 4850,
    "poster_path": "/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg",
    "backdrop_path": "/ce3prrjh9ZehEl5JinNqr4jIeaB.jpg",
    "overview": "After meeting with newly elected U.S. President Thaddeus Ross, Sam finds himself in the middle of an international incident. He must discover the reason behind a nefarious global plot before the true mastermind has the entire world seeing red.",
    "genre_ids": [
      28,
      53,
      878
    ],
    "trailerKey": "1pHDWnXmK7Y",
    "runtime": 115,
    "cast": [
      {
        "id": 15556,
        "name": "Rebecca Hall",
        "character": "Ilene Andrews",
        "order": 0
      },
      {
        "id": 226366,
        "name": "Brian Tyree Henry",
        "character": "Bernie Hayes",
        "order": 1
      },
      {
        "id": 221018,
        "name": "Dan Stevens",
        "character": "Trapper",
        "order": 2
      },
      {
        "id": 2948491,
        "name": "Kaylee Hottle",
        "character": "Jia",
        "order": 3
      },
      {
        "id": 60416,
        "name": "Alex Ferns",
        "character": "Mikael",
        "order": 4
      },
      {
        "id": 123701,
        "name": "Fala Chen",
        "character": "Iwi Queen",
        "order": 5
      },
      {
        "id": 15298,
        "name": "Rachel House",
        "character": "Hampton",
        "order": 6
      },
      {
        "id": 2896645,
        "name": "Ron Smyck",
        "character": "Harris",
        "order": 7
      }
    ]
  }
];

export const GLOBAL_TRENDING_CATALOG = [
  {
    "id": 693134,
    "title": "Dune: Part Two",
    "original_language": "en",
    "release_date": "2024-02-27",
    "release_label": "01 Mar 2024",
    "full_release_date": "1 March 2024 (Worldwide)",
    "duration": "2h 46m",
    "runtime": 167,
    "director": "Denis Villeneuve",
    "music_director": "Hans Zimmer",
    "producers": "Mary Parent, Cale Boyter, Denis Villeneuve",
    "writers": "Denis Villeneuve, Jon Spaihts",
    "cinematography": "Greig Fraser",
    "editor": "Joe Walker",
    "vote_average": 8.1,
    "vote_count": 8557,
    "poster_path": "/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
    "backdrop_path": "/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
    "overview": "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, Paul endeavors to prevent a terrible future only he can foresee.",
    "genre_ids": [
      878,
      12
    ],
    "trailerKey": "U2Qp5pL3ovA",
    "ratings": {
      "imdb": "8.5/10",
      "prime": "8.4/10",
      "rottenTomatoes": "92%",
      "tmdb": "8.2/10"
    },
    "cast": [
      {
        "id": 1190668,
        "name": "Timothée Chalamet",
        "character": "Paul Atreides",
        "order": 0
      },
      {
        "id": 505710,
        "name": "Zendaya",
        "character": "Chani",
        "order": 1
      },
      {
        "id": 933238,
        "name": "Rebecca Ferguson",
        "character": "Jessica",
        "order": 2
      },
      {
        "id": 3810,
        "name": "Javier Bardem",
        "character": "Stilgar",
        "order": 3
      },
      {
        "id": 16851,
        "name": "Josh Brolin",
        "character": "Gurney Halleck",
        "order": 4
      },
      {
        "id": 86654,
        "name": "Austin Butler",
        "character": "Feyd-Rautha",
        "order": 5
      },
      {
        "id": 1373737,
        "name": "Florence Pugh",
        "character": "Princess Irulan",
        "order": 6
      },
      {
        "id": 543530,
        "name": "Dave Bautista",
        "character": "Beast Rabban",
        "order": 7
      }
    ]
  },
  {
    "id": 872585,
    "title": "Oppenheimer",
    "original_language": "en",
    "release_date": "2023-07-19",
    "release_label": "21 Jul 2023",
    "full_release_date": "21 July 2023 (Worldwide)",
    "duration": "3h 00m",
    "runtime": 181,
    "director": "Christopher Nolan",
    "music_director": "Ludwig Göransson",
    "producers": "Emma Thomas, Charles Roven, Christopher Nolan",
    "writers": "Christopher Nolan",
    "cinematography": "Hoyte van Hoytema",
    "editor": "Jennifer Lame",
    "vote_average": 8,
    "vote_count": 12480,
    "poster_path": "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    "backdrop_path": "/7CENyUim29IEsaJhUxIGymCRvPu.jpg",
    "overview": "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    "genre_ids": [
      18,
      36
    ],
    "trailerKey": "qiuSBWVdgLI",
    "ratings": {
      "imdb": "8.9/10",
      "prime": "8.7/10",
      "rottenTomatoes": "93%",
      "tmdb": "8.1/10"
    },
    "cast": [
      {
        "id": 2037,
        "name": "Cillian Murphy",
        "character": "J. Robert Oppenheimer",
        "order": 0
      },
      {
        "id": 5081,
        "name": "Emily Blunt",
        "character": "Kitty Oppenheimer",
        "order": 1
      },
      {
        "id": 1892,
        "name": "Matt Damon",
        "character": "Leslie Groves",
        "order": 2
      },
      {
        "id": 3223,
        "name": "Robert Downey Jr.",
        "character": "Lewis Strauss",
        "order": 3
      },
      {
        "id": 1373737,
        "name": "Florence Pugh",
        "character": "Jean Tatlock",
        "order": 4
      },
      {
        "id": 2299,
        "name": "Josh Hartnett",
        "character": "Ernest Lawrence",
        "order": 5
      },
      {
        "id": 1893,
        "name": "Casey Affleck",
        "character": "Boris Pash",
        "order": 6
      },
      {
        "id": 17838,
        "name": "Rami Malek",
        "character": "David Hill",
        "order": 7
      }
    ]
  },
  {
    "id": 157336,
    "title": "Interstellar",
    "original_language": "en",
    "release_date": "2014-11-05",
    "release_label": "07 Nov 2014",
    "full_release_date": "7 November 2014 (Worldwide)",
    "duration": "2h 49m",
    "runtime": 169,
    "director": "Christopher Nolan",
    "music_director": "Hans Zimmer",
    "producers": "Emma Thomas, Christopher Nolan, Lynda Obst",
    "writers": "Jonathan Nolan, Christopher Nolan",
    "cinematography": "Hoyte van Hoytema",
    "vote_average": 8.5,
    "vote_count": 41169,
    "poster_path": "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    "backdrop_path": "/8sNiAPPYU14PUepFNeSNGUTiHW.jpg",
    "overview": "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    "genre_ids": [
      12,
      18,
      878
    ],
    "trailerKey": "LY19rHKAaAg",
    "ratings": {
      "imdb": "8.7/10",
      "prime": "8.8/10",
      "rottenTomatoes": "73%",
      "tmdb": "8.4/10"
    },
    "cast": [
      {
        "id": 10297,
        "name": "Matthew McConaughey",
        "character": "Cooper",
        "order": 0
      },
      {
        "id": 1813,
        "name": "Anne Hathaway",
        "character": "Brand",
        "order": 1
      },
      {
        "id": 3895,
        "name": "Michael Caine",
        "character": "Professor Brand",
        "order": 2
      },
      {
        "id": 83002,
        "name": "Jessica Chastain",
        "character": "Murph",
        "order": 3
      },
      {
        "id": 1893,
        "name": "Casey Affleck",
        "character": "Tom",
        "order": 4
      },
      {
        "id": 8210,
        "name": "Wes Bentley",
        "character": "Doyle",
        "order": 5
      },
      {
        "id": 17052,
        "name": "Topher Grace",
        "character": "Getty",
        "order": 6
      },
      {
        "id": 851784,
        "name": "Mackenzie Foy",
        "character": "Murph (10 Yrs.)",
        "order": 7
      }
    ]
  },
  {
    "id": 27205,
    "title": "Inception",
    "original_language": "en",
    "release_date": "2010-07-15",
    "release_label": "16 Jul 2010",
    "full_release_date": "16 July 2010 (Worldwide)",
    "duration": "2h 28m",
    "runtime": 148,
    "director": "Christopher Nolan",
    "music_director": "Hans Zimmer",
    "vote_average": 8.4,
    "vote_count": 40190,
    "poster_path": "/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
    "backdrop_path": "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    "overview": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
    "genre_ids": [
      28,
      878,
      12
    ],
    "trailerKey": "JE9z-gy4De4",
    "ratings": {
      "imdb": "8.8/10",
      "prime": "8.7/10",
      "rottenTomatoes": "87%",
      "tmdb": "8.4/10"
    },
    "cast": [
      {
        "id": 6193,
        "name": "Leonardo DiCaprio",
        "character": "Dom Cobb",
        "order": 0
      },
      {
        "id": 24045,
        "name": "Joseph Gordon-Levitt",
        "character": "Arthur",
        "order": 1
      },
      {
        "id": 3899,
        "name": "Ken Watanabe",
        "character": "Saito",
        "order": 2
      },
      {
        "id": 2524,
        "name": "Tom Hardy",
        "character": "Eames",
        "order": 3
      },
      {
        "id": 27578,
        "name": "Elliot Page",
        "character": "Ariadne",
        "order": 4
      },
      {
        "id": 95697,
        "name": "Dileep Rao",
        "character": "Yusuf",
        "order": 5
      },
      {
        "id": 2037,
        "name": "Cillian Murphy",
        "character": "Robert Fischer, Jr.",
        "order": 6
      },
      {
        "id": 13022,
        "name": "Tom Berenger",
        "character": "Peter Browning",
        "order": 7
      }
    ]
  },
  {
    "id": 155,
    "title": "The Dark Knight",
    "original_language": "en",
    "release_date": "2008-07-16",
    "release_label": "18 Jul 2008",
    "full_release_date": "18 July 2008 (Worldwide)",
    "duration": "2h 32m",
    "runtime": 152,
    "director": "Christopher Nolan",
    "music_director": "Hans Zimmer, James Newton Howard",
    "vote_average": 8.5,
    "vote_count": 36715,
    "poster_path": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "backdrop_path": "/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg",
    "overview": "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
    "genre_ids": [
      18,
      28,
      80,
      53
    ],
    "trailerKey": "_PZpmTj1Q8Q",
    "ratings": {
      "imdb": "9.0/10",
      "prime": "9.0/10",
      "rottenTomatoes": "94%",
      "tmdb": "8.5/10"
    },
    "cast": [
      {
        "id": 3894,
        "name": "Christian Bale",
        "character": "Bruce Wayne",
        "order": 0
      },
      {
        "id": 1810,
        "name": "Heath Ledger",
        "character": "Joker",
        "order": 1
      },
      {
        "id": 6383,
        "name": "Aaron Eckhart",
        "character": "Harvey Dent",
        "order": 2
      },
      {
        "id": 3895,
        "name": "Michael Caine",
        "character": "Alfred",
        "order": 3
      },
      {
        "id": 1579,
        "name": "Maggie Gyllenhaal",
        "character": "Rachel",
        "order": 4
      },
      {
        "id": 64,
        "name": "Gary Oldman",
        "character": "Gordon",
        "order": 5
      },
      {
        "id": 192,
        "name": "Morgan Freeman",
        "character": "Lucius Fox",
        "order": 6
      },
      {
        "id": 53651,
        "name": "Monique Gabriela Curnen",
        "character": "Ramirez",
        "order": 7
      }
    ]
  },
  {
    "id": 496243,
    "title": "Parasite",
    "original_language": "ko",
    "release_date": "2019-05-30",
    "release_label": "30 May 2019",
    "full_release_date": "30 May 2019 (South Korea)",
    "duration": "2h 12m",
    "runtime": 133,
    "director": "Bong Joon Ho",
    "music_director": "Jung Jae-il",
    "vote_average": 8.5,
    "vote_count": 21314,
    "poster_path": "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    "backdrop_path": "/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg",
    "overview": "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    "genre_ids": [
      35,
      53,
      18
    ],
    "trailerKey": "bM9QabAojCg",
    "ratings": {
      "imdb": "8.5/10",
      "prime": "8.6/10",
      "rottenTomatoes": "99%",
      "tmdb": "8.5/10"
    },
    "cast": [
      {
        "id": 20738,
        "name": "Song Kang-ho",
        "character": "Kim Ki-taek",
        "order": 0
      },
      {
        "id": 115290,
        "name": "Lee Sun-kyun",
        "character": "Park Dong-ik",
        "order": 1
      },
      {
        "id": 556435,
        "name": "Cho Yeo-jeong",
        "character": "Yeon-kyo",
        "order": 2
      },
      {
        "id": 1255881,
        "name": "Choi Woo-shik",
        "character": "Ki-woo",
        "order": 3
      },
      {
        "id": 1442583,
        "name": "Park So-dam",
        "character": "Ki-jung",
        "order": 4
      },
      {
        "id": 1572354,
        "name": "Lee Jung-eun",
        "character": "Moon-gwang",
        "order": 5
      },
      {
        "id": 2158882,
        "name": "Jang Hye-jin",
        "character": "Chung-sook",
        "order": 6
      },
      {
        "id": 1694435,
        "name": "Park Myung-hoon",
        "character": "Geun-se",
        "order": 7
      }
    ]
  },
  {
    "id": 569094,
    "title": "Spider-Man: Across the Spider-Verse",
    "original_language": "en",
    "release_date": "2023-05-31",
    "release_label": "02 Jun 2023",
    "full_release_date": "2 June 2023 (Worldwide)",
    "duration": "2h 20m",
    "runtime": 140,
    "director": "Kemp Powers",
    "music_director": "Daniel Pemberton",
    "vote_average": 8.3,
    "vote_count": 9243,
    "poster_path": "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    "backdrop_path": "/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg",
    "overview": "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse's very existence. But when the heroes clash on how to handle a new threat, Miles finds himself pitted against the other Spiders and must set out on his own to save those he loves most.",
    "genre_ids": [
      16,
      28,
      12,
      878
    ],
    "trailerKey": "yFrxzaBLDQM",
    "ratings": {
      "imdb": "8.6/10",
      "prime": "8.5/10",
      "rottenTomatoes": "95%",
      "tmdb": "8.4/10"
    },
    "cast": [
      {
        "id": 587506,
        "name": "Shameik Moore",
        "character": "Miles Morales (voice)",
        "order": 0
      },
      {
        "id": 130640,
        "name": "Hailee Steinfeld",
        "character": "Gwen Stacy (voice)",
        "order": 1
      },
      {
        "id": 226366,
        "name": "Brian Tyree Henry",
        "character": "Jeff Morales (voice)",
        "order": 2
      },
      {
        "id": 141610,
        "name": "Luna Lauren Vélez",
        "character": "Rio Morales (voice)",
        "order": 3
      },
      {
        "id": 543505,
        "name": "Jake Johnson",
        "character": "Peter B. Parker (voice)",
        "order": 4
      },
      {
        "id": 25072,
        "name": "Oscar Isaac",
        "character": "Miguel O'Hara (voice)",
        "order": 5
      },
      {
        "id": 17881,
        "name": "Jason Schwartzman",
        "character": "Spot (voice)",
        "order": 6
      },
      {
        "id": 1455336,
        "name": "Issa Rae",
        "character": "Jessica Drew (voice)",
        "order": 7
      }
    ]
  },
  {
    "id": 129,
    "title": "Spirited Away",
    "original_language": "ja",
    "release_date": "2001-07-20",
    "release_label": "20 Jul 2001",
    "full_release_date": "20 July 2001 (Japan)",
    "duration": "2h 05m",
    "runtime": 125,
    "director": "Hayao Miyazaki",
    "music_director": "Joe Hisaishi",
    "vote_average": 8.5,
    "vote_count": 18902,
    "poster_path": "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    "backdrop_path": "/6oaL4DP75yABrd5EbC4H2zq5ghc.jpg",
    "overview": "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
    "genre_ids": [
      16,
      14,
      12
    ],
    "trailerKey": "GAp2_0JJskk",
    "ratings": {
      "imdb": "8.6/10",
      "prime": "8.6/10",
      "rottenTomatoes": "96%",
      "tmdb": "8.5/10"
    },
    "cast": [
      {
        "id": 19587,
        "name": "Rumi Hiiragi",
        "character": "Chihiro (voice)",
        "order": 0
      },
      {
        "id": 19588,
        "name": "Miyu Irino",
        "character": "Haku (voice)",
        "order": 1
      },
      {
        "id": 19589,
        "name": "Mari Natsuki",
        "character": "Yubaba / Zeniba (voice)",
        "order": 2
      },
      {
        "id": 19590,
        "name": "Takashi Naito",
        "character": "Father (voice)",
        "order": 3
      },
      {
        "id": 19591,
        "name": "Yasuko Sawaguchi",
        "character": "Mother (voice)",
        "order": 4
      },
      {
        "id": 19592,
        "name": "Tatsuya Gashuin",
        "character": "Aogaeru (voice)",
        "order": 5
      },
      {
        "id": 225730,
        "name": "Ryunosuke Kamiki",
        "character": "Boh (voice)",
        "order": 6
      },
      {
        "id": 19594,
        "name": "Yumi Tamai",
        "character": "Rin (voice)",
        "order": 7
      }
    ]
  },
  {
    "id": 545611,
    "title": "Everything Everywhere All at Once",
    "original_language": "en",
    "release_date": "2022-03-24",
    "release_label": "25 Mar 2022",
    "full_release_date": "25 March 2022 (Worldwide)",
    "duration": "2h 19m",
    "runtime": 140,
    "director": "Daniel Scheinert",
    "music_director": "Son Lux",
    "vote_average": 7.7,
    "vote_count": 8400,
    "poster_path": "/u68AjlvlutfEIcpmbYpKcdi09ut.jpg",
    "backdrop_path": "/fIwiFha3WPu5nHkBeMQ4GzEk0Hv.jpg",
    "overview": "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
    "genre_ids": [
      28,
      12,
      878
    ],
    "trailerKey": "wxN1T1uxQ2g",
    "ratings": {
      "imdb": "7.8/10",
      "prime": "7.9/10",
      "rottenTomatoes": "94%",
      "tmdb": "7.8/10"
    },
    "cast": [
      {
        "id": 1620,
        "name": "Michelle Yeoh",
        "character": "Evelyn Wang",
        "order": 0
      },
      {
        "id": 1381186,
        "name": "Stephanie Hsu",
        "character": "Joy Wang / Jobu Tupaki",
        "order": 1
      },
      {
        "id": 690,
        "name": "Ke Huy Quan",
        "character": "Waymond Wang",
        "order": 2
      },
      {
        "id": 20904,
        "name": "James Hong",
        "character": "Gong Gong",
        "order": 3
      },
      {
        "id": 8944,
        "name": "Jamie Lee Curtis",
        "character": "Deirdre Beaubeirdre",
        "order": 4
      },
      {
        "id": 1071151,
        "name": "Tallie Medel",
        "character": "Becky Sregor",
        "order": 5
      },
      {
        "id": 213001,
        "name": "Jenny Slate",
        "character": "Big Nose",
        "order": 6
      },
      {
        "id": 232499,
        "name": "Harry Shum Jr.",
        "character": "Chad",
        "order": 7
      }
    ]
  },
  {
    "id": 299534,
    "title": "Avengers: Endgame",
    "original_language": "en",
    "release_date": "2019-04-24",
    "release_label": "26 Apr 2019",
    "full_release_date": "26 April 2019 (Worldwide)",
    "duration": "3h 01m",
    "runtime": 181,
    "director": "Anthony Russo",
    "music_director": "Alan Silvestri",
    "vote_average": 8.2,
    "vote_count": 28676,
    "poster_path": "/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
    "backdrop_path": "/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    "overview": "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
    "genre_ids": [
      12,
      878,
      28
    ],
    "trailerKey": "L2NAh3CIdig",
    "ratings": {
      "imdb": "8.4/10",
      "prime": "8.4/10",
      "rottenTomatoes": "94%",
      "tmdb": "8.3/10"
    },
    "cast": [
      {
        "id": 3223,
        "name": "Robert Downey Jr.",
        "character": "Tony Stark / Iron Man",
        "order": 0
      },
      {
        "id": 16828,
        "name": "Chris Evans",
        "character": "Steve Rogers / Captain America",
        "order": 1
      },
      {
        "id": 103,
        "name": "Mark Ruffalo",
        "character": "Bruce Banner / Hulk",
        "order": 2
      },
      {
        "id": 74568,
        "name": "Chris Hemsworth",
        "character": "Thor",
        "order": 3
      },
      {
        "id": 1245,
        "name": "Scarlett Johansson",
        "character": "Natasha Romanoff / Black Widow",
        "order": 4
      },
      {
        "id": 17604,
        "name": "Jeremy Renner",
        "character": "Clint Barton / Hawkeye",
        "order": 5
      },
      {
        "id": 16851,
        "name": "Josh Brolin",
        "character": "Thanos",
        "order": 6
      },
      {
        "id": 1896,
        "name": "Don Cheadle",
        "character": "James Rhodes / War Machine",
        "order": 7
      }
    ]
  },
  {
    "id": 244786,
    "title": "Whiplash",
    "original_language": "en",
    "release_date": "2014-10-10",
    "release_label": "10 Oct 2014",
    "full_release_date": "10 October 2014 (USA)",
    "duration": "1h 47m",
    "runtime": 107,
    "director": "Damien Chazelle",
    "music_director": "Justin Hurwitz",
    "vote_average": 8.4,
    "vote_count": 17075,
    "poster_path": "/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    "backdrop_path": "/fRGxZuo7jJUWQsVg9PREb98Aclp.jpg",
    "overview": "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, even his humanity.",
    "genre_ids": [
      18,
      10402
    ],
    "trailerKey": "Q7kZy3T6vRM",
    "ratings": {
      "imdb": "8.5/10",
      "prime": "8.5/10",
      "rottenTomatoes": "94%",
      "tmdb": "8.4/10"
    },
    "cast": [
      {
        "id": 996701,
        "name": "Miles Teller",
        "character": "Andrew",
        "order": 0
      },
      {
        "id": 18999,
        "name": "J.K. Simmons",
        "character": "Fletcher",
        "order": 1
      },
      {
        "id": 781,
        "name": "Paul Reiser",
        "character": "Jim",
        "order": 2
      },
      {
        "id": 129104,
        "name": "Melissa Benoist",
        "character": "Nicole",
        "order": 3
      },
      {
        "id": 970216,
        "name": "Austin Stowell",
        "character": "Ryan",
        "order": 4
      },
      {
        "id": 1451540,
        "name": "Nate Lang",
        "character": "Carl",
        "order": 5
      },
      {
        "id": 15824,
        "name": "Chris Mulkey",
        "character": "Uncle Frank",
        "order": 6
      },
      {
        "id": 53454,
        "name": "Damon Gupton",
        "character": "Mr. Kramer",
        "order": 7
      }
    ]
  },
  {
    "id": 558449,
    "title": "Gladiator II",
    "original_language": "en",
    "release_date": "2024-11-13",
    "release_label": "22 Nov 2024",
    "full_release_date": "22 November 2024 (Worldwide)",
    "duration": "2h 28m",
    "runtime": 148,
    "director": "Ridley Scott",
    "music_director": "Harry Gregson-Williams",
    "vote_average": 6.6,
    "vote_count": 4732,
    "poster_path": "/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    "backdrop_path": "/tOqIwliWMovSIZ9DyvHcHI7p2im.jpg",
    "overview": "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist. With rage in his heart and the future of the Empire at stake, Lucius must look to his past to find strength and honor to return the glory of Rome to its people.",
    "genre_ids": [
      28,
      12,
      18
    ],
    "trailerKey": "TQwSz88ITAE",
    "ratings": {
      "imdb": "7.3/10",
      "prime": "7.4/10",
      "rottenTomatoes": "77%",
      "tmdb": "7.3/10"
    },
    "cast": [
      {
        "id": 2326151,
        "name": "Paul Mescal",
        "character": "Lucius",
        "order": 0
      },
      {
        "id": 5292,
        "name": "Denzel Washington",
        "character": "Macrinus",
        "order": 1
      },
      {
        "id": 1253360,
        "name": "Pedro Pascal",
        "character": "General Acacius",
        "order": 2
      },
      {
        "id": 935,
        "name": "Connie Nielsen",
        "character": "Lucilla",
        "order": 3
      },
      {
        "id": 1597365,
        "name": "Joseph Quinn",
        "character": "Emperor Geta",
        "order": 4
      },
      {
        "id": 2099497,
        "name": "Fred Hechinger",
        "character": "Emperor Caracalla",
        "order": 5
      },
      {
        "id": 1259880,
        "name": "Lior Raz",
        "character": "Viggo",
        "order": 6
      },
      {
        "id": 937,
        "name": "Derek Jacobi",
        "character": "Gracchus",
        "order": 7
      }
    ]
  },
  {
    "id": 238,
    "title": "The Godfather",
    "original_language": "en",
    "release_date": "1972-03-14",
    "release_label": "24 Mar 1972",
    "full_release_date": "24 March 1972 (Worldwide)",
    "duration": "2h 55m",
    "runtime": 175,
    "director": "Francis Ford Coppola",
    "music_director": "Nino Rota",
    "vote_average": 8.7,
    "vote_count": 23574,
    "poster_path": "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    "backdrop_path": "/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
    "overview": "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
    "genre_ids": [
      18,
      80
    ],
    "trailerKey": "Ew9ngL1GZvs",
    "ratings": {
      "imdb": "9.2/10",
      "prime": "9.1/10",
      "rottenTomatoes": "97%",
      "tmdb": "8.7/10"
    },
    "cast": [
      {
        "id": 3084,
        "name": "Marlon Brando",
        "character": "Don Vito Corleone",
        "order": 0
      },
      {
        "id": 1158,
        "name": "Al Pacino",
        "character": "Michael Corleone",
        "order": 1
      },
      {
        "id": 3085,
        "name": "James Caan",
        "character": "Sonny Corleone",
        "order": 2
      },
      {
        "id": 3087,
        "name": "Robert Duvall",
        "character": "Tom Hagen",
        "order": 3
      },
      {
        "id": 3086,
        "name": "Richard S. Castellano",
        "character": "Clemenza",
        "order": 4
      },
      {
        "id": 3092,
        "name": "Diane Keaton",
        "character": "Kay Adams",
        "order": 5
      },
      {
        "id": 3094,
        "name": "Talia Shire",
        "character": "Connie Corleone Rizzi",
        "order": 6
      },
      {
        "id": 3095,
        "name": "Gianni Russo",
        "character": "Carlo Rizzi",
        "order": 7
      }
    ]
  },
  {
    "id": 680,
    "title": "Pulp Fiction",
    "original_language": "en",
    "release_date": "1994-09-10",
    "release_label": "10 Sep 1994",
    "full_release_date": "10 September 1994 (USA)",
    "duration": "2h 34m",
    "runtime": 154,
    "director": "Quentin Tarantino",
    "vote_average": 8.5,
    "vote_count": 30869,
    "poster_path": "/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg",
    "backdrop_path": "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    "overview": "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that ingeniously trip back and forth in time.",
    "genre_ids": [
      53,
      80
    ],
    "trailerKey": "tGpTpVyI_OQ",
    "ratings": {
      "imdb": "8.9/10",
      "prime": "8.8/10",
      "rottenTomatoes": "92%",
      "tmdb": "8.5/10"
    },
    "cast": [
      {
        "id": 8891,
        "name": "John Travolta",
        "character": "Vincent Vega",
        "order": 0
      },
      {
        "id": 2231,
        "name": "Samuel L. Jackson",
        "character": "Jules Winnfield",
        "order": 1
      },
      {
        "id": 139,
        "name": "Uma Thurman",
        "character": "Mia Wallace",
        "order": 2
      },
      {
        "id": 62,
        "name": "Bruce Willis",
        "character": "Butch Coolidge",
        "order": 3
      },
      {
        "id": 10182,
        "name": "Ving Rhames",
        "character": "Marsellus Wallace",
        "order": 4
      },
      {
        "id": 1037,
        "name": "Harvey Keitel",
        "character": "The Wolf",
        "order": 5
      },
      {
        "id": 7036,
        "name": "Eric Stoltz",
        "character": "Lance",
        "order": 6
      },
      {
        "id": 3129,
        "name": "Tim Roth",
        "character": "Pumpkin",
        "order": 7
      }
    ]
  },
  {
    "id": 550,
    "title": "Fight Club",
    "original_language": "en",
    "release_date": "1999-10-15",
    "release_label": "15 Oct 1999",
    "full_release_date": "15 October 1999 (Worldwide)",
    "duration": "2h 19m",
    "runtime": 139,
    "director": "David Fincher",
    "music_director": "The Dust Brothers",
    "vote_average": 8.4,
    "vote_count": 32864,
    "poster_path": "/jSziioSwPVrOy9Yow3XhWIBDjq1.jpg",
    "backdrop_path": "/c6OLXfKAk5BKeR6broC8pYiCquX.jpg",
    "overview": "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground \"fight clubs\" forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
    "genre_ids": [
      18
    ],
    "trailerKey": "dfeUzm6KF4g",
    "ratings": {
      "imdb": "8.8/10",
      "prime": "8.7/10",
      "rottenTomatoes": "79%",
      "tmdb": "8.4/10"
    },
    "cast": [
      {
        "id": 819,
        "name": "Edward Norton",
        "character": "Narrator",
        "order": 0
      },
      {
        "id": 287,
        "name": "Brad Pitt",
        "character": "Tyler Durden",
        "order": 1
      },
      {
        "id": 1283,
        "name": "Helena Bonham Carter",
        "character": "Marla Singer",
        "order": 2
      },
      {
        "id": 7470,
        "name": "Meat Loaf",
        "character": "Robert Paulson",
        "order": 3
      },
      {
        "id": 7499,
        "name": "Jared Leto",
        "character": "Angel Face",
        "order": 4
      },
      {
        "id": 7471,
        "name": "Zach Grenier",
        "character": "Richard Chesler (Regional Manager)",
        "order": 5
      },
      {
        "id": 7497,
        "name": "Holt McCallany",
        "character": "The Mechanic",
        "order": 6
      },
      {
        "id": 7498,
        "name": "Eion Bailey",
        "character": "Ricky",
        "order": 7
      }
    ]
  }
];

export const CURATED_TV_SHOWS = [
  {
    "id": 93405,
    "title": "Squid Game",
    "name": "Squid Game",
    "media_type": "tv",
    "original_language": "ko",
    "first_air_date": "2021-09-17",
    "release_date": "2021-09-17",
    "number_of_seasons": 2,
    "number_of_episodes": 15,
    "duration": "2 Seasons • 15 Episodes",
    "vote_average": 8.4,
    "vote_count": 14200,
    "director": "Hwang Dong-hyuk",
    "poster_path": "/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg",
    "backdrop_path": "/2meX1nMdScFOoV4370rqHWFDxZ2.jpg",
    "overview": "Hundreds of cash-strapped players accept a strange invitation to compete in children's games with high stakes: a 45.6 billion-won survival tournament.",
    "genre_ids": [
      18,
      9648,
      10759
    ],
    "trailerKey": "oqxAJKy0ii4",
    "ratings": {
      "imdb": "8.0/10",
      "prime": "8.2/10",
      "rottenTomatoes": "95%",
      "tmdb": "8.4/10"
    },
    "cast": [
      {
        "id": 1,
        "name": "Lee Jung-jae",
        "character": "Seong Gi-hun / No. 456",
        "order": 0
      },
      {
        "id": 2,
        "name": "Park Hae-soo",
        "character": "Cho Sang-woo / No. 218",
        "order": 1
      },
      {
        "id": 3,
        "name": "Jung Ho-yeon",
        "character": "Kang Sae-byeok / No. 067",
        "order": 2
      },
      {
        "id": 4,
        "name": "Wi Ha-joon",
        "character": "Hwang Jun-ho",
        "order": 3
      }
    ]
  },
  {
    "id": 66732,
    "title": "Stranger Things",
    "name": "Stranger Things",
    "media_type": "tv",
    "original_language": "en",
    "first_air_date": "2016-07-15",
    "release_date": "2016-07-15",
    "number_of_seasons": 5,
    "number_of_episodes": 42,
    "duration": "5 Seasons • 42 Episodes",
    "vote_average": 8.6,
    "vote_count": 17800,
    "director": "The Duffer Brothers",
    "poster_path": "/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
    "backdrop_path": "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    "genre_ids": [
      18,
      9648,
      10765
    ],
    "trailerKey": "b9EkMc79ZSU",
    "ratings": {
      "imdb": "8.7/10",
      "prime": "8.8/10",
      "rottenTomatoes": "91%",
      "tmdb": "8.6/10"
    },
    "cast": [
      {
        "id": 11,
        "name": "Millie Bobby Brown",
        "character": "Eleven",
        "order": 0
      },
      {
        "id": 12,
        "name": "Finn Wolfhard",
        "character": "Mike Wheeler",
        "order": 1
      },
      {
        "id": 13,
        "name": "Winona Ryder",
        "character": "Joyce Byers",
        "order": 2
      },
      {
        "id": 14,
        "name": "David Harbour",
        "character": "Jim Hopper",
        "order": 3
      }
    ]
  },
  {
    "id": 1399,
    "title": "Game of Thrones",
    "name": "Game of Thrones",
    "media_type": "tv",
    "original_language": "en",
    "first_air_date": "2011-04-17",
    "release_date": "2011-04-17",
    "number_of_seasons": 8,
    "number_of_episodes": 73,
    "duration": "8 Seasons • 73 Episodes",
    "vote_average": 8.4,
    "vote_count": 23500,
    "director": "David Benioff, D.B. Weiss",
    "poster_path": "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    "backdrop_path": "/suopoADq0k8YZr4dQXcU6p0qYq2.jpg",
    "overview": "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war.",
    "genre_ids": [
      10765,
      18,
      10759
    ],
    "trailerKey": "KPLWWIOCOOQ",
    "ratings": {
      "imdb": "9.2/10",
      "prime": "9.3/10",
      "rottenTomatoes": "89%",
      "tmdb": "8.4/10"
    },
    "cast": [
      {
        "id": 21,
        "name": "Emilia Clarke",
        "character": "Daenerys Targaryen",
        "order": 0
      },
      {
        "id": 22,
        "name": "Kit Harington",
        "character": "Jon Snow",
        "order": 1
      },
      {
        "id": 23,
        "name": "Peter Dinklage",
        "character": "Tyrion Lannister",
        "order": 2
      },
      {
        "id": 24,
        "name": "Lena Headey",
        "character": "Cersei Lannister",
        "order": 3
      }
    ]
  },
  {
    "id": 1396,
    "title": "Breaking Bad",
    "name": "Breaking Bad",
    "media_type": "tv",
    "original_language": "en",
    "first_air_date": "2008-01-20",
    "release_date": "2008-01-20",
    "number_of_seasons": 5,
    "number_of_episodes": 62,
    "duration": "5 Seasons • 62 Episodes",
    "vote_average": 8.9,
    "vote_count": 14900,
    "director": "Vince Gilligan",
    "poster_path": "/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg",
    "backdrop_path": "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
    "overview": "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.",
    "genre_ids": [
      18,
      80
    ],
    "trailerKey": "HhesaQXLuRY",
    "ratings": {
      "imdb": "9.5/10",
      "prime": "9.6/10",
      "rottenTomatoes": "96%",
      "tmdb": "8.9/10"
    },
    "cast": [
      {
        "id": 31,
        "name": "Bryan Cranston",
        "character": "Walter White",
        "order": 0
      },
      {
        "id": 32,
        "name": "Aaron Paul",
        "character": "Jesse Pinkman",
        "order": 1
      },
      {
        "id": 33,
        "name": "Anna Gunn",
        "character": "Skyler White",
        "order": 2
      },
      {
        "id": 34,
        "name": "Dean Norris",
        "character": "Hank Schrader",
        "order": 3
      }
    ]
  },
  {
    "id": 76479,
    "title": "The Boys",
    "name": "The Boys",
    "media_type": "tv",
    "original_language": "en",
    "first_air_date": "2019-07-26",
    "release_date": "2019-07-26",
    "number_of_seasons": 4,
    "number_of_episodes": 32,
    "duration": "4 Seasons • 32 Episodes",
    "vote_average": 8.5,
    "vote_count": 9800,
    "director": "Eric Kripke",
    "poster_path": "/in1R2dDc421JxsoRWaIIAqVI2KE.jpg",
    "backdrop_path": "/n6bUvigpRFqSwmPp1m2YADdbRBc.jpg",
    "overview": "A fun and irreverent take on what happens when superheroes abuse their superpowers rather than use them for good.",
    "genre_ids": [
      10765,
      10759,
      18
    ],
    "trailerKey": "tcrNsIaQkb4",
    "ratings": {
      "imdb": "8.7/10",
      "prime": "8.9/10",
      "rottenTomatoes": "93%",
      "tmdb": "8.5/10"
    },
    "cast": [
      {
        "id": 41,
        "name": "Karl Urban",
        "character": "Billy Butcher",
        "order": 0
      },
      {
        "id": 42,
        "name": "Jack Quaid",
        "character": "Hughie Campbell",
        "order": 1
      },
      {
        "id": 43,
        "name": "Antony Starr",
        "character": "Homelander",
        "order": 2
      },
      {
        "id": 44,
        "name": "Erin Moriarty",
        "character": "Annie January / Starlight",
        "order": 3
      }
    ]
  },
  {
    "id": 84105,
    "title": "Mirzapur",
    "name": "Mirzapur",
    "media_type": "tv",
    "original_language": "hi",
    "first_air_date": "2018-11-16",
    "release_date": "2018-11-16",
    "number_of_seasons": 3,
    "number_of_episodes": 29,
    "duration": "3 Seasons • 29 Episodes",
    "vote_average": 8.2,
    "vote_count": 2900,
    "director": "Karan Anshuman, Gurmmeet Singh",
    "poster_path": "/1rxLUFVrtTo82OxhbDXJDiJVkwL.jpg",
    "backdrop_path": "/7qFmN3K1gHwR1jN1D5s5Z5jG5jG.jpg",
    "overview": "A shocking incident at a wedding procession ignites a series of events entangling the lives of two families in the lawless city of Mirzapur.",
    "genre_ids": [
      18,
      80,
      10759
    ],
    "trailerKey": "33o3s4Vs4Sw",
    "ratings": {
      "imdb": "8.5/10",
      "prime": "8.8/10",
      "rottenTomatoes": "88%",
      "tmdb": "8.2/10"
    },
    "cast": [
      {
        "id": 51,
        "name": "Pankaj Tripathi",
        "character": "Akhandanand Tripathi (Kaleen Bhaiya)",
        "order": 0
      },
      {
        "id": 52,
        "name": "Ali Fazal",
        "character": "Guddu Pandit",
        "order": 1
      },
      {
        "id": 53,
        "name": "Divyenndu",
        "character": "Munna Tripathi",
        "order": 2
      },
      {
        "id": 54,
        "name": "Shweta Tripathi",
        "character": "Golu Gupta",
        "order": 3
      }
    ]
  },
  {
    "id": 15643,
    "title": "The Family Man",
    "name": "The Family Man",
    "media_type": "tv",
    "original_language": "hi",
    "first_air_date": "2019-09-20",
    "release_date": "2019-09-20",
    "number_of_seasons": 2,
    "number_of_episodes": 19,
    "duration": "2 Seasons • 19 Episodes",
    "vote_average": 8.3,
    "vote_count": 2400,
    "director": "Raj & DK",
    "poster_path": "/vCtEwgPHBjwMgehFyGnIlaUXJx6.jpg",
    "backdrop_path": "/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg",
    "overview": "A middle-class man working for a special cell of the National Investigation Agency must balance his secret job defending the nation with his family life.",
    "genre_ids": [
      18,
      10759,
      35
    ],
    "trailerKey": "NGf_B81HC28",
    "ratings": {
      "imdb": "8.7/10",
      "prime": "9.0/10",
      "rottenTomatoes": "92%",
      "tmdb": "8.3/10"
    },
    "cast": [
      {
        "id": 61,
        "name": "Manoj Bajpayee",
        "character": "Srikant Tiwari",
        "order": 0
      },
      {
        "id": 62,
        "name": "Priyamani",
        "character": "Suchitra Tiwari",
        "order": 1
      },
      {
        "id": 63,
        "name": "Sharib Hashmi",
        "character": "JK Talpade",
        "order": 2
      },
      {
        "id": 64,
        "name": "Samantha Ruth Prabhu",
        "character": "Raji",
        "order": 3
      }
    ]
  },
  {
    "id": 200861,
    "title": "Suzhal: The Vortex",
    "name": "Suzhal: The Vortex",
    "media_type": "tv",
    "original_language": "ta",
    "first_air_date": "2022-06-17",
    "release_date": "2022-06-17",
    "number_of_seasons": 1,
    "number_of_episodes": 8,
    "duration": "1 Season • 8 Episodes",
    "vote_average": 8.1,
    "vote_count": 1800,
    "director": "Bramma G., Anucharan Murugaiyan",
    "poster_path": "/z6IJi7xmAMmKdbzSnwguIXLIVjN.jpg",
    "backdrop_path": "/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg",
    "overview": "In a small South Indian town, the disappearance of a young girl during the Mayana Kollai festival unravels a labyrinth of dark secrets, lies, and ancestral trauma.",
    "genre_ids": [
      80,
      18,
      9648
    ],
    "trailerKey": "aJj4U3i8gA4",
    "ratings": {
      "imdb": "8.2/10",
      "prime": "8.5/10",
      "rottenTomatoes": "86%",
      "tmdb": "8.1/10"
    },
    "cast": [
      {
        "id": 71,
        "name": "Kathir",
        "character": "Inspector Sakkarai",
        "order": 0
      },
      {
        "id": 72,
        "name": "Aishwarya Rajesh",
        "character": "Nandhini",
        "order": 1
      },
      {
        "id": 73,
        "name": "R. Parthiban",
        "character": "Shanmugam",
        "order": 2
      },
      {
        "id": 74,
        "name": "Sriya Reddy",
        "character": "Regina",
        "order": 3
      }
    ]
  },
  {
    "id": 132117,
    "title": "Farzi",
    "name": "Farzi",
    "media_type": "tv",
    "original_language": "hi",
    "first_air_date": "2023-02-10",
    "release_date": "2023-02-10",
    "number_of_seasons": 1,
    "number_of_episodes": 8,
    "duration": "1 Season • 8 Episodes",
    "vote_average": 8,
    "vote_count": 2200,
    "director": "Raj & DK",
    "poster_path": "/cTS86RwEBIDgCgUmjWQTSoPsK6p.jpg",
    "backdrop_path": "/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg",
    "overview": "A brilliant small-time artist is catapulted into the high-stakes world of counterfeiting when he creates the perfect fake currency note.",
    "genre_ids": [
      80,
      18,
      53
    ],
    "trailerKey": "xRZE_gE9P14",
    "ratings": {
      "imdb": "8.4/10",
      "prime": "8.6/10",
      "rottenTomatoes": "87%",
      "tmdb": "8.0/10"
    },
    "cast": [
      {
        "id": 81,
        "name": "Shahid Kapoor",
        "character": "Sunny",
        "order": 0
      },
      {
        "id": 82,
        "name": "Vijay Sethupathi",
        "character": "Michael Vedanayagam",
        "order": 1
      },
      {
        "id": 83,
        "name": "Kay Kay Menon",
        "character": "Mansoor Dalal",
        "order": 2
      },
      {
        "id": 84,
        "name": "Raashii Khanna",
        "character": "Megha Vyas",
        "order": 3
      }
    ]
  },
  {
    "id": 101352,
    "title": "Panchayat",
    "name": "Panchayat",
    "media_type": "tv",
    "original_language": "hi",
    "first_air_date": "2020-04-03",
    "release_date": "2020-04-03",
    "number_of_seasons": 3,
    "number_of_episodes": 24,
    "duration": "3 Seasons • 24 Episodes",
    "vote_average": 8.7,
    "vote_count": 4200,
    "director": "Deepak Kumar Mishra",
    "poster_path": "/xrfvAhrMdT6Uwg5fyTyQAZBYyiu.jpg",
    "backdrop_path": "/wuHD3SiccbQvHUT1LE9o8j9dJlU.jpg",
    "overview": "An engineering graduate takes up the position of secretary of a Gram Panchayat in the remote village of Phulera.",
    "genre_ids": [
      35,
      18
    ],
    "trailerKey": "mojZJ7oeD_g",
    "ratings": {
      "imdb": "8.9/10",
      "prime": "9.1/10",
      "rottenTomatoes": "94%",
      "tmdb": "8.7/10"
    },
    "cast": [
      {
        "id": 91,
        "name": "Jitendra Kumar",
        "character": "Abhishek Tripathi",
        "order": 0
      },
      {
        "id": 92,
        "name": "Neena Gupta",
        "character": "Manju Devi",
        "order": 1
      },
      {
        "id": 93,
        "name": "Raghubir Yadav",
        "character": "Brij Bhushan Dubey",
        "order": 2
      },
      {
        "id": 94,
        "name": "Chandan Roy",
        "character": "Vikas",
        "order": 3
      }
    ]
  }
];

export const ALL_CURATED_MOVIES = [...THEATRICAL_NOW_PLAYING, ...THEATRICAL_COMING_SOON, ...GLOBAL_TRENDING_CATALOG];
export const ALL_MEDIA_CATALOG = [...ALL_CURATED_MOVIES, ...CURATED_TV_SHOWS];

export const FRANCHISE_COLLECTIONS = {
  devara: {
    collectionName: 'Devara Saga',
    parts: [
      { id: 811941, title: 'Devara: Part 1', release_date: '2024-09-27', poster_path: '/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg' },
      { id: 811942, title: 'Devara: Part 2', release_date: '2026', poster_path: '/lQfuaXjANoTsdx5iS0gCXlK9D2L.jpg' },
    ],
  },
  pushpa: {
    collectionName: 'Pushpa Trilogy',
    parts: [
      { id: 693134, title: 'Pushpa: The Rise', release_date: '2021-12-17', poster_path: '/1T21FblunT0y8fz7YaW8JMYgUKm.jpg' },
      { id: 857598, title: 'Pushpa 2: The Rule', release_date: '2024-12-05', poster_path: '/1T21FblunT0y8fz7YaW8JMYgUKm.jpg' },
    ],
  },
  kalki: {
    collectionName: 'Kalki Cinematic Universe',
    parts: [
      { id: 801688, title: 'Kalki 2898 AD', release_date: '2024-06-27', poster_path: '/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg' },
      { id: 1184918, title: 'Kalki 2898 AD - Part 2', release_date: '2027', poster_path: '/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg' },
    ],
  },
  stree: {
    collectionName: 'Maddock Supernatural Universe',
    parts: [
      { id: 533535, title: 'Stree', release_date: '2018-08-31', poster_path: '/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg' },
      { id: 1112426, title: 'Stree 2', release_date: '2024-08-15', poster_path: '/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg' },
    ],
  },
  deadpool: {
    collectionName: 'Deadpool Collection',
    parts: [
      { id: 293660, title: 'Deadpool', release_date: '2016-02-12', poster_path: '/3E53WEZJqP6aM84D8C4Os4mmv8h.jpg' },
      { id: 383498, title: 'Deadpool 2', release_date: '2018-05-18', poster_path: '/to0spRl1CMDvyUbvn99TYaDFxYv.jpg' },
      { id: 533535, title: 'Deadpool & Wolverine', release_date: '2024-07-26', poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' },
    ],
  },
  dune: {
    collectionName: 'Dune Saga',
    parts: [
      { id: 438631, title: 'Dune: Part One', release_date: '2021-10-22', poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
      { id: 693134, title: 'Dune: Part Two', release_date: '2024-03-01', poster_path: '/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg' },
    ],
  },
  gladiator: {
    collectionName: 'Gladiator Collection',
    parts: [
      { id: 98, title: 'Gladiator', release_date: '2000-05-05', poster_path: '/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg' },
      { id: 558449, title: 'Gladiator II', release_date: '2024-11-22', poster_path: '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg' },
    ],
  },
};


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
  mohanlal: 'Mohanlal',
  ikka: 'Mammootty',
  mammootty: 'Mammootty',
  yash: 'Yash',
  kiccha: 'Kiccha Sudeep',
  sudeep: 'Kiccha Sudeep',
  sjs: 'S. J. Suryah',
  'sj suryah': 'S. J. Suryah',
  ani: 'Anirudh Ravichander',
  anirudh: 'Anirudh Ravichander',
  arr: 'A. R. Rahman',
  rahman: 'A. R. Rahman',
  u1: 'Yuvan Shankar Raja',
  yuvan: 'Yuvan Shankar Raja',
  gvp: 'G. V. Prakash Kumar',
  dsp: 'Devi Sri Prasad',
  loki: 'Lokesh Kanagaraj',
  lokesh: 'Lokesh Kanagaraj',
  nelson: 'Nelson Dilipkumar',
  atlee: 'Atlee',
  vetri: 'Vetrimaaran',
  vetrimaaran: 'Vetrimaaran',
  ssr: 'S. S. Rajamouli',
  rajamouli: 'S. S. Rajamouli',
  neel: 'Prashanth Neel',
  tc: 'Tom Cruise',
  'tom cruise': 'Tom Cruise',
  leo: 'Leonardo DiCaprio',
  dicaprio: 'Leonardo DiCaprio',
  nolan: 'Christopher Nolan',
  cillian: 'Cillian Murphy'
};

export const CURATED_ARTISTS = [
  {
    id: 3223,
    tmdb_id: 3223,
    name: 'Robert Downey Jr.',
    aliases: ['rdj', 'robert downey', 'robert downey jr', 'iron man', 'tony stark'],
    known_for_department: 'Acting',
    birthday: '1965-04-04',
    place_of_birth: 'Manhattan, New York City, USA',
    profile_path: '/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg',
    biography: 'Robert Downey Jr. is an Academy Award-winning American actor globally celebrated for his iconic portrayal of Tony Stark / Iron Man in the Marvel Cinematic Universe, Sherlock Holmes, Chaplin, and his Oscar-winning performance in Oppenheimer.',
    filmography: [
      { id: 872585, title: 'Oppenheimer', character: 'Lewis Strauss', release_date: '2023-07-21', year: '2023', original_language: 'en', poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', vote_average: 8.1, vote_count: 9400 },
      { id: 299534, title: 'Avengers: Endgame', character: 'Tony Stark / Iron Man', release_date: '2019-04-26', year: '2019', original_language: 'en', poster_path: '/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg', vote_average: 8.3, vote_count: 24000 },
      { id: 299536, title: 'Avengers: Infinity War', character: 'Tony Stark / Iron Man', release_date: '2018-04-27', year: '2018', original_language: 'en', poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg', vote_average: 8.2, vote_count: 28000 },
      { id: 1726, title: 'Iron Man', character: 'Tony Stark / Iron Man', release_date: '2008-05-02', year: '2008', original_language: 'en', poster_path: '/78lPtwv72eTNqFW9COBYI0dWDJa.jpg', vote_average: 7.6, vote_count: 25000 },
      { id: 10528, title: 'Sherlock Holmes', character: 'Sherlock Holmes', release_date: '2009-12-25', year: '2009', original_language: 'en', poster_path: '/momkKuWburNTqKBF6ez7rvhYVhE.jpg', vote_average: 7.2, vote_count: 13000 },
      { id: 271110, title: 'Captain America: Civil War', character: 'Tony Stark / Iron Man', release_date: '2016-05-06', year: '2016', original_language: 'en', poster_path: '/rAG1TbbtIR9frr8Q6e60wLffU1I.jpg', vote_average: 7.4, vote_count: 21000 }
    ]
  },
  {
    id: 222760,
    tmdb_id: 222760,
    name: 'Silambarasan TR',
    aliases: ['str', 'simbu', 'silambarasan', 'silambarasan tr', 'atman'],
    known_for_department: 'Acting & Filmmaking',
    birthday: '1983-02-03',
    place_of_birth: 'Chennai, Tamil Nadu, India',
    profile_path: '/1T35CiKVldfxElZfQqaoN6GhvuU.jpg',
    biography: 'Silambarasan Thesingu Rajendar (STR / Simbu) is an accomplished actor, director, playback singer, and lyricist in Tamil cinema. Renowned for his magnetic screen presence, charismatic dancing, and versatile performances in cult classics like Vinnaithaandi Varuvaayaa, Maanaadu, Vendhu Thanindhathu Kaadu, and Mani Ratnam’s Thug Life.',
    filmography: [
      { id: 1045021, title: 'Thug Life', character: 'Lead Star', release_date: '2025-06-05', year: '2025', original_language: 'ta', poster_path: '/jH2wFFESmlPgfqO5LgCMVFJymFY.jpg', vote_average: 8.5, vote_count: 1400 },
      { id: 757881, title: 'Maanaadu', character: 'Abdul Khaaliq', release_date: '2021-11-25', year: '2021', original_language: 'ta', poster_path: '/gG3ZcK192GqR9oD6cO51e843y7o.jpg', vote_average: 8.2, vote_count: 320 },
      { id: 846618, title: 'Vendhu Thanindhathu Kaadu', character: 'Muthu', release_date: '2022-09-15', year: '2022', original_language: 'ta', poster_path: '/u1wHDC0XZfM5Zf8a55z1YQ50d3a.jpg', vote_average: 7.8, vote_count: 190 },
      { id: 37724, title: 'Vinnaithaandi Varuvaayaa', character: 'Karthik Sivakumar', release_date: '2010-02-26', year: '2010', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.2, vote_count: 260 },
      { id: 491418, title: 'Chekka Chivantha Vaanam', character: 'Ethiraj Senapathi', release_date: '2018-09-27', year: '2018', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.6, vote_count: 180 }
    ]
  },
  {
    id: 585544,
    tmdb_id: 585544,
    name: 'T. Rajendar',
    aliases: ['tr', 't rajendar', 't. rajendar', 'vijaya t rajendar'],
    known_for_department: 'Directing, Acting & Music',
    birthday: '1955-05-09',
    place_of_birth: 'Mayiladuthurai, Tamil Nadu, India',
    profile_path: '/5oXNhP5cK2yEncMrOTzQut3pRtt.jpg',
    biography: 'Vijaya T. Rajendar is a legendary, multi-talented filmmaker, actor, music director, lyricist, and playback singer who defined an entire era of Tamil cinema with his unique rhyming punchlines, super-hit melodious music, and emotional blockbusters.',
    filmography: [
      { id: 244510, title: 'Oru Thalai Ragam', character: 'Writer / Composer', release_date: '1980-05-02', year: '1980', original_language: 'ta', poster_path: '/5oXNhP5cK2yEncMrOTzQut3pRtt.jpg', vote_average: 8.0, vote_count: 85 },
      { id: 251211, title: 'Rayil Payanangalil', character: 'Vasanth / Director', release_date: '1981-05-22', year: '1981', original_language: 'ta', poster_path: '/5oXNhP5cK2yEncMrOTzQut3pRtt.jpg', vote_average: 7.8, vote_count: 70 },
      { id: 251212, title: 'Mythili Ennai Kaadhali', character: 'Director / Music', release_date: '1986-02-14', year: '1986', original_language: 'ta', poster_path: '/5oXNhP5cK2yEncMrOTzQut3pRtt.jpg', vote_average: 7.9, vote_count: 65 },
      { id: 384501, title: 'Kavan', character: 'Mayilvaganan', release_date: '2017-03-31', year: '2017', original_language: 'ta', poster_path: '/5oXNhP5cK2yEncMrOTzQut3pRtt.jpg', vote_average: 7.3, vote_count: 110 }
    ]
  },
  {
    id: 550165,
    tmdb_id: 550165,
    name: 'Dhanush',
    aliases: ['d', 'dhanush', 'dhanush kraaja'],
    known_for_department: 'Acting & Directing',
    birthday: '1983-07-28',
    place_of_birth: 'Chennai, Tamil Nadu, India',
    profile_path: '/34gv8DThQCh74oZQZe5zoDnaZrw.jpg',
    biography: 'Venkatesh Prabhu Kasthuri Raja, known professionally as Dhanush, is an internationally acclaimed Indian actor, producer, director, lyricist, and playback singer in Tamil, Hindi, and Hollywood cinema. He is a multiple-time National Film Award winner known for Asuran, Aadukalam, Raanjhanaa, and Raayan.',
    filmography: [
      { id: 1136418, title: 'Raayan', character: 'Kathavaraayan (Raayan)', release_date: '2024-07-26', year: '2024', original_language: 'ta', poster_path: '/dHMbqpG7vZk1iEJaEkCCyixFbos.jpg', vote_average: 7.6, vote_count: 290 },
      { id: 569094, title: 'Asuran', character: 'Sivasamy', release_date: '2019-10-04', year: '2019', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.5, vote_count: 310 },
      { id: 25121, title: 'Aadukalam', character: 'K. P. Karuppu', release_date: '2011-01-14', year: '2011', original_language: 'ta', poster_path: '/35GMJaA9VeW6gQY5jlruEu6WEF4.jpg', vote_average: 8.3, vote_count: 240 }
    ]
  },
  {
    id: 1081464,
    tmdb_id: 1081464,
    name: 'Anirudh Ravichander',
    aliases: ['ani', 'anirudh', 'anirudh ravichander', 'rockstar ani'],
    known_for_department: 'Sound / Music Composer',
    birthday: '1990-10-16',
    place_of_birth: 'Chennai, Tamil Nadu, India',
    profile_path: '/xKvlrZpRaXkm2K2ZiXpqgrEedUU.jpg',
    biography: 'Anirudh Ravichander is India’s leading music sensation, composer, and singer known for his viral, chart-topping soundtracks in world cinema including Vikram, Leo, Jawan, Jailer, Master, Devara, and Coolie.',
    filmography: [
      { id: 1153399, title: 'Coolie', character: 'Music Composer', release_date: '2025-08-13', year: '2025', original_language: 'ta', poster_path: '/kr36awqmziEI5mfUElsHB0pj9zP.jpg', vote_average: 8.5, vote_count: 2400 },
      { id: 1093966, title: 'Vettaiyan', character: 'Music Composer', release_date: '2024-10-10', year: '2024', original_language: 'ta', poster_path: '/1q0dAC3OJZVKQcV2dG5sGvdUGqN.jpg', vote_average: 7.8, vote_count: 1800 },
      { id: 869641, title: 'Vikram', character: 'Music Composer', release_date: '2022-06-03', year: '2022', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.3, vote_count: 3500 }
    ]
  },
  {
    id: 5288,
    tmdb_id: 5288,
    name: 'A. R. Rahman',
    aliases: ['arr', 'ar rahman', 'a. r. rahman', 'a r rahman', 'isai puyal', 'mozart of madras', 'rahman'],
    known_for_department: 'Sound / Music Composer',
    birthday: '1967-01-06',
    place_of_birth: 'Madras (Chennai), Tamil Nadu, India',
    profile_path: '/3po8IwdtONY72BuXr7ZhZZ0ugxQ.jpg',
    biography: 'Allahrakka Rahman (A. R. Rahman) is an internationally celebrated, two-time Academy Award and two-time Grammy Award-winning composer, singer, and music producer. Hailed as the "Mozart of Madras", his pathbreaking soundtracks revolutionized Indian film music starting with Roja and continuing through Bombay, Dil Se.., Lagaan, Slumdog Millionaire, Rockstar, Ponniyin Selvan, and Thug Life.',
    filmography: [
      { id: 1045021, title: 'Thug Life', character: 'Music Composer', release_date: '2025-06-05', year: '2025', original_language: 'ta', poster_path: '/jH2wFFESmlPgfqO5LgCMVFJymFY.jpg', vote_average: 8.5, vote_count: 1400 },
      { id: 1196943, title: 'Chhaava', character: 'Music Composer', release_date: '2025-02-14', year: '2025', original_language: 'hi', poster_path: '/ubRsrzb6NRW8YhVTJ6jG1kpNvCi.jpg', vote_average: 8.4, vote_count: 1200 },
      { id: 31521, title: 'Roja', character: 'Music Composer', release_date: '1992-08-15', year: '1992', original_language: 'ta', poster_path: '/zhGayNbH2ZHWaJkhSv3qEhs5fy6.jpg', vote_average: 8.6, vote_count: 240 },
      { id: 12455, title: 'Slumdog Millionaire', character: 'Original Score & Songs Composer', release_date: '2008-11-12', year: '2008', original_language: 'en', poster_path: '/9bB1c9eN8uJ6eW1V5s0iO4F7yL8.jpg', vote_average: 7.9, vote_count: 11000 }
    ]
  },
  {
    id: 93193,
    tmdb_id: 93193,
    name: 'Kamal Haasan',
    aliases: ['kamal', 'kamal haasan', 'kamal hassan', 'kamalhasan', 'ulaganayagan', 'ulaga nayagan'],
    known_for_department: 'Acting & Filmmaking',
    birthday: '1954-11-07',
    place_of_birth: 'Paramakudi, Tamil Nadu, India',
    profile_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg',
    biography: 'Kamal Haasan is universally celebrated as one of world cinema’s greatest and most versatile polymaths. Across an extraordinary career spanning over six decades and 230+ motion pictures, he has mastered acting, screenwriting, directing, producing, and playback singing. Renowned for fearless creative experimentation and multilingual mastery across Tamil, Telugu, Hindi, Malayalam, Kannada, and Bengali cinema, Haasan is a four-time National Film Award winner, recipient of the Padma Shri and Padma Bhushan, and has represented India at the Academy Awards a record-setting seven times. From all-time classics like Nayagan, Anbe Sivam, Indian, and Swati Muthyam to Hey Ram, Sadma, Chachi 420, and the cinematic juggernaut Vikram, his legacy remains unmatched.',
    filmography: [
      { id: 869641, title: 'Vikram', character: 'Agent Vikram / Karnan', release_date: '2022-06-03', year: '2022', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.3, vote_count: 350 },
      { id: 31521, title: 'Indian', character: 'Veerasekaran Senapathy / Chandra Bose', release_date: '1996-05-09', year: '1996', original_language: 'ta', poster_path: '/zhGayNbH2ZHWaJkhSv3qEhs5fy6.jpg', vote_average: 8.5, vote_count: 240 },
      { id: 24209, title: 'Nayagan', character: 'Velu Naicker', release_date: '1987-10-21', year: '1987', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.8, vote_count: 290 },
      { id: 25121, title: 'Anbe Sivam', character: 'Nalla Sivam', release_date: '2003-01-15', year: '2003', original_language: 'ta', poster_path: '/35GMJaA9VeW6gQY5jlruEu6WEF4.jpg', vote_average: 8.7, vote_count: 210 },
      { id: 30344, title: 'Swati Muthyam', character: 'Sivayya', release_date: '1986-03-13', year: '1986', original_language: 'te', poster_path: '/pMvT7VjCMlVE0dShi8A9HYV7xZV.jpg', vote_average: 8.4, vote_count: 140 },
      { id: 25774, title: 'Sagara Sangamam', character: 'Balakrishna', release_date: '1983-06-03', year: '1983', original_language: 'te', poster_path: '/gG3ZcK192GqR9oD6cO51e843y7o.jpg', vote_average: 8.6, vote_count: 130 },
      { id: 18196, title: 'Hey Ram', character: 'Saket Ram', release_date: '2000-02-18', year: '2000', original_language: 'ta', poster_path: '/zYF5e8x8tQeE2ZqC2z5yZ3f8e5.jpg', vote_average: 8.2, vote_count: 160 },
      { id: 16568, title: 'Sadma', character: 'Somu', release_date: '1983-07-08', year: '1983', original_language: 'hi', poster_path: '/lU5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.3, vote_count: 120 },
      { id: 36725, title: 'Chachi 420', character: 'Jaiprakash Paswan / Lakshmi Godbole', release_date: '1997-12-19', year: '1997', original_language: 'hi', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.1, vote_count: 150 },
      { id: 62450, title: 'Madanolsavam', character: 'Raju', release_date: '1978-03-24', year: '1978', original_language: 'ml', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 7.9, vote_count: 90 },
      { id: 28551, title: 'Pushpaka Vimana', character: 'Unemployed Youth', release_date: '1987-11-27', year: '1987', original_language: 'kn', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.6, vote_count: 180 },
      { id: 48978, title: 'Thevar Magan', character: 'Shaktivelu', release_date: '1992-10-25', year: '1992', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.6, vote_count: 175 },
      { id: 25775, title: 'Apoorva Sagodharargal', character: 'Appu / Raja / Sethupathi', release_date: '1989-04-14', year: '1989', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.5, vote_count: 190 },
      { id: 27555, title: 'Michael Madana Kama Rajan', character: 'Michael / Madan / Kameshwaran / Raju', release_date: '1990-10-17', year: '1990', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.7, vote_count: 180 },
      { id: 786892, title: 'Kalki 2898 AD', character: 'Supreme Yaskin', release_date: '2024-06-27', year: '2024', original_language: 'te', poster_path: '/jhD1t2yO9h4B2XfJ13yQ5e8x8tQ.jpg', vote_average: 7.6, vote_count: 420 },
      { id: 62451, title: 'Dasavathaaram', character: '10 Avatar Roles', release_date: '2008-06-13', year: '2008', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 7.9, vote_count: 160 },
      { id: 147842, title: 'Vishwaroopam', character: 'Wisam Ahmad Kashmiri', release_date: '2013-01-25', year: '2013', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 7.8, vote_count: 210 },
      { id: 29555, title: 'Vettaiyaadu Vilaiyaadu', character: 'DCP Raghavan', release_date: '2006-08-25', year: '2006', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.1, vote_count: 185 },
      { id: 18231, title: 'Ek Duuje Ke Liye', character: 'Vasu (Vasudevan)', release_date: '1981-06-05', year: '1981', original_language: 'hi', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.0, vote_count: 110 }
    ]
  },
  {
    id: 91555,
    tmdb_id: 91555,
    name: 'Rajinikanth',
    aliases: ['rajini', 'rajinikanth', 'superstar', 'thalaivar', 'shivaji rao gaekwad'],
    known_for_department: 'Acting',
    birthday: '1950-12-12',
    place_of_birth: 'Bengaluru, Karnataka, India',
    profile_path: '/7m62U0LgU491yZ4E3k5e.jpg',
    biography: 'Rajinikanth (born Shivaji Rao Gaekwad) is the undisputed "Superstar" of Indian cinema and a global pop-culture phenomenon. Celebrated for his magnetic charisma, unmatched screen presence, iconic mannerisms, and razor-sharp dialogue delivery, his career spans over 180 films across Tamil, Telugu, Hindi, Kannada, Malayalam, and English. A recipient of the Dadasaheb Phalke Award, Padma Bhushan, and Padma Vibhushan, Rajinikanth transitioned from captivating villainous roles in K. Balachander’s films to the highest-grossing mass hero in Indian film history with monumental blockbusters including Baashha, Thalapathi, Padayappa, Sivaji, Enthiran, and Jailer.',
    filmography: [
      { id: 869642, title: 'Jailer', character: 'Tiger Muthuvel Pandian', release_date: '2023-08-10', year: '2023', original_language: 'ta', poster_path: '/fiA4G9n7Y3PZ9oD6cO51e843y7o.jpg', vote_average: 7.9, vote_count: 320 },
      { id: 1084736, title: 'Vettaiyan', character: 'SP Athiyan IPS', release_date: '2024-10-10', year: '2024', original_language: 'ta', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.5, vote_count: 190 },
      { id: 25120, title: 'Baashha', character: 'Manickam / Manik Baashha', release_date: '1995-01-12', year: '1995', original_language: 'ta', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.9, vote_count: 310 },
      { id: 25119, title: 'Thalapathi', character: 'Surya', release_date: '1991-11-05', year: '1991', original_language: 'ta', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.8, vote_count: 270 },
      { id: 25118, title: 'Padayappa', character: 'Aarupadayappan (Padayappa)', release_date: '1999-04-09', year: '1999', original_language: 'ta', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.6, vote_count: 260 },
      { id: 25117, title: 'Sivaji: The Boss', character: 'Sivaji Arumugam', release_date: '2007-06-15', year: '2007', original_language: 'ta', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.2, vote_count: 280 },
      { id: 45672, title: 'Enthiran (Robot)', character: 'Dr. Vaseegaran / Chitti', release_date: '2010-10-01', year: '2010', original_language: 'ta', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.0, vote_count: 310 },
      { id: 36726, title: 'Hum', character: 'Inspector Kumar Malhotra', release_date: '1991-02-01', year: '1991', original_language: 'hi', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.7, vote_count: 140 },
      { id: 28552, title: 'ChaalBaaz', character: 'Jaggu', release_date: '1989-12-08', year: '1989', original_language: 'hi', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.8, vote_count: 120 },
      { id: 28553, title: 'Andhaa Kanoon', character: 'Vijay Kumar Singh', release_date: '1983-04-07', year: '1983', original_language: 'hi', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.6, vote_count: 95 },
      { id: 48979, title: 'Anthuleni Katha', character: 'Murthy', release_date: '1976-02-27', year: '1976', original_language: 'te', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.2, vote_count: 85 },
      { id: 48980, title: 'Katha Sangama', character: 'Kondaji', release_date: '1976-01-23', year: '1976', original_language: 'kn', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.9, vote_count: 65 },
      { id: 48981, title: 'Bloodstone', character: 'Shyam Sabu', release_date: '1988-10-07', year: '1988', original_language: 'en', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 6.8, vote_count: 50 },
      { id: 376865, title: 'Kabali', character: 'Kabaleeswaran', release_date: '2016-07-22', year: '2016', original_language: 'ta', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.5, vote_count: 240 },
      { id: 512200, title: 'Petta', character: 'Kaali / Pettaivel', release_date: '2019-01-10', year: '2019', original_language: 'ta', poster_path: '/7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.7, vote_count: 220 }
    ]
  },
  {
    id: 91547,
    tmdb_id: 91547,
    name: 'Thalapathy Vijay',
    aliases: ['vijay', 'thalapathy', 'thalapathy vijay', 'joseph vijay', 'vijay chandrasekhar'],
    known_for_department: 'Acting',
    birthday: '1974-06-22',
    place_of_birth: 'Chennai, Tamil Nadu, India',
    profile_path: '/vZ3X8O9vD6cO51e843y7o.jpg',
    biography: 'Joseph Vijay Chandrasekhar, widely known by the honorific "Thalapathy", is one of the highest-grossing superstars in Indian cinema history. Commanding an immense, fiercely loyal pan-global fanbase, Vijay’s films consistently rewrite box-office history. Beginning his cinematic journey as a romantic lead in beloved blockbusters like Poove Unakkaga and Kadhalukku Mariyadhai, he transformed into an unmatched action-thriller force with landmark hits like Ghilli, Pokkiri, Thuppakki, Kaththi, Mersal, Master, Leo, and The Greatest of All Time (GOAT). Known for his effortless dance numbers, understated screen charm, and socially charged dialogues, his filmography stands as a titan of contemporary cinema.',
    filmography: [
      { id: 1075794, title: 'Leo', character: 'Parthiban / Leo Das', release_date: '2023-10-19', year: '2023', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 7.8, vote_count: 480 },
      { id: 1111873, title: 'The Greatest of All Time (GOAT)', character: 'MS Gandhi / Jeevan Gandhi', release_date: '2024-09-05', year: '2024', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 7.4, vote_count: 310 },
      { id: 635302, title: 'Master', character: 'John Durairaj (JD)', release_date: '2021-01-13', year: '2021', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 7.9, vote_count: 360 },
      { id: 449992, title: 'Mersal', character: 'Vetri / Dr. Maaran / Vetrimaaran', release_date: '2017-10-18', year: '2017', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 8.1, vote_count: 340 },
      { id: 25122, title: 'Thuppakki', character: 'Captain Jagdish Dhanapal', release_date: '2012-11-13', year: '2012', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 8.4, vote_count: 350 },
      { id: 284293, title: 'Kaththi', character: 'Kathiresan / Jeevanandham', release_date: '2014-10-22', year: '2014', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 8.3, vote_count: 330 },
      { id: 25123, title: 'Ghilli', character: 'Saravanavelu (Velu)', release_date: '2004-04-17', year: '2004', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 8.6, vote_count: 320 },
      { id: 549554, title: 'Bigil', character: 'Michael Rayappan / Rayappan', release_date: '2019-10-25', year: '2019', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 7.6, vote_count: 290 },
      { id: 387805, title: 'Theri', character: 'DCP Vijay Kumar / Joseph Kuruvilla', release_date: '2016-04-14', year: '2016', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 7.9, vote_count: 280 },
      { id: 25124, title: 'Pokkiri', character: 'Tamizh / Satyamoorthy IPS', release_date: '2007-01-12', year: '2007', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 8.0, vote_count: 250 },
      { id: 843241, title: 'Varisu', character: 'Vijay Rajendran', release_date: '2023-01-11', year: '2023', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 7.1, vote_count: 220 }
    ]
  },
  {
    id: 148360,
    tmdb_id: 148360,
    name: 'Ajith Kumar',
    aliases: ['ajith', 'ajith kumar', 'thala', 'ak'],
    known_for_department: 'Acting',
    birthday: '1971-05-01',
    place_of_birth: 'Secunderabad, Telangana, India',
    profile_path: '/uLgU491yZ4E3k5eVZ3X8O9vD.jpg',
    biography: 'Ajith Kumar, fondly hailed as "Thala" by millions of devoted admirers, is a charismatic titan of Indian cinema and an accomplished professional race car driver. Famed for his uncompromising screen swagger, stylish screen presence, and raw emotional intensity, Ajith has headlined some of the most influential blockbusters in Tamil cinema. From unforgettable early romance dramas like Kadhal Kottai, Vaalee, and Mugavaree to defining anti-hero roles in Mankatha and Billa, and mass blockbusters like Viswasam, Vedalam, and Thunivu, his career is a masterclass in cinematic magnetism.',
    filmography: [
      { id: 725201, title: 'Thunivu', character: 'Dark Devil', release_date: '2023-01-11', year: '2023', original_language: 'ta', poster_path: '/uLgU491yZ4E3k5eVZ3X8O9vD.jpg', vote_average: 7.3, vote_count: 240 },
      { id: 74603, title: 'Mankatha', character: 'ACP Vinayak Mahadev', release_date: '2011-08-31', year: '2011', original_language: 'ta', poster_path: '/uLgU491yZ4E3k5eVZ3X8O9vD.jpg', vote_average: 8.5, vote_count: 290 },
      { id: 18765, title: 'Billa', character: 'David Billa / Saravana Velu', release_date: '2007-12-14', year: '2007', original_language: 'ta', poster_path: '/uLgU491yZ4E3k5eVZ3X8O9vD.jpg', vote_average: 8.1, vote_count: 250 },
      { id: 512201, title: 'Viswasam', character: 'Thookku Durai', release_date: '2019-01-10', year: '2019', original_language: 'ta', poster_path: '/uLgU491yZ4E3k5eVZ3X8O9vD.jpg', vote_average: 7.8, vote_count: 230 },
      { id: 36727, title: 'Aśoka', character: 'Prince Susima', release_date: '2001-10-26', year: '2001', original_language: 'hi', poster_path: '/uLgU491yZ4E3k5eVZ3X8O9vD.jpg', vote_average: 7.2, vote_count: 140 },
      { id: 368294, title: 'Vedalam', character: 'Ganesh / Vedalam', release_date: '2015-11-10', year: '2015', original_language: 'ta', poster_path: '/uLgU491yZ4E3k5eVZ3X8O9vD.jpg', vote_average: 7.7, vote_count: 210 },
      { id: 25125, title: 'Vaalee', character: 'Deva / Shiva', release_date: '1999-04-30', year: '1999', original_language: 'ta', poster_path: '/uLgU491yZ4E3k5eVZ3X8O9vD.jpg', vote_average: 8.4, vote_count: 200 }
    ]
  },
  {
    id: 35742,
    tmdb_id: 35742,
    name: 'Shah Rukh Khan',
    aliases: ['shah rukh khan', 'srk', 'shahrukh', 'king khan', 'badshah of bollywood'],
    known_for_department: 'Acting',
    birthday: '1965-11-02',
    place_of_birth: 'New Delhi, India',
    profile_path: '/8h62U0LgU491yZ4E3k5eVZ3X8.jpg',
    biography: 'Shah Rukh Khan, revered globally as "King Khan" and the "Baadshah of Bollywood", is one of the most celebrated and culturally influential movie stars in world history. Having starred in more than 90 feature films and earned 14 Filmfare Awards, Khan has captured hearts spanning Asia, Europe, the Americas, and Africa. From quintessential romance epics like Dilwale Dulhania Le Jayenge, Kuch Kuch Hota Hai, and Veer-Zaara to intense character studies in Swades, Chak De! India, and My Name Is Khan, and record-obliterating action blockbusters like Jawan and Pathaan, his filmography is a monumental testament to cinematic greatness.',
    filmography: [
      { id: 872585, title: 'Jawan', character: 'Capt. Vikram Rathore / Azad Rathore', release_date: '2023-09-07', year: '2023', original_language: 'hi', poster_path: '/8h62U0LgU491yZ4E3k5eVZ3X8.jpg', vote_average: 7.8, vote_count: 410 },
      { id: 864692, title: 'Pathaan', character: 'Pathaan', release_date: '2023-01-25', year: '2023', original_language: 'hi', poster_path: '/8h62U0LgU491yZ4E3k5eVZ3X8.jpg', vote_average: 7.4, vote_count: 360 },
      { id: 4251, title: 'Dilwale Dulhania Le Jayenge', character: 'Raj Malhotra', release_date: '1995-10-20', year: '1995', original_language: 'hi', poster_path: '/8h62U0LgU491yZ4E3k5eVZ3X8.jpg', vote_average: 8.7, vote_count: 550 },
      { id: 18196, title: 'Hey Ram', character: 'Amjad Ali Khan', release_date: '2000-02-18', year: '2000', original_language: 'ta', poster_path: '/zYF5e8x8tQeE2ZqC2z5yZ3f8e5.jpg', vote_average: 8.2, vote_count: 160 },
      { id: 10428, title: 'Swades', character: 'Mohan Bhargava', release_date: '2004-12-17', year: '2004', original_language: 'hi', poster_path: '/8h62U0LgU491yZ4E3k5eVZ3X8.jpg', vote_average: 8.5, vote_count: 280 },
      { id: 14751, title: 'Chak De! India', character: 'Coach Kabir Khan', release_date: '2007-08-10', year: '2007', original_language: 'hi', poster_path: '/8h62U0LgU491yZ4E3k5eVZ3X8.jpg', vote_average: 8.3, vote_count: 260 }
    ]
  },
  {
    id: 6193,
    tmdb_id: 6193,
    name: 'Leonardo DiCaprio',
    aliases: ['leonardo dicaprio', 'leo dicaprio', 'dicaprio'],
    known_for_department: 'Acting',
    birthday: '1974-11-11',
    place_of_birth: 'Los Angeles, California, USA',
    profile_path: '/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg',
    biography: 'Leonardo DiCaprio is one of the definitive actors of modern Hollywood, renowned for his intense, all-consuming dramatic roles and uncompromising dedication to auteur cinema. An Academy Award, BAFTA, and multi-Golden Globe winner, DiCaprio rose from early critical triumphs in What’s Eating Gilbert Grape and the global blockbuster phenomenon Titanic to collaborate with world-class directors like Martin Scorsese and Christopher Nolan on modern cinematic masterpieces including Inception, The Wolf of Wall Street, The Departed, The Revenant, and Once Upon a Time in Hollywood.',
    filmography: [
      { id: 27205, title: 'Inception', character: 'Dom Cobb', release_date: '2010-07-15', year: '2010', original_language: 'en', poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', vote_average: 8.4, vote_count: 36000 },
      { id: 597, title: 'Titanic', character: 'Jack Dawson', release_date: '1997-11-18', year: '1997', original_language: 'en', poster_path: '/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', vote_average: 7.9, vote_count: 25000 },
      { id: 106646, title: 'The Wolf of Wall Street', character: 'Jordan Belfort', release_date: '2013-12-25', year: '2013', original_language: 'en', poster_path: '/pWHf4khOloNVfSw8Mcw9unYWvIF.jpg', vote_average: 8.0, vote_count: 23500 },
      { id: 281957, title: 'The Revenant', character: 'Hugh Glass', release_date: '2015-12-25', year: '2015', original_language: 'en', poster_path: '/ji3ecJphATlTgWNY0707Z7836qj.jpg', vote_average: 7.6, vote_count: 18000 },
      { id: 1422, title: 'The Departed', character: 'Billy Costigan', release_date: '2006-10-05', year: '2006', original_language: 'en', poster_path: '/nT97ifVT2J1yMQmeq20Qblg61T.jpg', vote_average: 8.2, vote_count: 14500 }
    ]
  },
  {
    id: 525,
    tmdb_id: 525,
    name: 'Christopher Nolan',
    aliases: ['christopher nolan', 'nolan', 'chris nolan'],
    known_for_department: 'Directing & Filmmaking',
    birthday: '1970-07-30',
    place_of_birth: 'London, England, UK',
    profile_path: '/xuAIuYSmsUzKlUMBFGVZaWsY3Z5.jpg',
    biography: 'Christopher Nolan CBE is one of the most visionary and influential filmmakers in the history of cinema. Celebrated for his non-linear storytelling, metaphysical themes, practical in-camera effects, and mastery of large-format IMAX cinematography, Nolan has earned multiple Academy Awards, BAFTAs, and Golden Globes. From his breakout puzzle-box thriller Memento and The Dark Knight Trilogy to mind-bending sci-fi triumphs Inception, Interstellar, and the Academy Award Best Picture-winning Oppenheimer, his filmography redefined modern cinematic grandeur.',
    filmography: [
      { id: 872585, title: 'Oppenheimer', character: 'Director & Screenwriter', release_date: '2023-07-19', year: '2023', original_language: 'en', poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', vote_average: 8.1, vote_count: 9200 },
      { id: 157336, title: 'Interstellar', character: 'Director & Screenwriter', release_date: '2014-11-05', year: '2014', original_language: 'en', poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', vote_average: 8.4, vote_count: 35000 },
      { id: 27205, title: 'Inception', character: 'Director & Screenwriter', release_date: '2010-07-15', year: '2010', original_language: 'en', poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', vote_average: 8.4, vote_count: 36000 },
      { id: 155, title: 'The Dark Knight', character: 'Director & Screenwriter', release_date: '2008-07-16', year: '2008', original_language: 'en', poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg', vote_average: 8.5, vote_count: 32000 },
      { id: 77, title: 'Memento', character: 'Director & Screenwriter', release_date: '2000-10-11', year: '2000', original_language: 'en', poster_path: '/yuNs09hvpHVU1cBTCAk9z9PC2QC.jpg', vote_average: 8.2, vote_count: 14000 }
    ]
  },
  {
    id: 1508809,
    tmdb_id: 1508809,
    name: 'Vijay Deverakonda',
    aliases: ['vijay deverakonda', 'vijay devarkunda', 'deverakonda', 'rowdy', 'vijay devarkonda'],
    known_for_department: 'Acting',
    birthday: '1989-05-09',
    place_of_birth: 'Achampet, Telangana, India',
    profile_path: '/8oVIWyIoFUal8SJFnmCUtkkm1HP.jpg',
    biography: 'Deverakonda Vijay Sai, professionally celebrated as Vijay Deverakonda or "Rowdy", is a charismatic pan-Indian star and youth icon hailing from Telugu cinema. Rising to national prominence with his career-defining, electrifying performance in the pathbreaking romantic drama Arjun Reddy, he quickly solidified his box-office supremacy with blockbuster romantic comedies like Geetha Govindam and emotional dramas like Dear Comrade and Pelli Choopulu. Known for his fearless, raw screen swagger, vulnerable emotional depth, and versatile multilingual presence across Telugu, Tamil, and Hindi cinema, his stardom continues to surge.',
    filmography: [
      { id: 468370, title: 'Arjun Reddy', character: 'Dr. Arjun Reddy Deshmukh', release_date: '2017-08-25', year: '2017', original_language: 'te', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.2, vote_count: 220 },
      { id: 538153, title: 'Geetha Govindam', character: 'Vijay Govind', release_date: '2018-08-15', year: '2018', original_language: 'te', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.7, vote_count: 180 },
      { id: 588228, title: 'Dear Comrade', character: 'Chaitanya "Bobby" Krishna', release_date: '2019-07-26', year: '2019', original_language: 'te', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.8, vote_count: 150 },
      { id: 969681, title: 'Kushi', character: 'Viplav', release_date: '2023-09-01', year: '2023', original_language: 'te', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.1, vote_count: 90 },
      { id: 1113271, title: 'The Family Star', character: 'Govardhan', release_date: '2024-04-05', year: '2024', original_language: 'te', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 6.8, vote_count: 85 },
      { id: 786892, title: 'Kalki 2898 AD', character: 'Arjuna (Guest Appearance)', release_date: '2024-06-27', year: '2024', original_language: 'te', poster_path: '/jhD1t2yO9h4B2XfJ13yQ5e8x8tQ.jpg', vote_average: 7.6, vote_count: 420 },
      { id: 407076, title: 'Pelli Choopulu', character: 'Prashanth', release_date: '2016-07-29', year: '2016', original_language: 'te', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.0, vote_count: 110 },
      { id: 554605, title: 'Taxiwaala', character: 'Shiva', release_date: '2018-11-17', year: '2018', original_language: 'te', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.2, vote_count: 95 },
      { id: 512202, title: 'Mahanati', character: 'Vijay Anthony', release_date: '2018-05-09', year: '2018', original_language: 'te', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.4, vote_count: 140 },
      { id: 521876, title: 'NOTA', character: 'Varun Subramanyam', release_date: '2018-10-05', year: '2018', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 6.9, vote_count: 80 },
      { id: 668270, title: 'Liger', character: 'Shashwath Agarwal (Liger)', release_date: '2022-08-25', year: '2022', original_language: 'hi', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 5.6, vote_count: 110 }
    ]
  },
  {
    id: 1123766,
    tmdb_id: 1123766,
    name: 'Vijay Sethupathi',
    aliases: ['vijay sethupathi', 'sethupathi', 'makkal selvan', 'vjs'],
    known_for_department: 'Acting',
    birthday: '1978-01-16',
    place_of_birth: 'Rajapalayam, Tamil Nadu, India',
    profile_path: '/a3HWdfCAbplrvoMNEJCjnkbqqOo.jpg',
    biography: 'Vijaya Gurunatha Sethupathi, revered across world cinema as "Makkal Selvan" (People’s Treasure), is one of the most daring, naturalistic, and acclaimed actors in contemporary Indian cinema. Recipient of a National Film Award and multiple Filmfare Awards, Sethupathi effortlessly oscillates between deeply eccentric characters, vulnerable romantic leads, and menacing antagonists. From cult classic indie hits like Pizza and Soodhu Kavvum to emotionally devastating masterworks like 96, Super Deluxe, and Maharaja, as well as pan-Indian blockbusters Vikram, Master, and Jawan, his cinematic mastery is universally lauded.',
    filmography: [
      { id: 1113221, title: 'Maharaja', character: 'Maharaja', release_date: '2024-06-14', year: '2024', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.5, vote_count: 420 },
      { id: 442249, title: 'Vikram Vedha', character: 'Vedha', release_date: '2017-07-21', year: '2017', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.6, vote_count: 360 },
      { id: 549553, title: '96', character: 'K. Ramachandran (Ram)', release_date: '2018-10-04', year: '2018', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.7, vote_count: 290 },
      { id: 489791, title: 'Super Deluxe', character: 'Shilpa / Manickam', release_date: '2019-03-29', year: '2019', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.4, vote_count: 240 },
      { id: 635302, title: 'Master', character: 'Bhavani', release_date: '2021-01-13', year: '2021', original_language: 'ta', poster_path: '/vZ3X8O9vD6cO51e843y7o.jpg', vote_average: 7.9, vote_count: 360 },
      { id: 869641, title: 'Vikram', character: 'Santhanam', release_date: '2022-06-03', year: '2022', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.3, vote_count: 350 },
      { id: 872585, title: 'Jawan', character: 'Kaalie Gaikwad', release_date: '2023-09-07', year: '2023', original_language: 'hi', poster_path: '/8h62U0LgU491yZ4E3k5eVZ3X8.jpg', vote_average: 7.8, vote_count: 410 },
      { id: 843242, title: 'Merry Christmas', character: 'Albert Arokiasamy', release_date: '2024-01-12', year: '2024', original_language: 'hi', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.4, vote_count: 160 },
      { id: 969682, title: 'Farzi', character: 'Michael Vedanayagam', release_date: '2023-02-10', year: '2023', original_language: 'hi', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.1, vote_count: 280 },
      { id: 137093, title: 'Pizza', character: 'Michael Karthikeyan', release_date: '2012-10-19', year: '2012', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.0, vote_count: 170 },
      { id: 187652, title: 'Soodhu Kavvum', character: 'Das', release_date: '2013-05-01', year: '2013', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.4, vote_count: 210 },
      { id: 725202, title: 'Uppena', character: 'Kotagiri Raayanam', release_date: '2021-02-12', year: '2021', original_language: 'te', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.3, vote_count: 120 }
    ]
  },
  {
    id: 237610,
    tmdb_id: 237610,
    name: 'Vijay Antony',
    aliases: ['vijay antony', 'antony'],
    known_for_department: 'Acting & Sound',
    birthday: '1975-07-24',
    place_of_birth: 'Tirunelveli, Tamil Nadu, India',
    profile_path: '/e8iZK9GFjDAHWKOQGCcfHWuZFxD.jpg',
    biography: 'Vijay Antony is an acclaimed Indian actor, music composer, playback singer, and producer predominantly working in Tamil cinema. After composing historic musical chartbusters like "Naaka Mukka", he made a celebrated transition to acting with riveting psychological thrillers and emotional dramas.',
    filmography: [
      { id: 387806, title: 'Pichaikkaran', character: 'Arul Selvakumar', release_date: '2016-03-04', year: '2016', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.1, vote_count: 210 },
      { id: 284294, title: 'Salim', character: 'Dr. Salim', release_date: '2014-08-29', year: '2014', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.6, vote_count: 140 },
      { id: 137094, title: 'Naan', character: 'Karthik / Salim', release_date: '2012-08-15', year: '2012', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.8, vote_count: 160 },
      { id: 843243, title: 'Pichaikkaran 2', character: 'Vijay Gurumoorthy / Sathya', release_date: '2023-05-19', year: '2023', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 6.9, vote_count: 110 },
      { id: 588229, title: 'Kolaigaran', character: 'Prabhakaran', release_date: '2019-06-07', year: '2019', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.5, vote_count: 95 },
      { id: 1113272, title: 'Mazhai Pidikkatha Manithan', character: 'Salim', release_date: '2024-08-02', year: '2024', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 6.8, vote_count: 65 },
      { id: 407077, title: 'Saithan', character: 'Dinesh', release_date: '2016-12-01', year: '2016', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.1, vote_count: 85 }
    ]
  },
  {
    id: 1551045,
    tmdb_id: 1551045,
    name: 'Vijay Varma',
    aliases: ['vijay varma'],
    known_for_department: 'Acting',
    birthday: '1986-03-29',
    place_of_birth: 'Hyderabad, Telangana, India',
    profile_path: '/A46ekiPFC3vA1442FJmiIudpxX1.jpg',
    biography: 'Vijay Varma is an acclaimed Indian actor distinguished for his magnetic versatility, raw intensity, and chameleon-like dramatic depth in Hindi cinema and premier streaming series including Gully Boy, Darlings, Dahaad, Jaane Jaan, and Mirzapur.',
    filmography: [
      { id: 508763, title: 'Gully Boy', character: 'Moeen Arif', release_date: '2019-02-14', year: '2019', original_language: 'hi', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.0, vote_count: 320 },
      { id: 843244, title: 'Darlings', character: 'Hamza Shaikh', release_date: '2022-08-05', year: '2022', original_language: 'hi', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.6, vote_count: 180 },
      { id: 1113273, title: 'Dahaad', character: 'Anand Swarnakar', release_date: '2023-05-12', year: '2023', original_language: 'hi', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.9, vote_count: 150 },
      { id: 1113274, title: 'Jaane Jaan', character: 'Inspector Karan Anand', release_date: '2023-09-21', year: '2023', original_language: 'hi', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.5, vote_count: 140 },
      { id: 407078, title: 'Pink', character: 'Ankit Malhotra', release_date: '2016-09-16', year: '2016', original_language: 'hi', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.1, vote_count: 220 }
    ]
  },
  {
    id: 85720,
    tmdb_id: 85720,
    name: 'Suriya',
    aliases: ['suriya', 'surya', 'suriya sivakumar', 'rolex'],
    known_for_department: 'Acting',
    birthday: '1975-07-23',
    place_of_birth: 'Chennai, Tamil Nadu, India',
    profile_path: '/hIFXv3gIjlNS78gJmaguEOxvfPH.jpg',
    biography: 'Saravanan Sivakumar, celebrated across world cinema as Suriya, is a National Film Award-winning titan of Indian cinema. Acclaimed for his transformative intensity and socially impactful cinema, Suriya has delivered historic masterpieces including Soorarai Pottru, Jai Bhim, Ghajini, Singam, Kaakha Kaakha, and his legendary cameo as Rolex in Vikram.',
    filmography: [
      { id: 653569, title: 'Soorarai Pottru', character: 'Nedumaaran Rajangam (Maara)', release_date: '2020-11-12', year: '2020', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.9, vote_count: 450 },
      { id: 890525, title: 'Jai Bhim', character: 'Advocate K. Chandru', release_date: '2021-11-02', year: '2021', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.8, vote_count: 420 },
      { id: 869641, title: 'Vikram', character: 'Rolex (Cameo)', release_date: '2022-06-03', year: '2022', original_language: 'ta', poster_path: '/4b3qW5eIocv2sPspqg17J9vD6o8.jpg', vote_average: 8.3, vote_count: 350 },
      { id: 872586, title: 'Kanguva', character: 'Kanguva / Francis', release_date: '2024-11-14', year: '2024', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.2, vote_count: 210 },
      { id: 25126, title: 'Ghajini', character: 'Sanjay Ramaswamy', release_date: '2005-09-29', year: '2005', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.3, vote_count: 280 }
    ]
  },
  {
    id: 587982,
    tmdb_id: 587982,
    name: 'Sivakarthikeyan',
    aliases: ['sivakarthikeyan', 'sk', 'prince sk'],
    known_for_department: 'Acting',
    birthday: '1985-02-17',
    place_of_birth: 'Singampunari, Tamil Nadu, India',
    profile_path: '/jgy9y3V8QqZmu5r8sMxrGCzXuyp.jpg',
    biography: 'Sivakarthikeyan is one of Tamil cinema’s most beloved and rapidly ascending superstars. Rising from stand-up comedy and television hosting to leading massive family and action blockbusters like Doctor, Don, Maaveeran, and the historic biographical triumph Amaran, his infectious charm and screen vitality have won millions worldwide.',
    filmography: [
      { id: 1113275, title: 'Amaran', character: 'Major Mukund Varadarajan', release_date: '2024-10-31', year: '2024', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.6, vote_count: 380 },
      { id: 1007802, title: 'Maaveeran', character: 'Sathya (Maaveeran)', release_date: '2023-07-14', year: '2023', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.9, vote_count: 240 },
      { id: 673593, title: 'Doctor', character: 'Dr. Varun', release_date: '2021-10-09', year: '2021', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 8.0, vote_count: 290 },
      { id: 818647, title: 'Don', character: 'Chakaravarthi G.', release_date: '2022-05-13', year: '2022', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.6, vote_count: 210 },
      { id: 693134, title: 'Ayalaan', character: 'Tamizh', release_date: '2024-01-12', year: '2024', original_language: 'ta', poster_path: '/eE5GjVl7m62U0LgU491yZ4E3k5e.jpg', vote_average: 7.3, vote_count: 170 }
    ]
  }
];

export function findCuratedArtist(query) {
  if (!query) return null;
  const rawQ = query.toLowerCase().trim();
  const canonical = ARTIST_ALIASES[rawQ] || null;
  const q = canonical ? canonical.toLowerCase() : rawQ;

  // 1. Priority: Canonical alias match
  if (canonical) {
    const canonMatch = CURATED_ARTISTS.find((a) => a.name.toLowerCase() === canonical.toLowerCase());
    if (canonMatch) return canonMatch;
  }

  // 2. Exact name match
  const exact = CURATED_ARTISTS.find((a) => a.name.toLowerCase() === q);
  if (exact) return exact;

  // 3. Exact alias match
  const aliasMatch = CURATED_ARTISTS.find(
    (a) => a.aliases && a.aliases.some((al) => al.toLowerCase() === rawQ || al.toLowerCase() === q)
  );
  if (aliasMatch) return aliasMatch;

  // 4. Substring in name (if query is sufficiently long)
  if (q.length >= 3) {
    const subMatch = CURATED_ARTISTS.find(
      (a) => a.name.toLowerCase().includes(q) || q.includes(a.name.toLowerCase())
    );
    if (subMatch) return subMatch;
  }

  return null;
}

export function findMatchingCuratedArtists(query) {
  if (!query) return [];
  const rawQ = query.toLowerCase().trim();
  const canonical = ARTIST_ALIASES[rawQ] || null;
  const q = canonical ? canonical.toLowerCase() : rawQ;

  const results = [];
  const seenIds = new Set();

  // 1. Priority: Canonical alias match
  if (canonical) {
    const canonMatch = CURATED_ARTISTS.find((a) => a.name.toLowerCase() === canonical.toLowerCase());
    if (canonMatch) {
      results.push(canonMatch);
      seenIds.add(canonMatch.id);
    }
  }

  // 2. Exact name or exact alias match
  for (const a of CURATED_ARTISTS) {
    if (seenIds.has(a.id)) continue;
    const nameLower = a.name.toLowerCase();
    if (nameLower === q || nameLower === rawQ) {
      results.push(a);
      seenIds.add(a.id);
      continue;
    }
    if (a.aliases && a.aliases.some((alias) => {
      const alLower = alias.toLowerCase();
      return alLower === rawQ || alLower === q;
    })) {
      results.push(a);
      seenIds.add(a.id);
      continue;
    }
  }

  // 3. Partial / substring match (only for query length >= 3)
  if (q.length >= 3) {
    for (const a of CURATED_ARTISTS) {
      if (seenIds.has(a.id)) continue;
      const nameLower = a.name.toLowerCase();
      if (nameLower.includes(q) || (q.length >= 4 && q.includes(nameLower))) {
        results.push(a);
        seenIds.add(a.id);
      }
    }
  }

  return results;
}

export function formatPersonDetails(personData, curatedFallback = null) {
  const target = personData || curatedFallback;
  if (!target) return null;

  const rawCast = target.combined_credits?.cast || [];
  const rawCrew = target.combined_credits?.crew || [];

  const isDirectorOrWriter = (target.known_for_department || '').toLowerCase().includes('direct') ||
    (target.known_for_department || '').toLowerCase().includes('writ');

  const combinedItems = isDirectorOrWriter
    ? [
        ...rawCrew.filter((c) => c.job === 'Director' || c.department === 'Directing'),
        ...rawCast,
      ]
    : [
        ...rawCast,
        ...rawCrew.filter((c) => c.job === 'Director' || c.job === 'Writer'),
      ];

  const seenIds = new Set();
  const filmography = [];
  const langCounts = {};

  if (combinedItems.length > 0) {
    for (const item of combinedItems) {
      if (!item || !item.id || seenIds.has(item.id)) continue;
      seenIds.add(item.id);

      const title = item.title || item.name || 'Untitled';
      const releaseDate = item.release_date || item.first_air_date || '';
      const year = releaseDate && releaseDate.length >= 4 ? releaseDate.slice(0, 4) : '—';
      const lang = (item.original_language || 'en').toLowerCase();
      const langLabel = getLanguageLabel(lang);

      langCounts[lang] = (langCounts[lang] || 0) + 1;

      filmography.push({
        id: item.id,
        title,
        name: title,
        character: item.character || (item.job ? item.job : ''),
        release_date: releaseDate,
        first_air_date: releaseDate,
        year,
        original_language: lang,
        language_name: langLabel,
        poster_path: item.poster_path || null,
        backdrop_path: item.backdrop_path || null,
        vote_average: item.vote_average ? Number(item.vote_average.toFixed(1)) : (item.vote_count > 0 ? 7.0 : null),
        vote_count: item.vote_count || 0,
        overview: item.overview || '',
        media_type: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
        popularity: item.popularity || 0,
      });
    }
  }

  // Fallback to curated filmography if TMDB credits are empty
  if (filmography.length === 0 && (target.filmography || curatedFallback?.filmography)) {
    const list = target.filmography || curatedFallback.filmography || [];
    for (const item of list) {
      if (!item || !item.id || seenIds.has(item.id)) continue;
      seenIds.add(item.id);

      const title = item.title || item.name || 'Untitled';
      const releaseDate = item.release_date || item.first_air_date || '';
      const year = item.year || (releaseDate && releaseDate.length >= 4 ? releaseDate.slice(0, 4) : '—');
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
        vote_average: item.vote_average || 7.5,
        vote_count: item.vote_count || 100,
        overview: item.overview || '',
        media_type: item.media_type || 'movie',
      });
    }
  }

  // Sort: newest first
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
    name: target.name || curatedFallback?.name || 'Artist',
    profile_path: target.profile_path || curatedFallback?.profile_path || null,
    known_for_department: target.known_for_department || curatedFallback?.known_for_department || 'Acting',
    biography: target.biography || curatedFallback?.biography || 'Acclaimed artist in world cinema.',
    birthday: target.birthday || curatedFallback?.birthday || null,
    deathday: target.deathday || curatedFallback?.deathday || null,
    place_of_birth: target.place_of_birth || curatedFallback?.place_of_birth || null,
    popularity: target.popularity || 0,
    total_films: filmography.length,
    languages,
    filmography,
  };
}

export const tmdb = {
  getApiKey,
  setApiKey,
  clearApiKey,
  trending: async (window = 'week') => {
    const isQ3_2026 = (m) => {
      if (!m || !m.release_date) return false;
      return m.release_date >= '2026-07-01' && m.release_date <= '2026-09-30';
    };

    const q3Curated = (THEATRICAL_NOW_PLAYING || []).filter(isQ3_2026);

    try {
      const [globalRes, indianRes] = await Promise.allSettled([
        tmdbFetch('/discover/movie', {
          'primary_release_date.gte': '2026-07-01',
          'primary_release_date.lte': '2026-09-30',
          sort_by: 'popularity.desc',
          page: 1,
        }),
        tmdbFetch('/discover/movie', {
          region: 'IN',
          with_original_language: 'ta|te|hi|ml|kn',
          'primary_release_date.gte': '2026-07-01',
          'primary_release_date.lte': '2026-09-30',
          sort_by: 'popularity.desc',
          page: 1,
        }),
      ]);

      const liveGlobal = (globalRes.status === 'fulfilled' && globalRes.value?.results ? globalRes.value.results : []).filter(isQ3_2026);
      const liveIndian = (indianRes.status === 'fulfilled' && indianRes.value?.results ? indianRes.value.results : []).filter(isQ3_2026);

      const seen = new Set();
      const merged = [];

      // 1. Curated July-September 2026 blockbusters first
      for (const m of q3Curated) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          merged.push(m);
        }
      }

      // 2. Add additional live Indian discoveries in July-September 2026
      for (const m of liveIndian) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          merged.push(m);
        }
      }

      // 3. Add additional live Global discoveries in July-September 2026
      for (const m of liveGlobal) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          merged.push(m);
        }
      }

      const strictlyQ3 = merged.filter(isQ3_2026);
      if (strictlyQ3.length > 0) {
        return {
          page: 1,
          results: strictlyQ3,
          total_pages: 1,
          total_results: strictlyQ3.length,
        };
      }
    } catch {
      // Fallback to curated
    }

    return {
      page: 1,
      results: q3Curated,
      total_pages: 1,
      total_results: q3Curated.length,
    };
  },
  trendingTv: async (window = 'week') => {
    try {
      const data = await tmdbFetch(`/trending/tv/${window}`);
      if (data?.results?.length > 0) {
        const liveResults = data.results.map((item) => ({
          ...item,
          media_type: 'tv',
          title: item.title || item.name,
          release_date: item.release_date || item.first_air_date,
        }));
        const seen = new Set();
        const merged = [];
        for (const item of [...CURATED_TV_SHOWS, ...liveResults]) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            merged.push(item);
          }
        }
        return {
          page: 1,
          results: merged,
          total_pages: 1,
          total_results: merged.length,
        };
      }
    } catch {
      // Fallback
    }
    return {
      page: 1,
      results: CURATED_TV_SHOWS,
      total_pages: 1,
      total_results: CURATED_TV_SHOWS.length,
    };
  },
  search: async (query, page = 1) => {
    const rawQ = (query || '').toLowerCase().trim();
    if (!rawQ) {
      return { page: 1, results: [], total_pages: 0, total_results: 0, artist: null, similarArtists: [] };
    }

    const resolvedCanonical = ARTIST_ALIASES[rawQ] || null;
    const q = resolvedCanonical ? resolvedCanonical.toLowerCase() : rawQ;
    const queryForApi = resolvedCanonical || query;

    let artist = null;
    let similarArtists = [];
    const curatedMatches = findMatchingCuratedArtists(q);
    const curatedArtist = curatedMatches[0] || findCuratedArtist(q);

    try {
      const [multiData, personData] = await Promise.allSettled([
        tmdbFetch('/search/multi', { query: queryForApi, page, include_adult: false }),
        tmdbFetch('/search/person', { query: queryForApi, page: 1, include_adult: false }),
      ]);

      const topMultiPerson = (multiData.status === 'fulfilled' && multiData.value?.results)
        ? multiData.value.results.find((r, idx) => idx < 2 && r.media_type === 'person')
        : null;

      const rawPersonResults = (personData.status === 'fulfilled' && personData.value?.results)
        ? personData.value.results
        : [];

      const topSearchPerson = rawPersonResults.length > 0 ? rawPersonResults[0] : null;

      // 1. Build Similar Artists candidates (Curated + TMDB Search)
      const seenArtistIds = new Set();
      const seenArtistNames = new Set();

      for (const cur of curatedMatches) {
        seenArtistIds.add(cur.id);
        if (cur.tmdb_id) seenArtistIds.add(cur.tmdb_id);
        seenArtistNames.add(cur.name.toLowerCase());
        similarArtists.push({
          id: cur.id,
          tmdb_id: cur.tmdb_id,
          name: cur.name,
          profile_path: cur.profile_path,
          known_for_department: cur.known_for_department || 'Acting',
          total_films: cur.filmography?.length || 20,
          popularity: cur.popularity || 85,
          isCurated: true,
        });
      }

      for (const p of rawPersonResults) {
        const pId = p.id;
        const pName = (p.name || '').toLowerCase();
        // Skip if already in curated or already seen (e.g. "Vijay" when "Thalapathy Vijay" is present)
        const isDuplicateVijay = pId === 91547 || (pName === 'vijay' && seenArtistNames.has('thalapathy vijay'));
        if (
          !seenArtistIds.has(pId) &&
          !seenArtistNames.has(pName) &&
          !isDuplicateVijay &&
          pName.length >= 2 &&
          (p.known_for_department === 'Acting' || p.known_for_department === 'Directing' || p.popularity > 2)
        ) {
          seenArtistIds.add(pId);
          seenArtistNames.add(pName);
          similarArtists.push({
            id: p.id,
            tmdb_id: p.id,
            name: p.name,
            profile_path: p.profile_path,
            known_for_department: p.known_for_department || 'Acting',
            total_films: (p.known_for || []).length,
            popularity: p.popularity || 10,
            isCurated: false,
          });
        }
      }

      // If only 1 artist was found or for broad legend queries, include similar related stars from curated catalog
      if (similarArtists.length <= 1) {
        const relatedCurated = CURATED_ARTISTS.filter((a) => !seenArtistKeys.has(a.name.toLowerCase())).slice(0, 5);
        for (const cur of relatedCurated) {
          similarArtists.push({
            id: cur.id,
            tmdb_id: cur.tmdb_id,
            name: cur.name,
            profile_path: cur.profile_path,
            known_for_department: cur.known_for_department || 'Acting',
            total_films: cur.filmography?.length || 20,
            popularity: cur.popularity || 80,
            isCurated: true,
          });
        }
      }

      let detectedPerson = null;
      if (curatedArtist) {
        detectedPerson = { id: curatedArtist.tmdb_id || curatedArtist.id, name: curatedArtist.name };
      } else if (topMultiPerson) {
        detectedPerson = topMultiPerson;
      } else if (topSearchPerson) {
        const pName = (topSearchPerson.name || '').toLowerCase();
        const topMovie = (multiData.status === 'fulfilled' && multiData.value?.results)
          ? multiData.value.results.find((r) => r.media_type === 'movie' || r.media_type === 'tv')
          : null;
        const exactMovieTitle = topMovie && (topMovie.title || topMovie.name || '').toLowerCase() === q;
        if (!exactMovieTitle && (pName === q || q.includes(pName) || (pName.includes(q) && topSearchPerson.popularity > 15))) {
          detectedPerson = topSearchPerson;
        }
      }

      if (detectedPerson) {
        try {
          const fullPerson = await tmdbFetch(`/person/${detectedPerson.id}`, {
            append_to_response: 'combined_credits',
          });
          artist = formatPersonDetails(fullPerson, curatedArtist);
        } catch {
          if (curatedArtist) artist = formatPersonDetails(curatedArtist, curatedArtist);
        }
      } else if (curatedArtist) {
        try {
          if (curatedArtist.tmdb_id) {
            const fullPerson = await tmdbFetch(`/person/${curatedArtist.tmdb_id}`, {
              append_to_response: 'combined_credits',
            });
            artist = formatPersonDetails(fullPerson, curatedArtist);
          } else {
            artist = formatPersonDetails(curatedArtist, curatedArtist);
          }
        } catch {
          artist = formatPersonDetails(curatedArtist, curatedArtist);
        }
      }

      if (multiData.status === 'fulfilled' && multiData.value?.results?.length > 0) {
        const filteredMovies = multiData.value.results
          .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
          .map((item) => ({
            ...item,
            title: item.title || item.name,
            release_date: item.release_date || item.first_air_date,
          }));

        return {
          page: multiData.value.page || 1,
          results: filteredMovies,
          total_pages: multiData.value.total_pages || 1,
          total_results: filteredMovies.length,
          artist,
          similarArtists,
        };
      }
    } catch {
      // Fallback below
    }

    if (curatedArtist && !artist) {
      artist = formatPersonDetails(curatedArtist, curatedArtist);
    }

    if (similarArtists.length === 0) {
      for (const cur of curatedMatches) {
        similarArtists.push({
          id: cur.id,
          tmdb_id: cur.tmdb_id,
          name: cur.name,
          profile_path: cur.profile_path,
          known_for_department: cur.known_for_department || 'Acting',
          total_films: cur.filmography?.length || 20,
          popularity: cur.popularity || 85,
          isCurated: true,
        });
      }
      if (similarArtists.length <= 1) {
        const others = CURATED_ARTISTS.filter((a) => !curatedMatches.some((cm) => cm.id === a.id)).slice(0, 5);
        for (const cur of others) {
          similarArtists.push({
            id: cur.id,
            tmdb_id: cur.tmdb_id,
            name: cur.name,
            profile_path: cur.profile_path,
            known_for_department: cur.known_for_department || 'Acting',
            total_films: cur.filmography?.length || 20,
            popularity: cur.popularity || 80,
            isCurated: true,
          });
        }
      }
    }

    const seenIds = new Set();
    const pool = [...ALL_CURATED_MOVIES, ...CURATED_TV_SHOWS];
    const matches = pool.filter((m) => {
      if (seenIds.has(m.id)) return false;
      const titleMatch = (m.title || m.name || '').toLowerCase().includes(q);
      const dirMatch = (m.director || m.creator || '').toLowerCase().includes(q);
      const musicMatch = (m.music_director || '').toLowerCase().includes(q);
      const castMatch = (m.cast || []).some((c) =>
        (c.name || '').toLowerCase().includes(q) || (c.character || '').toLowerCase().includes(q)
      );
      if (titleMatch || dirMatch || musicMatch || castMatch) {
        seenIds.add(m.id);
        return true;
      }
      return false;
    });

    return {
      page: 1,
      results: matches,
      total_pages: 1,
      total_results: matches.length,
      artist,
      similarArtists,
    };
  },
  searchArtist: async (query) => {
    const rawQ = (query || '').toLowerCase().trim();
    if (!rawQ) return null;
    const resolvedCanonical = ARTIST_ALIASES[rawQ] || null;
    const q = resolvedCanonical ? resolvedCanonical.toLowerCase() : rawQ;
    const queryForApi = resolvedCanonical || query;
    const curated = findCuratedArtist(q) || (resolvedCanonical ? findCuratedArtist(resolvedCanonical) : null);
    try {
      const searchTarget = curated?.name || queryForApi;
      const res = await tmdbFetch('/search/person', { query: searchTarget, page: 1 });
      if (res?.results?.length > 0) {
        const topPerson = (curated && curated.tmdb_id)
          ? res.results.find((r) => r.id === curated.tmdb_id) || res.results[0]
          : res.results[0];
        const fullPerson = await tmdbFetch(`/person/${topPerson.id}`, {
          append_to_response: 'combined_credits',
        });
        return formatPersonDetails(fullPerson, curated);
      }
    } catch {
      // ignore
    }
    return curated ? formatPersonDetails(curated, curated) : null;
  },
  personDetails: async (id) => {
    const curated = CURATED_ARTISTS.find(
      (a) => a.id === Number(id) || a.tmdb_id === Number(id) || String(a.id) === String(id)
    );
    try {
      const targetTmdbId = curated?.tmdb_id || id;
      const fullPerson = await tmdbFetch(`/person/${targetTmdbId}`, {
        append_to_response: 'combined_credits',
      });
      return formatPersonDetails(fullPerson, curated);
    } catch {
      if (curated) {
        return formatPersonDetails(curated, curated);
      }
      return null;
    }
  },
  details: async (id) => {
    const curatedMatch = ALL_CURATED_MOVIES.find((m) => m.id === Number(id) || String(m.id) === String(id)) ||
      CURATED_TV_SHOWS.find((m) => m.id === Number(id) || String(m.id) === String(id));
    if (curatedMatch) {
      const isTv = curatedMatch.media_type === 'tv' || !!curatedMatch.number_of_seasons || !!curatedMatch.first_air_date;

      const genreLookup = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        99: 'Documentary',
        18: 'Drama',
        10751: 'Family',
        14: 'Fantasy',
        36: 'History',
        27: 'Horror',
        10402: 'Music',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Sci-Fi',
        10770: 'TV Movie',
        53: 'Thriller',
        10752: 'War',
        37: 'Western',
        10759: 'Action & Adventure',
        10762: 'Kids',
        10763: 'News',
        10764: 'Reality',
        10765: 'Sci-Fi & Fantasy',
        10766: 'Soap',
        10767: 'Talk',
        10768: 'War & Politics',
      };

      const fullCurated = {
        id: curatedMatch.id,
        title: curatedMatch.title || curatedMatch.name,
        name: curatedMatch.name || curatedMatch.title,
        tagline: curatedMatch.tagline || (isTv ? 'Top Trending Web Series' : 'Now Screening in Cinemas Worldwide'),
        overview: curatedMatch.overview,
        release_date: curatedMatch.release_date || curatedMatch.first_air_date,
        first_air_date: isTv ? (curatedMatch.first_air_date || curatedMatch.release_date) : null,
        full_release_date: curatedMatch.full_release_date,
        media_type: isTv ? 'tv' : 'movie',
        number_of_seasons: curatedMatch.number_of_seasons,
        number_of_episodes: curatedMatch.number_of_episodes,
        runtime: curatedMatch.runtime || 150,
        duration: curatedMatch.duration || (curatedMatch.number_of_seasons ? `${curatedMatch.number_of_seasons} Season${curatedMatch.number_of_seasons > 1 ? 's' : ''}` : '2h 30m'),
        director: curatedMatch.director,
        music_director: curatedMatch.music_director,
        producers: curatedMatch.producers,
        writers: curatedMatch.writers,
        cinematography: curatedMatch.cinematography,
        vote_average: curatedMatch.vote_average,
        vote_count: curatedMatch.vote_count,
        poster_path: curatedMatch.poster_path,
        backdrop_path: curatedMatch.backdrop_path,
        genres: curatedMatch.genre_ids ? curatedMatch.genre_ids.map((gid) => ({
          id: gid,
          name: genreLookup[gid] || 'Drama'
        })) : [{ id: 28, name: 'Action' }],
        original_language: curatedMatch.original_language || 'ta',
        ratings: curatedMatch.ratings,
        videos: {
          results: [
            {
              site: 'YouTube',
              type: 'Trailer',
              official: true,
              key: curatedMatch.trailerKey || 'wUn05hdkhSk',
              name: `${curatedMatch.title || curatedMatch.name} Official Trailer`,
            },
          ],
        },
        credits: {
          cast: (curatedMatch.cast && curatedMatch.cast.length > 0) ? curatedMatch.cast : [
            { id: 1, name: 'Lead Protagonist', character: 'Hero', gender: 2, order: 0 },
            { id: 2, name: 'Lead Female', character: 'Heroine', gender: 1, order: 1 },
            { id: 3, name: 'Main Antagonist', character: 'Rival', gender: 2, order: 2 },
          ],
          crew: [
            ...(curatedMatch.director ? [{ name: curatedMatch.director, job: 'Director', department: 'Directing' }] : []),
            ...(curatedMatch.music_director ? [{ name: curatedMatch.music_director, job: 'Original Music Composer', department: 'Sound' }] : []),
            ...(curatedMatch.producers ? [{ name: curatedMatch.producers, job: 'Producer', department: 'Production' }] : []),
            ...(curatedMatch.writers ? [{ name: curatedMatch.writers, job: 'Screenplay', department: 'Writing' }] : []),
            ...(curatedMatch.cinematography ? [{ name: curatedMatch.cinematography, job: 'Director of Photography', department: 'Camera' }] : []),
          ],
        },
        'watch/providers': { results: {} },
      };

      // Safely enrich from TMDB if available without letting a mismatched movie override curated info
      try {
        const liveEndpoint = isTv ? `/tv/${id}` : `/movie/${id}`;
        const liveData = await tmdbFetch(liveEndpoint, {
          append_to_response: 'watch/providers,translations,similar,recommendations,release_dates',
        });
        const liveTitle = (liveData.title || liveData.name || '').toLowerCase();
        const curTitle = (curatedMatch.title || curatedMatch.name || '').toLowerCase();
        if (liveTitle.includes(curTitle) || curTitle.includes(liveTitle) || liveData.id === curatedMatch.id) {
          if (liveData['watch/providers']?.results) fullCurated['watch/providers'] = liveData['watch/providers'];
          if (liveData.release_dates) fullCurated.release_dates = liveData.release_dates;
          if (liveData.recommendations) fullCurated.recommendations = liveData.recommendations;
          if (liveData.similar) fullCurated.similar = liveData.similar;
          if (liveData.belongs_to_collection) fullCurated.belongs_to_collection = liveData.belongs_to_collection;
          if (isTv && liveData.number_of_seasons) fullCurated.number_of_seasons = liveData.number_of_seasons;
          if (isTv && liveData.number_of_episodes) fullCurated.number_of_episodes = liveData.number_of_episodes;
        }
      } catch {
        // Silently ignore live enrichment failure, use fullCurated
      }

      return fullCurated;
    }

    try {
      return await tmdbFetch(`/movie/${id}`, {
        append_to_response: 'credits,videos,watch/providers,translations,similar,recommendations,release_dates',
      });
    } catch (err) {
      try {
        const tvData = await tmdbFetch(`/tv/${id}`, {
          append_to_response: 'credits,videos,watch/providers,translations,similar,recommendations',
        });
        if (tvData) {
          tvData.media_type = 'tv';
          tvData.title = tvData.title || tvData.name;
          tvData.release_date = tvData.release_date || tvData.first_air_date;
          return tvData;
        }
      } catch {
        throw err;
      }
    }
  },
  nowPlaying: (page = 1, region = 'IN') => tmdbFetch('/movie/now_playing', { page, region }),
  upcoming: (page = 1, region = 'IN') => tmdbFetch('/movie/upcoming', { page, region }),
  discoverTheatrical: ({ language = '', region = 'IN', page = 1 } = {}) => {
    const today = new Date().toISOString().split('T')[0];
    const pastDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const params = {
      page,
      region,
      with_release_type: '2|3',
      'release_date.gte': pastDate,
      'release_date.lte': today,
      sort_by: 'popularity.desc',
    };
    if (language && language !== 'all') {
      params.with_original_language = language;
    }
    return tmdbFetch('/discover/movie', params);
  },
  collection: (id) => tmdbFetch(`/collection/${id}`),
  similar: (id, page = 1) => tmdbFetch(`/movie/${id}/similar`, { page }),
  recommendations: (id, page = 1) => tmdbFetch(`/movie/${id}/recommendations`, { page }),
  genres: () => tmdbFetch('/genre/movie/list'),
};
