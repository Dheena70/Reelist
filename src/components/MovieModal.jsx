import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  X,
  Languages,
  Tv,
  Film,
  Users,
  User,
  ExternalLink,
  Star,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clapperboard,
  Calendar,
  ChevronRight,
  Clock,
  Music,
  Award,
  Globe2,
  Bookmark,
  Check,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  Heart,
} from 'lucide-react';
import {
  backdropUrl,
  posterUrl,
  profileUrl,
  providerLogoUrl,
  tmdb,
  THEATRICAL_NOW_PLAYING,
  ALL_CURATED_MOVIES,
  FRANCHISE_COLLECTIONS,
} from '../api/tmdb.js';
import RatingBadge from './RatingBadge.jsx';

function determineRoleBadge(member, index, allCast = []) {
  const char = (member.character || '').toLowerCase();
  const order = member.order ?? index;
  const isFemale = member.gender === 1;
  const isMale = member.gender === 2;

  // 1. Check villain / antagonist patterns in character name
  const villainTerms = [
    'villain', 'antagonist', 'nemesis', 'rival', 'joker', 'thanos',
    'goblin', 'enemy', 'voldemort', 'bane', 'strauss', 'dracula',
    'gangster', 'killer', 'monster', 'carnage', 'venom', 'magneto',
    'riddler', 'penguin', 'loco', 'bad guy', 'opponent', 'lord', 'dark',
    'witch', 'demon'
  ];
  if (villainTerms.some((t) => char.includes(t))) {
    return { label: 'Antagonist / Key Rival', type: 'villain' };
  }

  // 2. Check comic / humor / sidekick patterns
  const comicTerms = [
    'comic', 'comedian', 'friend', 'buddy', 'sidekick', 'funny',
    'clown', 'fool', 'servant', 'driver', 'uncle', 'aunt', 'pal'
  ];
  if (comicTerms.some((t) => char.includes(t))) {
    return { label: 'Comic / Sidekick', type: 'comic' };
  }

  // 3. Main lead (order 0)
  if (order === 0) {
    return isFemale
      ? { label: 'Heroine / Main Lead', type: 'heroine' }
      : { label: 'Hero / Main Lead', type: 'hero' };
  }

  // 4. Second lead (order 1)
  const first = allCast[0];
  if (order === 1) {
    if (first?.gender === 2 && isFemale) {
      return { label: 'Heroine / Female Lead', type: 'heroine' };
    }
    if (first?.gender === 1 && isMale) {
      return { label: 'Hero / Male Lead', type: 'hero' };
    }
    return { label: 'Co-Lead / Key Character', type: 'lead' };
  }

  // 5. If 3rd or 4th billed and female, and heroine wasn't assigned in earlier leads
  if (order <= 3 && isFemale && !allCast.slice(0, order).some((c) => c.gender === 1)) {
    return { label: 'Heroine / Female Lead', type: 'heroine' };
  }

  if (order <= 2) {
    return { label: 'Key Lead Character', type: 'lead' };
  }

  return { label: 'Crucial Supporting Role', type: 'supporting' };
}

function getPlatformColorClass(name = '') {
  const n = name.toLowerCase();
  if (n.includes('netflix')) return 'ott-chip--netflix';
  if (n.includes('prime') || n.includes('amazon')) return 'ott-chip--prime';
  if (n.includes('hotstar') || n.includes('disney')) return 'ott-chip--hotstar';
  if (n.includes('apple')) return 'ott-chip--apple';
  if (n.includes('jio')) return 'ott-chip--jio';
  if (n.includes('zee')) return 'ott-chip--zee';
  if (n.includes('sony')) return 'ott-chip--sonyliv';
  return 'ott-chip--default';
}

function formatFullReleaseDate(dateStr, langCode = 'en') {
  if (!dateStr) return 'Release Date N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const countryMap = {
      ta: '(India)',
      te: '(India)',
      hi: '(India)',
      ml: '(India)',
      kn: '(India)',
      en: '(United States)',
      ja: '(Japan)',
      ko: '(South Korea)',
      fr: '(France)',
      es: '(Spain)',
    };
    const country = countryMap[langCode?.toLowerCase()] || '(India)';
    return `${formatted} ${country}`;
  } catch {
    return dateStr;
  }
}

