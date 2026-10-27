// TMDB Client Caching Helper (In-Memory Map + sessionStorage with 1h TTL)

export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export class TmdbCache {
  constructor(ttl = CACHE_TTL_MS, storage = (typeof window !== 'undefined' ? window.sessionStorage : null)) {
    this.memory = new Map();
    this.ttl = ttl;
    this.storage = storage;
  }

  get(key) {
    const now = Date.now();

    // 1. Check in-memory map
    if (this.memory.has(key)) {
      const entry = this.memory.get(key);
      if (now - entry.timestamp < this.ttl) {
        return entry.data;
      }
      this.memory.delete(key);
    }

    // 2. Check sessionStorage
    if (this.storage) {
      try {
        const raw = this.storage.getItem(`tmdb_cache_${key}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (now - parsed.timestamp < this.ttl) {
            this.memory.set(key, parsed);
            return parsed.data;
          }
          this.storage.removeItem(`tmdb_cache_${key}`);
        }
      } catch {
        // Ignore storage errors
      }
    }

    return null;
  }

  set(key, data) {
    if (data === undefined || data === null) return;
    const entry = { data, timestamp: Date.now() };

    this.memory.set(key, entry);

    if (this.storage) {
      try {
        this.storage.setItem(`tmdb_cache_${key}`, JSON.stringify(entry));
      } catch {
        // Ignore quota/sessionStorage errors
      }
    }
  }

  clear() {
    this.memory.clear();
    if (this.storage) {
      try {
        const toRemove = [];
        for (let i = 0; i < this.storage.length; i++) {
          const k = this.storage.key(i);
          if (k && k.startsWith('tmdb_cache_')) {
            toRemove.push(k);
          }
        }
        toRemove.forEach((k) => this.storage.removeItem(k));
      } catch {
        // Ignore storage clearing errors
      }
    }
  }
}

export const tmdbCache = new TmdbCache();