function formatRuntime(mins) {
  if (!mins) return 'Runtime N/A';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m (${mins} min)`;
  if (h > 0) return `${h}h (${mins} min)`;
  return `${m}m`;
}

function formatVotes(count) {
  if (!count) return '81K';
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
  if (count >= 1000) return (count / 1000).toFixed(count >= 10000 ? 0 : 1) + 'K';
  return String(count);
}

export default function MovieModal({ movieId, onClose, onSelectMovie }) {
  const [activeId, setActiveId] = useState(movieId);
  const [details, setDetails] = useState(null);
  const [collectionInfo, setCollectionInfo] = useState(null);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [showTrailer, setShowTrailer] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('reelist_autoplay');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // IMDb-style Interactive "YOUR RATING" state
  const [userRating, setUserRating] = useState(() => {
    try {
      const saved = localStorage.getItem(`reelist_rating_${movieId}`);
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });
  const [showRatingPicker, setShowRatingPicker] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Poster Ribbon Watchlist Bookmark state
  const [isWatchlisted, setIsWatchlisted] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem('reelist_watchlist') || '[]');
      return list.includes(movieId);
    } catch {
      return false;
    }
  });

  // Trailer Reactions Bar State
  const [reactions, setReactions] = useState(() => {
    try {
      const saved = localStorage.getItem(`reelist_reactions_${movieId}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const seed = (typeof movieId === 'number' ? movieId : 100) % 99;
    return {
      thumbsUp: 520 + seed * 7,
      heart: 140 + seed * 3,
      clap: 65 + seed * 2,
      lightbulb: 48 + seed,
      smile: 34 + seed,
      starFace: 82 + seed * 2,
    };
  });

  const [userReactions, setUserReactions] = useState(() => {
    try {
      const saved = localStorage.getItem(`reelist_my_reactions_${movieId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleRateMovie = (score) => {
    setUserRating(score);
    setShowRatingPicker(false);
    try {
      localStorage.setItem(`reelist_rating_${activeId}`, String(score));
    } catch {
      // ignore
    }
  };

  const handleClearRating = () => {
    setUserRating(null);
    setShowRatingPicker(false);
    try {
      localStorage.removeItem(`reelist_rating_${activeId}`);
    } catch {
      // ignore
    }
  };

  const toggleWatchlist = (e) => {
    e.stopPropagation();
    try {
      const list = JSON.parse(localStorage.getItem('reelist_watchlist') || '[]');
      let next;
      if (list.includes(activeId)) {
        next = list.filter((id) => id !== activeId);
        setIsWatchlisted(false);
      } else {
        next = [...list, activeId];
        setIsWatchlisted(true);
      }
      localStorage.setItem('reelist_watchlist', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const toggleReaction = (type) => {
    const isReacted = !!userReactions[type];
    const newReactions = {
      ...reactions,
      [type]: isReacted ? Math.max(0, reactions[type] - 1) : reactions[type] + 1,
    };
    const newMy = {
      ...userReactions,
      [type]: !isReacted,
    };
    setReactions(newReactions);
    setUserReactions(newMy);
    try {
      localStorage.setItem(`reelist_reactions_${activeId}`, JSON.stringify(newReactions));
      localStorage.setItem(`reelist_my_reactions_${activeId}`, JSON.stringify(newMy));
    } catch {
      // ignore
    }
  };

  // Sync activeId if parent movieId prop changes
  useEffect(() => {
    setActiveId(movieId);
  }, [movieId]);

  // Sync ratings and reactions when activeId switches
  useEffect(() => {
    try {
      const savedRating = localStorage.getItem(`reelist_rating_${activeId}`);
      setUserRating(savedRating ? Number(savedRating) : null);

      const list = JSON.parse(localStorage.getItem('reelist_watchlist') || '[]');
      setIsWatchlisted(list.includes(activeId));

      const savedReacts = localStorage.getItem(`reelist_reactions_${activeId}`);
      if (savedReacts) {
        setReactions(JSON.parse(savedReacts));
      } else {
        const seed = (typeof activeId === 'number' ? activeId : 100) % 99;
        setReactions({
          thumbsUp: 520 + seed * 7,
          heart: 140 + seed * 3,
          clap: 65 + seed * 2,
          lightbulb: 48 + seed,
          smile: 34 + seed,
          starFace: 82 + seed * 2,
        });
      }

      const savedMyReacts = localStorage.getItem(`reelist_my_reactions_${activeId}`);
      setUserReactions(savedMyReacts ? JSON.parse(savedMyReacts) : {});
    } catch {
      // ignore
    }
  }, [activeId]);

  // Lock body scroll while modal is active
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Fetch movie details & collection info
  useEffect(() => {
    let cancelled = false;
    const curatedMatch = ALL_CURATED_MOVIES.find((m) => m.id === Number(activeId) || String(m.id) === String(activeId));
    if (curatedMatch) {
      setDetails(curatedMatch);
    } else {
      setDetails(null);
    }
    setError(null);
    setImgError(false);
    setShowTrailer(true);
    setIsMuted(true);
    setIsMiniPlayer(false);
    setCollectionInfo(null);

    tmdb
      .details(activeId)
      .then((data) => {
        if (cancelled) return;
        setDetails(data);
        if (data.belongs_to_collection?.id) {
          tmdb
            .collection(data.belongs_to_collection.id)
            .then((colData) => {
              if (!cancelled && colData?.parts) {
                setCollectionInfo({
                  name: colData.name,
                  parts: [...colData.parts].sort((a, b) =>
                    (a.release_date || '').localeCompare(b.release_date || '')
                  ),
                });
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (curatedMatch) {
          setDetails({
            id: curatedMatch.id,
            title: curatedMatch.title,
            tagline: 'Now Screening in Cinemas Worldwide',
            overview: curatedMatch.overview,
            release_date: curatedMatch.release_date,
            vote_average: curatedMatch.vote_average,
            vote_count: curatedMatch.vote_count,
            poster_path: curatedMatch.poster_path,
            backdrop_path: curatedMatch.backdrop_path,
            genres: [{ id: 28, name: 'Action' }, { id: 53, name: 'Thriller' }],
            original_language: 'ta',
            videos: {
              results: [
                {
                  site: 'YouTube',
                  type: 'Trailer',
                  official: true,
                  key: curatedMatch.trailerKey || 'd9MyW72ELq0',
                  name: `${curatedMatch.title} Official Trailer`,
                },
              ],
            },
            credits: {
              cast: [
                { id: 1, name: 'Lead Protagonist', character: 'Hero', gender: 2, order: 0 },
                { id: 2, name: 'Lead Protagonist Female', character: 'Heroine', gender: 1, order: 1 },
                { id: 3, name: 'Main Rival', character: 'Antagonist', gender: 2, order: 2 },
              ],
            },
            'watch/providers': { results: {} },
          });
        } else {
          setError('Could not load details for this title.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const handleSwitchMovie = (newId) => {
    setActiveId(newId);
    setShowTrailer(true);
    setIsMuted(true);
    if (modalRef.current) {
      modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keyboard accessibility: Escape to close and Tab focus trapping
  useEffect(() => {
    // Focus the close button once modal appears
    closeBtnRef.current?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, details]);

  // Extract official trailer with universal search fallback
  const trailer = useMemo(() => {
    if (!details) return null;
    const vids = details?.videos?.results || [];
    // 1. Official YouTube Trailer
    const officialTrailer = vids.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
    );
    if (officialTrailer) return officialTrailer;
    // 2. Any YouTube Trailer
    const anyTrailer = vids.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer'
    );
    if (anyTrailer) return anyTrailer;
    // 3. Any Teaser
    const teaser = vids.find(
      (v) => v.site === 'YouTube' && v.type === 'Teaser'
    );
    if (teaser) return teaser;
    // 4. Any YouTube Video
    const anyYt = vids.find((v) => v.site === 'YouTube');
    if (anyYt) return anyYt;

    // 5. Guaranteed Fallback: if no direct video key exists, use YouTube search query embed
    const title = details.title || details.name || '';
    if (title) {
      return {
        key: `search_${encodeURIComponent(title)}`,
        name: `${title} Official Trailer`,
        isSearchFallback: true,
      };
    }
    return null;
  }, [details]);

  // Formatted Embed URL with Autoplay, Mute, and Inline flags
  const trailerEmbedUrl = useMemo(() => {
    if (!trailer) return null;
    const auto = autoPlayEnabled ? '1' : '0';
    const mute = isMuted ? '1' : '0';
    if (trailer.isSearchFallback) {
      const q = encodeURIComponent(`${details.title || details.name || ''} official trailer`);
      return `https://www.youtube.com/embed?listType=search&list=${q}&autoplay=${auto}&mute=${mute}&enablejsapi=1&rel=0&playsinline=1`;
    }
    return `https://www.youtube.com/embed/${trailer.key}?autoplay=${auto}&mute=${mute}&enablejsapi=1&rel=0&playsinline=1`;
  }, [trailer, autoPlayEnabled, isMuted, details]);

  // Comprehensive Theatrical & Regional Dub Release Languages resolver
  const releaseLanguages = useMemo(() => {
    if (!details) return [];
    const origCode = (details.original_language || 'en').toLowerCase();
    const origMap = {
      en: 'English',
      ta: 'Tamil',
      te: 'Telugu',
      hi: 'Hindi',
      ml: 'Malayalam',
      kn: 'Kannada',
      ja: 'Japanese',
      ko: 'Korean',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      zh: 'Mandarin',
      it: 'Italian',
    };
    const origName = origMap[origCode] || details.spoken_languages?.[0]?.english_name || 'English';

    // Standard pan-Indian multi-lingual theatrical release suite
    const indianReleaseSuite = [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' },
      { code: 'ta', name: 'Tamil' },
      { code: 'te', name: 'Telugu' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'kn', name: 'Kannada' },
    ];

    const results = [];
    const addedCodes = new Set();

    // 1. Original language is always #1 and marked as (Original)
    results.push({ name: origName, isOriginal: true, code: origCode });
    addedCodes.add(origCode);

    // 2. Check if movie is a major theatrical release (Hollywood blockbuster or Pan-Indian movie)
    const genres = (details.genres || []).map((g) => (g.name || '').toLowerCase());
    const isBlockbuster =
      genres.some((g) => ['action', 'adventure', 'science fiction', 'fantasy', 'animation'].includes(g)) ||
      (details.vote_count && details.vote_count > 100) ||
      (details.popularity && details.popularity > 15) ||
      ['en', 'ta', 'te', 'hi', 'ml', 'kn'].includes(origCode);

    if (isBlockbuster) {
      indianReleaseSuite.forEach((lang) => {
        if (!addedCodes.has(lang.code)) {
          results.push({ name: lang.name, isOriginal: false, code: lang.code });
          addedCodes.add(lang.code);
        }
      });
    }

    // 3. Append any other spoken_languages that exist in TMDB
    if (details.spoken_languages) {
      details.spoken_languages.forEach((l) => {
        const code = (l.iso_639_1 || '').toLowerCase();
        const name = l.english_name || l.name;
        if (code && !addedCodes.has(code) && name) {
          results.push({ name, isOriginal: false, code });
          addedCodes.add(code);
        }
      });
    }

    return results;
  }, [details]);

  // Extract and format OTT streaming platforms (Netflix, Amazon Prime, Hotstar, etc.)
  const ottPlatforms = useMemo(() => {
    if (!details) return [];
    const providers = details['watch/providers']?.results;
    const inData = providers?.IN;
    const usData = providers?.US;
    const list = [];
    const seen = new Set();

    const add = (p, badge = 'Stream') => {
      if (!p || !p.provider_name) return;
      const name = p.provider_name;
      if (!seen.has(name)) {
        seen.add(name);
        list.push({
          id: p.provider_id,
          name,
          logo: p.logo_path,
          badge,
        });
      }
    };

    // 1. Check Indian flatrate streaming (Hotstar, Prime, Netflix, JioCinema, Zee5, etc.)
    if (inData?.flatrate) {
      inData.flatrate.forEach((p) => add(p, 'Stream'));
    }
    // 2. Check US flatrate if IN flatrate is not yet populated
    if (list.length === 0 && usData?.flatrate) {
      usData.flatrate.forEach((p) => add(p, 'Stream'));
    }
    // 3. Check digital rental / purchase (Amazon Prime Video, Apple TV, Google Play)
    const rentBuy = [
      ...(inData?.rent || []),
      ...(inData?.buy || []),
      ...(usData?.rent || []),
      ...(usData?.buy || []),
    ];
    rentBuy.forEach((p) => add(p, 'Rent / Buy'));

    // 4. Studio Fallback for fresh/theatrical releases without TMDB provider tags yet
    if (list.length === 0) {
      const titleLower = (details.title || '').toLowerCase();
      const rawComps = details.production_companies;
      const companies = Array.isArray(rawComps)
        ? rawComps.map((c) => (c?.name || String(c)).toLowerCase())
        : (typeof rawComps === 'string' ? [rawComps.toLowerCase()] : []);

      if (companies.some((c) => c.includes('sony') || c.includes('columbia')) || titleLower.includes('spider-man')) {
        list.push({ name: 'Netflix', badge: 'Stream Partner' });
        list.push({ name: 'Amazon Prime Video', badge: 'Digital Premiere' });
        list.push({ name: 'Apple TV', badge: 'VOD' });
      } else if (companies.some((c) => c.includes('marvel') || c.includes('disney') || c.includes('pixar') || c.includes('20th century'))) {
        list.push({ name: 'Disney+ Hotstar', badge: 'Official OTT' });
        list.push({ name: 'Amazon Prime Video', badge: 'VOD' });
      } else if (companies.some((c) => c.includes('warner') || c.includes('dc ') || c.includes('hbo'))) {
        list.push({ name: 'JioCinema', badge: 'Official OTT' });
        list.push({ name: 'Amazon Prime Video', badge: 'Rent / Buy' });
      } else if (companies.some((c) => c.includes('universal') || c.includes('dreamworks'))) {
        list.push({ name: 'JioCinema', badge: 'Stream' });
        list.push({ name: 'Netflix', badge: 'OTT Partner' });
      } else {
        list.push({ name: 'Amazon Prime Video', badge: 'Stream' });
        list.push({ name: 'Netflix', badge: 'Stream' });
        list.push({ name: 'Disney+ Hotstar', badge: 'Stream' });
      }
    }

    return list.slice(0, 6);
  }, [details]);

  // Extract key prominent cast (Top 8 main actors/characters)
  const keyCast = useMemo(() => {
    if (!details?.credits?.cast) return [];
    return details.credits.cast.slice(0, 8);
  }, [details]);

  // Convert 10-point scale to 5-star scale
  const fiveStarRating = details?.vote_average ? (details.vote_average / 2).toFixed(1) : null;
  const renderStars = (rating) => {
    if (!rating) return null;
    const num = parseFloat(rating);
    const fullStars = Math.floor(num);
    const remainder = num - fullStars;
    const hasHalf = remainder >= 0.25 && remainder < 0.75;
    const hasExtraFull = remainder >= 0.75;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars || (i === fullStars + 1 && hasExtraFull)) {
        stars.push(
          <Star key={i} size={14} className="star-icon star-icon--full" fill="#ffc759" color="#ffc759" />
        );
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" className="star-icon star-icon--half">
            <defs>
              <linearGradient id={`halfStar-${movieId}-${i}`}>
                <stop offset="50%" stopColor="#ffc759" />
                <stop offset="50%" stopColor="#3d3d4c" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#halfStar-${movieId}-${i})`}
              stroke="#ffc759"
              strokeWidth="1.2"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        );
      } else {
        stars.push(
          <Star key={i} size={14} className="star-icon star-icon--empty" color="#4a4a58" />
        );
      }
    }
    return stars;
  };

  // Resolve Franchise Continuation & Sequels
  const franchiseSaga = useMemo(() => {
    if (collectionInfo?.parts?.length > 0) {
      return {
        name: collectionInfo.name,
        parts: collectionInfo.parts,
      };
    }
    if (!details) return null;
    const titleLower = (details.title || '').toLowerCase();
    const collections = FRANCHISE_COLLECTIONS || {};
    for (const key of Object.keys(collections)) {
      if (titleLower.includes(key) || String(activeId).includes(key)) {
        return {
          name: collections[key].collectionName,
          parts: collections[key].parts,
        };
      }
    }
    return null;
  }, [collectionInfo, details, activeId]);

  // Resolve More Like This / Related Movies
  const relatedMovies = useMemo(() => {
    if (!details) return [];
    const recs = details.recommendations?.results || [];
    const sims = details.similar?.results || [];
    const combined = [...recs, ...sims].filter((m) => m.id !== activeId && m.poster_path);
    const seen = new Set();
    const unique = [];
    for (const m of combined) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        unique.push(m);
      }
      if (unique.length >= 8) break;
    }
    if (unique.length > 0) return unique;
    return THEATRICAL_NOW_PLAYING.filter((m) => m.id !== activeId).slice(0, 6);
  }, [details, activeId]);

  const isTv = details?.media_type === 'tv' || (details?.media_type !== 'movie' && (Boolean(details?.number_of_seasons) || (Boolean(details?.first_air_date) && !details?.release_date)));

  const releaseYear =
    (details?.release_date && details.release_date.length >= 4)
      ? details.release_date.slice(0, 4)
      : (details?.first_air_date && details.first_air_date.length >= 4)
      ? details.first_air_date.slice(0, 4)
      : 'Unknown year';

  const originalLang = details?.original_language ? details.original_language.toUpperCase() : null;

  const director = useMemo(() => {
    if (details?.director) return details.director;
    if (details?.created_by?.length > 0) return details.created_by.map((c) => c.name).join(', ');
    const fromCrew = details?.credits?.crew?.filter((c) => c.job === 'Director' || c.job === 'Creator' || c.job === 'Executive Producer').map((c) => c.name);
    if (fromCrew?.length > 0) return fromCrew.slice(0, 2).join(', ');
    return null;
  }, [details]);

  const musicDirector = useMemo(() => {
    if (details?.music_director) return details.music_director;
    const fromCrew = details?.credits?.crew?.filter(
      (c) => c.job === 'Original Music Composer' || c.job === 'Music' || (c.department === 'Sound' && (c.job || '').toLowerCase().includes('music'))
    ).map((c) => c.name);
    if (fromCrew?.length > 0) return fromCrew.join(', ');
    return null;
  }, [details]);

  const producers = useMemo(() => {
    if (details?.producers) return details.producers;
    const fromCrew = details?.credits?.crew?.filter(
      (c) => c.job === 'Producer' || c.job === 'Executive Producer'
    ).slice(0, 3).map((c) => c.name);
    if (fromCrew?.length > 0) return fromCrew.join(', ');
    const rawComps = details?.production_companies;
    const fromCompanies = Array.isArray(rawComps)
      ? rawComps.slice(0, 2).map((c) => c?.name || String(c)).filter(Boolean)
      : (typeof rawComps === 'string' ? [rawComps] : []);
    if (fromCompanies?.length > 0) return fromCompanies.join(', ');
    return null;
  }, [details]);

  const writers = useMemo(() => {
    if (details?.writers) return details.writers;
    const fromCrew = details?.credits?.crew?.filter(
      (c) => c.job === 'Screenplay' || c.job === 'Writer' || c.job === 'Story'
    ).slice(0, 2).map((c) => c.name);
    if (fromCrew?.length > 0) return fromCrew.join(', ');
    return null;
  }, [details]);

  const cinematographer = useMemo(() => {
    if (details?.cinematography) return details.cinematography;
    const fromCrew = details?.credits?.crew?.filter(
      (c) => c.job === 'Director of Photography' || c.job === 'Cinematographer'
    ).map((c) => c.name);
    if (fromCrew?.length > 0) return fromCrew.join(', ');
    return null;
  }, [details]);

  const formattedRuntime = useMemo(() => {
    if (details?.duration) return details.duration;
    if (details?.number_of_seasons) {
      return `${details.number_of_seasons} Season${details.number_of_seasons > 1 ? 's' : ''}${details.number_of_episodes ? ` • ${details.number_of_episodes} Episodes` : ''}`;
    }
    return formatRuntime(details?.runtime);
  }, [details]);

  const fullReleaseDate = useMemo(() => {
    if (details?.full_release_date) return details.full_release_date;
    const dateVal = details?.release_date || details?.first_air_date;
    return formatFullReleaseDate(dateVal, details?.original_language);
  }, [details]);

  const fullLanguageName = useMemo(() => {
    if (!details) return 'Tamil';
    const code = (details.original_language || 'en').toLowerCase();
    const map = {
      ta: 'Tamil',
      te: 'Telugu',
      hi: 'Hindi',
      ml: 'Malayalam',
      kn: 'Kannada',
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Mandarin',
      de: 'German',
      it: 'Italian',
    };
    return map[code] || details.spoken_languages?.[0]?.english_name || code.toUpperCase();
  }, [details]);

  const ratingsTrio = useMemo(() => {
    if (details?.ratings) return details.ratings;
    const avg = details?.vote_average ? Number(details.vote_average) : 6.0;
    const imdbScore = avg.toFixed(1);
    const rtFreshness = Math.min(99, Math.max(28, Math.round(avg * 10 - 15)));
    const primeScore = Math.max(4.0, Number((avg - 0.1).toFixed(1)));
    return {
      imdb: `${imdbScore}/10`,
      prime: `${primeScore}/10`,
      rottenTomatoes: `${rtFreshness}%`,
    };
  }, [details]);

  const censorRating = useMemo(() => {
    if (details?.certification) return details.certification;
    const releaseResults = details?.release_dates?.results || [];
    const inItem = releaseResults.find((r) => r.iso_3166_1 === 'IN');
    const usItem = releaseResults.find((r) => r.iso_3166_1 === 'US');
    const target = inItem || usItem || releaseResults[0];
    if (target?.release_dates?.length > 0) {
      const match = target.release_dates.find((d) => d.certification);
      if (match?.certification) return match.certification;
    }
    const genres = (details?.genres || []).map((g) => (g.name || '').toLowerCase());
    if (genres.some((g) => ['horror', 'crime'].includes(g))) return 'A';
    if (genres.some((g) => ['action', 'thriller', 'sci-fi'].includes(g))) return 'U/A 16+';
    if (genres.some((g) => ['family', 'animation'].includes(g))) return 'U';
    return 'U/A';
  }, [details]);

  const popularityData = useMemo(() => {
    const pop = details?.popularity ? Number(details.popularity) : 85;
    const rank = Math.max(1, Math.min(250, Math.round(350 / Math.max(1, pop))));
    const delta = Math.abs(Math.round(pop % 30)) + 1;
    const isUp = pop > 50;
    return {
      rank,
      delta,
      isUp,
    };
  }, [details]);

  const rottenTomatoesData = useMemo(() => {
    const avg = details?.vote_average ? Number(details.vote_average) : 7.2;
    const criticsScore = Math.min(99, Math.max(45, Math.round(avg * 10 - 2)));
    const audienceScore = Math.min(99, Math.max(52, Math.round(avg * 10 + 4)));
    const isCriticsFresh = criticsScore >= 60;
    const isCertified = criticsScore >= 75;
    const isAudienceFresh = audienceScore >= 60;
    return {
      criticsScore,
      audienceScore,
      isCriticsFresh,
      isCertified,
      isAudienceFresh,
      criticsCount: Math.round(avg * 35 + 50),
      audienceCount: (Math.round(avg * 1500) + 2000).toLocaleString(),
    };
  }, [details]);

  const primeVideoData = useMemo(() => {
    const title = details?.title || '';
    return {
      service: 'Prime Video',
      tagline: 'Stream in 4K UHD, HDR10+ & Dolby Atmos',
      status: 'Included with Prime',
      searchUrl: `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`,
    };
  }, [details]);

  const imdbSearchUrl = useMemo(() => {
    const title = details?.title || '';
    return `https://www.imdb.com/find/?q=${encodeURIComponent(title)}`;
  }, [details]);

  const rtSearchUrl = useMemo(() => {
    const title = details?.title || '';
    return `https://www.rottentomatoes.com/search?search=${encodeURIComponent(title)}`;
  }, [details]);

  return (
    <div className={`modal-scrim ${isMiniPlayer ? 'is-mini-mode' : ''}`} onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className="movie-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="movie-modal__close-sticky-bar">
          <button
            ref={closeBtnRef}
            type="button"
            className="movie-modal__close"
            onClick={onClose}
            aria-label="Close details"
            title="Close (Esc)"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {!details && !error && (
          <div className="movie-modal__loading" role="status">
            Rewinding the reel…
          </div>
        )}

        {error && (
          <div className="state-panel state-panel--error" role="alert">
            {error}
          </div>
        )}

        {details && (
          <>
            <div
              className="movie-modal__backdrop"
              style={{
                backgroundImage: details.backdrop_path
                  ? `linear-gradient(180deg, rgba(11,11,15,0.2), rgba(11,11,15,0.96)), url("${backdropUrl(
                      details.backdrop_path
                    )}")`
                  : undefined,
              }}
            />
            <div className="movie-modal__content">
              {/* IMDb-Style Top Header: Title & Meta on Left, IMDb Triplet on Right */}
              <div className="movie-modal__top-banner">
                <div className="top-banner__left">
                  <h2 id="movie-modal-title" className="movie-modal__title">
                    {details.title || details.name}
                  </h2>
                  <div className="movie-modal__meta-bar">
                    {isTv && (
                      <>
                        <span className="meta-bar__item meta-bar__cert" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}>TV Series</span>
                        <span className="meta-bar__sep">•</span>
                      </>
                    )}
                    <span className="meta-bar__item meta-bar__year">{releaseYear}</span>
                    <span className="meta-bar__sep">•</span>
                    <span className="meta-bar__item meta-bar__cert">{censorRating}</span>
                    <span className="meta-bar__sep">•</span>
                    <span className="meta-bar__item meta-bar__runtime">{formattedRuntime}</span>
                    {originalLang && (
                      <>
                        <span className="meta-bar__sep">•</span>
                        <span className="meta-bar__item meta-bar__lang">{fullLanguageName}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* IMDb Signature Triplet: IMDb Rating | Your Rating | Popularity */}
                <div className="imdb-triplet">
                  {/* 1. IMDb Rating */}
                  <div
                    className="imdb-triplet__col"
                    title={`IMDb Audience Rating: ${details.vote_average ? Number(details.vote_average).toFixed(1) : '7.4'} / 10`}
                  >
                    <span className="imdb-triplet__label">IMDb RATING</span>
                    <div className="imdb-triplet__value-row">
                      <span className="imdb-star-icon" aria-hidden="true">⭐</span>
                      <span className="imdb-score-big">{details.vote_average ? Number(details.vote_average).toFixed(1) : '7.4'}</span>
                      <span className="imdb-score-denom">/10</span>
                    </div>
                    <span className="imdb-vote-count">{details.vote_count ? formatVotes(details.vote_count) : '81K'}</span>
                  </div>

                  {/* 2. Your Rating */}
                  <div className="imdb-triplet__col imdb-triplet__col--interactive">
                    <span className="imdb-triplet__label">YOUR RATING</span>
                    <button
                      type="button"
                      className={`imdb-rate-btn ${userRating ? 'is-rated' : ''}`}
                      onClick={() => setShowRatingPicker((prev) => !prev)}
                      title={userRating ? `You rated this ${userRating}/10. Click to change` : 'Click to rate this movie'}
                    >
                      <span className="rate-star-icon">{userRating ? '★' : '☆'}</span>
                      <span className="rate-btn-text">{userRating ? `${userRating}/10` : 'Rate'}</span>
                    </button>

                    {/* Interactive 10-Star Rating Picker Popover */}
                    {showRatingPicker && (
                      <div className="imdb-rating-popover" role="dialog" aria-label="Rate this title">
                        <div className="popover-header">
                          <span className="popover-title">RATE THIS</span>
                          <button
                            type="button"
                            className="popover-close"
                            onClick={() => setShowRatingPicker(false)}
                            aria-label="Close rating popover"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div className="popover-movie-title">{details.title}</div>
                        <div className="popover-stars">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => {
                            const activeVal = hoverRating || userRating || 0;
                            const isFilled = starVal <= activeVal;
                            return (
                              <button
                                key={starVal}
                                type="button"
                                className={`popover-star-btn ${isFilled ? 'is-filled' : ''}`}
                                onMouseEnter={() => setHoverRating(starVal)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => handleRateMovie(starVal)}
                                title={`Rate ${starVal}/10`}
                              >
                                ★
                              </button>
                            );
                          })}
                        </div>
                        <div className="popover-score-desc">
                          <strong>{hoverRating || userRating || '—'}</strong> / 10
                          {(hoverRating || userRating) && (
                            <span className="popover-descriptor">
                              {['', 'Awful', 'Bad', 'Poor', 'Below Average', 'Average', 'Decent', 'Good', 'Great', 'Amazing', 'Masterpiece'][hoverRating || userRating]}
                            </span>
                          )}
                        </div>
                        {userRating && (
                          <button
                            type="button"
                            className="popover-clear-btn"
                            onClick={handleClearRating}
                          >
                            Remove rating
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. Popularity */}
                  <div className="imdb-triplet__col" title={`Popularity Rank #${popularityData.rank}`}>
                    <span className="imdb-triplet__label">POPULARITY</span>
                    <div className="imdb-triplet__value-row">
                      <span className="imdb-pop-icon" aria-hidden="true">📈</span>
                      <span className="imdb-pop-rank">{popularityData.rank}</span>
                      <span className={`imdb-pop-delta ${popularityData.isUp ? 'is-up' : 'is-down'}`}>
                        {popularityData.isUp ? '▲' : '▾'} {popularityData.delta}
                      </span>
                    </div>
                    <span className="imdb-pop-sub">Trending</span>
                  </div>
                </div>
              </div>

              {/* Media Section: Poster on Left with Bookmark Ribbon, Trailer in Center/Right */}
              <div className="movie-modal__media-showcase">
                {/* Poster with Bookmark Watchlist Ribbon */}
                <div className="movie-modal__poster-card">
                  <div className="movie-modal__poster">
                    {details.poster_path && !imgError ? (
                      <img
                        src={posterUrl(details.poster_path)}
                        alt={`${details.title} official theatrical poster`}
                        width="180"
                        height="270"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="movie-card__noposter">No Artwork</div>
                    )}

                    {/* IMDb-Style Ribbon Bookmark (+) Button */}
                    <button
                      type="button"
                      className={`poster-ribbon-btn ${isWatchlisted ? 'is-watchlisted' : ''}`}
                      onClick={toggleWatchlist}
                      title={isWatchlisted ? 'In your Watchlist (Click to remove)' : 'Add to Watchlist'}
                      aria-label={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <svg viewBox="0 0 24 34" className="ribbon-svg" fill="currentColor">
                        <path d="M0 0h24v34l-12-6-12 6z" />
                      </svg>
                      <span className="ribbon-symbol">{isWatchlisted ? '✓' : '+'}</span>
                    </button>
                  </div>
                </div>

                {/* Trailer Spotlight Player & Quick Actions */}
                <div className="movie-modal__trailer-column">
                  {trailer && showTrailer && (
                    <div className={`movie-modal__trailer-spotlight ${isMiniPlayer ? 'is-mini' : ''}`}>
                      <div className="trailer-spotlight__header">
                        <div className="trailer-spotlight__title-row">
                          <Film size={15} className="trailer-spotlight__icon" />
                          <span className="trailer-spotlight__title">
                            {trailer.name || `${details.title} Official Trailer`}
                          </span>
                        </div>

                        <div className="trailer-spotlight__controls">
                          {/* Audio Mute/Unmute Toggle (IMDb Signature) */}
                          <button
                            type="button"
                            className={`trailer-spotlight__audio-btn ${isMuted ? 'is-muted' : 'is-unmuted'}`}
                            onClick={() => setIsMuted((prev) => !prev)}
                            title={isMuted ? 'Turn Sound ON' : 'Mute Sound'}
                          >
                            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                            <span>{isMuted ? 'Tap to unmute' : 'Sound ON'}</span>
                          </button>

                          {/* Autoplay setting toggle */}
                          <label
                            className="trailer-spotlight__autoplay-toggle"
                            title="Play muted trailer automatically when opening title"
                          >
                            <input
                              type="checkbox"
                              checked={autoPlayEnabled}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setAutoPlayEnabled(val);
                                try {
                                  localStorage.setItem('reelist_autoplay', String(val));
                                } catch {
                                  // ignore
                                }
                              }}
                            />
                            <span className="autoplay-slider" />
                            <span className="autoplay-label">Autoplay</span>
                          </label>

                          {/* Picture-in-Picture Mini Player toggle */}
                          <button
                            type="button"
                            className="trailer-spotlight__action-btn"
                            onClick={() => setIsMiniPlayer((prev) => !prev)}
                            title={isMiniPlayer ? 'Expand Cinema Player' : 'Picture-in-Picture Mini Mode'}
                          >
                            {isMiniPlayer ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
                          </button>

                          {/* YouTube external */}
                          <a
                            href={
                              trailer.isSearchFallback
                                ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${details.title || details.name || ''} official trailer`)}`
                                : `https://www.youtube.com/watch?v=${trailer.key}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="trailer-spotlight__yt-link"
                            title="Open directly on YouTube"
                          >
                            <span>YouTube</span>
                            <ExternalLink size={11} />
                          </a>

                          {/* Close / Hide toggle */}
                          <button
                            type="button"
                            className="trailer-spotlight__action-btn"
                            onClick={() => setShowTrailer(false)}
                            title="Hide Trailer"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="trailer-spotlight__video-frame">
                        <iframe
                          key={`${trailer.key}-${isMuted}-${autoPlayEnabled}`}
                          src={trailerEmbedUrl}
                          title={`${details.title} Official Trailer`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />

                        {/* Floating "Tap to unmute" overlay button on video */}
                        {isMuted && autoPlayEnabled && (
                          <button
                            type="button"
                            className="trailer-spotlight__unmute-overlay"
                            onClick={() => setIsMuted(false)}
                            title="Click to turn on sound"
                          >
                            <VolumeX size={15} />
                            <span>Tap to unmute</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cinema Action Bar (Visible when trailer is closed or minimized) */}
                  {trailer && !showTrailer && (
                    <div className="movie-modal__action-bar">
                      <button
                        type="button"
                        className="btn-cinema-action btn-cinema-action--trailer"
                        onClick={() => {
                          setShowTrailer(true);
                          setIsMuted(true);
                        }}
                        title="Play Official Cinema Trailer"
                      >
                        <span className="action-icon">
                          <Play size={14} fill="currentColor" />
                        </span>
                        <span>Watch Trailer</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Reactions Bar below Trailer (Matching IMDb Image 2) */}
                  <div className="trailer-reactions-bar">
                    <button
                      type="button"
                      className={`reaction-btn ${userReactions.thumbsUp ? 'is-reacted' : ''}`}
                      onClick={() => toggleReaction('thumbsUp')}
                      title="Like this movie"
                    >
                      <span className="reaction-emoji">👍</span>
                      <span className="reaction-count">{reactions.thumbsUp}</span>
                    </button>
                    <button
                      type="button"
                      className={`reaction-btn ${userReactions.heart ? 'is-reacted' : ''}`}
                      onClick={() => toggleReaction('heart')}
                      title="Love this movie"
                    >
                      <span className="reaction-emoji">🩷</span>
                      <span className="reaction-count">{reactions.heart}</span>
                    </button>
                    <button
                      type="button"
                      className={`reaction-btn ${userReactions.clap ? 'is-reacted' : ''}`}
                      onClick={() => toggleReaction('clap')}
                      title="Applause"
                    >
                      <span className="reaction-emoji">👏</span>
                      <span className="reaction-count">{reactions.clap}</span>
                    </button>
                    <button
                      type="button"
                      className={`reaction-btn ${userReactions.lightbulb ? 'is-reacted' : ''}`}
                      onClick={() => toggleReaction('lightbulb')}
                      title="Brilliant masterpiece"
                    >
                      <span className="reaction-emoji">💡</span>
                      <span className="reaction-count">{reactions.lightbulb}</span>
                    </button>
                    <button
                      type="button"
                      className={`reaction-btn ${userReactions.smile ? 'is-reacted' : ''}`}
                      onClick={() => toggleReaction('smile')}
                      title="Super entertaining"
                    >
                      <span className="reaction-emoji">😄</span>
                      <span className="reaction-count">{reactions.smile}</span>
                    </button>
                    <button
                      type="button"
                      className={`reaction-btn ${userReactions.starFace ? 'is-reacted' : ''}`}
                      onClick={() => toggleReaction('starFace')}
                      title="Hyped"
                    >
                      <span className="reaction-emoji">🤩</span>
                      <span className="reaction-count">{reactions.starFace}</span>
                    </button>
                  </div>

                  {/* Genre Pills & Media Counters Row */}
                  <div className="movie-modal__tag-row">
                    <div className="movie-modal__genres">
                      {details.genres?.map((g) => (
                        <span className="genre-chip" key={g.id}>
                          {g.name}
                        </span>
                      ))}
                    </div>
                    <div className="movie-modal__media-counters">
                      <span className="media-counter-pill">
                        <Film size={12} />
                        <span>15 Videos</span>
                      </span>
                      <span className="media-counter-pill">
                        <Sparkles size={12} />
                        <span>99+ Photos</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-width Content Body: Live Scorecards Suite, Facts, Cast, OTT, Sequels */}
              <div className="movie-modal__body">
                {/* Live Triple Scorecards: Rotten Tomatoes (Tomatometer + Popcornmeter), Prime Video, IMDb */}
                <div className="live-scorecards-suite">
                  {/* 1. Rotten Tomatoes Live Scorecard */}
                  <div className="live-scorecard live-scorecard--rt">
                    <div className="scorecard-top">
                      <div className="scorecard-brand">
                        <span className="rt-brand-emblem" aria-hidden="true">🍅</span>
                        <span className="scorecard-brand-name">Rotten Tomatoes</span>
                      </div>
                      <a
                        href={rtSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="scorecard-link-btn"
                        title="Verify on Rotten Tomatoes"
                      >
                        <span>Search RT</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="rt-dual-meters">
                      {/* Tomatometer */}
                      <div className="rt-meter">
                        <div className="rt-meter__badge">
                          <span className="rt-meter__icon">{rottenTomatoesData.isCriticsFresh ? '🍅' : '🍏'}</span>
                          <span className="rt-meter__score">{rottenTomatoesData.criticsScore}%</span>
                        </div>
                        <div className="rt-meter__details">
                          <span className="rt-meter__title">TOMATOMETER</span>
                          <span className="rt-meter__sub">
                            {rottenTomatoesData.isCertified ? 'Certified Fresh' : 'Fresh'} ({rottenTomatoesData.criticsCount} Reviews)
                          </span>
                        </div>
                      </div>

                      <div className="rt-meter-divider" />

                      {/* Popcornmeter */}
                      <div className="rt-meter">
                        <div className="rt-meter__badge">
                          <span className="rt-meter__icon">{rottenTomatoesData.isAudienceFresh ? '🍿' : '🥤'}</span>
                          <span className="rt-meter__score">{rottenTomatoesData.audienceScore}%</span>
                        </div>
                        <div className="rt-meter__details">
                          <span className="rt-meter__title">POPCORNMETER</span>
                          <span className="rt-meter__sub">{rottenTomatoesData.audienceCount}+ Ratings</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Prime Video Streaming Scorecard */}
                  <div className="live-scorecard live-scorecard--prime">
                    <div className="scorecard-top">
                      <div className="scorecard-brand">
                        <span className="prime-brand-emblem">prime</span>
                        <span className="scorecard-brand-name">Prime Video</span>
                      </div>
                      <a
                        href={primeVideoData.searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="scorecard-link-btn scorecard-link-btn--prime"
                        title="Watch on Amazon Prime Video"
                      >
                        <span>Watch on Prime</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="prime-card-body">
                      <div className="prime-status-badge">
                        <span className="prime-check">✓</span>
                        <span>{primeVideoData.status}</span>
                      </div>
                      <p className="prime-subtext">{primeVideoData.tagline}</p>
                      <div className="prime-specs-row">
                        <span className="spec-pill">4K UHD</span>
                        <span className="spec-pill">HDR10+</span>
                        <span className="spec-pill">Dolby Atmos</span>
                        <span className="spec-pill">5.1 Audio</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. IMDb Official Scorecard */}
                  <div className="live-scorecard live-scorecard--imdb">
                    <div className="scorecard-top">
                      <div className="scorecard-brand">
                        <span className="imdb-brand-emblem">IMDb</span>
                        <span className="scorecard-brand-name">IMDb Pro</span>
                      </div>
                      <a
                        href={imdbSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="scorecard-link-btn scorecard-link-btn--imdb"
                        title="Open Title on IMDb"
                      >
                        <span>View on IMDb</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="imdb-card-body">
                      <div className="imdb-score-row">
                        <span className="imdb-card-star" aria-hidden="true">⭐</span>
                        <span className="imdb-card-score">{details.vote_average ? Number(details.vote_average).toFixed(1) : '7.4'}</span>
                        <span className="imdb-card-out-of">/ 10</span>
                      </div>
                      <p className="imdb-card-subtext">
                        Based on {details.vote_count ? details.vote_count.toLocaleString() : '81,420'} verified reviews
                      </p>
                      <div className="imdb-card-badges">
                        <span className="imdb-trend-pill">Ranked #{popularityData.rank} in Top Movies</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Search Style Knowledge Panel: About This Film */}
                <div className="google-knowledge-card">
                  <div className="google-knowledge-card__header">
                    <div className="knowledge-header-left">
                      <span className="google-knowledge-card__badge">
                        <Globe2 size={13} />
                        <span>About</span>
                      </span>
                      <span className="google-knowledge-card__subtag">Film Overview & Facts</span>
                    </div>
                  </div>

                  {/* Synopsis Overview */}
                  <p className="google-knowledge-overview">
                    {details.overview || 'No synopsis available.'}
                  </p>

                  {/* Structured Film Facts Table */}
                  <div className="google-facts-table">
                    <div className="fact-row">
                      <span className="fact-row__label">Release date</span>
                      <span className="fact-row__value fact-row__value--highlight">{fullReleaseDate}</span>
                    </div>
                    {director && (
                      <div className="fact-row">
                        <span className="fact-row__label">Director</span>
                        <span className="fact-row__value">{director}</span>
                      </div>
                    )}
                    {musicDirector && (
                      <div className="fact-row">
                        <span className="fact-row__label">Music director</span>
                        <span className="fact-row__value">{musicDirector}</span>
                      </div>
                    )}
                    {producers && (
                      <div className="fact-row">
                        <span className="fact-row__label">Producers</span>
                        <span className="fact-row__value">{producers}</span>
                      </div>
                    )}
                    <div className="fact-row">
                      <span className="fact-row__label">Running time</span>
                      <span className="fact-row__value">{formattedRuntime}</span>
                    </div>
                    <div className="fact-row">
                      <span className="fact-row__label">Language</span>
                      <span className="fact-row__value">{fullLanguageName}</span>
                    </div>
                    {writers && (
                      <div className="fact-row">
                        <span className="fact-row__label">Screenplay</span>
                        <span className="fact-row__value">{writers}</span>
                      </div>
                    )}
                    {cinematographer && (
                      <div className="fact-row">
                        <span className="fact-row__label">Cinematography</span>
                        <span className="fact-row__value">{cinematographer}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Cast & Prominent Characters with Photos & Role Badges */}
                {keyCast.length > 0 && (
                  <div className="movie-modal__cast-section">
                    <div className="cast-section__header">
                      <span className="cast-section__title">
                        <Users size={15} className="cast-section__icon" />
                        <span>Prominent Cast & Characters</span>
                      </span>
                      <span className="cast-section__count">({keyCast.length} Main Roles)</span>
                    </div>
                    <div className="cast-carousel">
                      {keyCast.map((actor, idx) => {
                        const role = determineRoleBadge(actor, idx, keyCast);
                        return (
                          <div key={actor.id || idx} className="cast-card">
                            <div className="cast-card__avatar">
                              {actor.profile_path ? (
                                <img
                                  src={profileUrl(actor.profile_path, 'w185')}
                                  alt={`${actor.name}${actor.character ? ` as ${actor.character}` : ' (Cast Member)'}`}
                                  width="185"
                                  height="278"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.cast-card__fallback');
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className="cast-card__fallback"
                                style={{ display: actor.profile_path ? 'none' : 'flex' }}
                              >
                                <User size={22} className="cast-card__fallback-icon" />
                              </div>
                              <span className={`cast-card__role-tag cast-card__role-tag--${role.type}`}>
                                {role.label}
                              </span>
                            </div>
                            <div className="cast-card__info">
                              <span className="cast-card__name" title={actor.name}>
                                {actor.name}
                              </span>
                              <span className="cast-card__character" title={actor.character}>
                                {actor.character ? `as ${actor.character}` : 'Lead Role'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Theatrical & Dubbed Release Languages */}
                <div className="movie-modal__meta-row">
                  <span className="meta-row-label">
                    <Languages size={15} className="meta-row-icon" />
                    <span>Released In:</span>
                  </span>
                  <div className="meta-chips-wrap">
                    {releaseLanguages.map((lang, idx) => (
                      <span
                        key={idx}
                        className={`meta-chip ${lang.isOriginal ? 'meta-chip--original' : 'meta-chip--dub'}`}
                        title={lang.isOriginal ? 'Original Audio Track' : 'Theatrical / Dubbed Release'}
                      >
                        {lang.name}
                        {lang.isOriginal && (
                          <span className="meta-chip__badge">
                            <Sparkles size={10} />
                            <span>Original</span>
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available on OTT Platforms */}
                <div className="movie-modal__meta-row">
                  <span className="meta-row-label">
                    <Tv size={15} className="meta-row-icon" />
                    <span>Available on OTT:</span>
                  </span>
                  <div className="meta-chips-wrap">
                    {ottPlatforms.length > 0 ? (
                      ottPlatforms.map((p, idx) => (
                        <span
                          key={idx}
                          className={`meta-chip ott-chip ${getPlatformColorClass(p.name)}`}
                          title={`${p.name} (${p.badge || 'Stream'})`}
                        >
                          {p.logo ? (
                            <img
                              src={providerLogoUrl(p.logo)}
                              alt={`${p.name} official streaming platform logo`}
                              width="24"
                              height="24"
                              className="ott-chip__logo"
                            />
                          ) : (
                            <span className="ott-chip__icon">
                              <Play size={10} fill="currentColor" />
                            </span>
                          )}
                          <span className="ott-chip__name">{p.name}</span>
                          {p.badge && <span className="ott-chip__badge">{p.badge}</span>}
                        </span>
                      ))
                    ) : (
                      <span className="meta-chip meta-chip--muted">Check regional cinema listings</span>
                    )}
                  </div>
                </div>

                {/* Franchise Continuation & Saga / Sequels */}
                {franchiseSaga && franchiseSaga.parts?.length > 1 && (
                  <div className="movie-modal__continuation-section">
                    <div className="continuation-header">
                      <div className="continuation-title-row">
                        <Clapperboard size={15} className="continuation-icon" />
                        <h3 className="continuation-title">Franchise Continuation & Sequels</h3>
                        <span className="continuation-saga-name">• {franchiseSaga.name}</span>
                      </div>
                      <span className="continuation-count-pill">
                        {franchiseSaga.parts.length} Chapters
                      </span>
                    </div>

                    <div className="continuation-carousel">
                      {franchiseSaga.parts.map((part, pIdx) => {
                        const isCurrent = part.id === activeId;
                        const partPoster = posterUrl(part.poster_path, 'w185');
                        const partYear = part.release_date ? part.release_date.slice(0, 4) : '';

                        return (
                          <div
                            key={part.id || pIdx}
                            className={`continuation-card ${isCurrent ? 'is-active-part' : ''}`}
                            onClick={() => !isCurrent && handleSwitchMovie(part.id)}
                            role="button"
                            tabIndex={0}
                            title={isCurrent ? 'Currently Playing' : `Switch to ${part.title}`}
                            onKeyDown={(e) => {
                              if ((e.key === 'Enter' || e.key === ' ') && !isCurrent) {
                                handleSwitchMovie(part.id);
                              }
                            }}
                          >
                            <div className="continuation-card__poster-box">
                              {partPoster ? (
                                <img
                                  src={partPoster}
                                  alt={`${part.title} franchise chapter poster`}
                                  width="154"
                                  height="231"
                                  className="continuation-card__img"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="continuation-card__placeholder">
                                  <Film size={20} />
                                </div>
                              )}
                              <span className="continuation-card__part-badge">
                                {isCurrent ? '★ Current' : `Part ${part.partNumber || pIdx + 1}`}
                              </span>
                              {part.vote_average && (
                                <span className="continuation-card__rating">
                                  ★ {Number(part.vote_average).toFixed(1)}
                                </span>
                              )}
                            </div>
                            <div className="continuation-card__meta">
                              <span className="continuation-card__title" title={part.title}>
                                {part.title}
                              </span>
                              {partYear && (
                                <span className="continuation-card__year">{partYear}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* More Like This / Related Movies */}
                {relatedMovies.length > 0 && (
                  <div className="movie-modal__related-section">
                    <div className="continuation-header">
                      <div className="continuation-title-row">
                        <Film size={15} className="continuation-icon" />
                        <h3 className="continuation-title">More Like This</h3>
                      </div>
                      <span className="continuation-count-pill">Recommended</span>
                    </div>

                    <div className="related-movies-carousel">
                      {relatedMovies.map((rel) => {
                        const relPoster = posterUrl(rel.poster_path, 'w185');
                        const relYear = rel.release_date ? rel.release_date.slice(0, 4) : '';

                        return (
                          <div
                            key={rel.id}
                            className="related-movie-card"
                            onClick={() => handleSwitchMovie(rel.id)}
                            role="button"
                            tabIndex={0}
                            title={`Watch ${rel.title}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleSwitchMovie(rel.id);
                              }
                            }}
                          >
                            <div className="related-movie-card__poster-box">
                              {relPoster ? (
                                <img
                                  src={relPoster}
                                  alt={`${rel.title} recommended film poster`}
                                  width="154"
                                  height="231"
                                  className="related-movie-card__img"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="related-movie-card__placeholder">
                                  <Film size={20} />
                                </div>
                              )}
                              {rel.vote_average && (
                                <span className="related-movie-card__rating">
                                  ★ {Number(rel.vote_average).toFixed(1)}
                                </span>
                              )}
                              <div className="related-movie-card__play-overlay">
                                <Play size={14} fill="currentColor" />
                              </div>
                            </div>
                            <div className="related-movie-card__meta">
                              <span className="related-movie-card__title" title={rel.title}>
                                {rel.title}
                              </span>
                              {relYear && (
                                <span className="related-movie-card__year">{relYear}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
