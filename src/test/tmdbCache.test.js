import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TmdbCache } from '../utils/tmdbCache.js';

describe('TMDB Cache with TTL', () => {
  let cache;
  let mockStorage;
  let storageStore;

  beforeEach(() => {
    storageStore = {};
    mockStorage = {
      getItem: vi.fn((k) => storageStore[k] || null),
      setItem: vi.fn((k, v) => {
        storageStore[k] = String(v);
      }),
      removeItem: vi.fn((k) => {
        delete storageStore[k];
      }),
      clear: vi.fn(() => {
        storageStore = {};
      }),
      get length() {
        return Object.keys(storageStore).length;
      },
      key: vi.fn((i) => Object.keys(storageStore)[i] || null),
    };

    cache = new TmdbCache(1000, mockStorage); // 1000ms TTL for testing
  });

  it('stores and retrieves cached data from memory and storage', () => {
    cache.set('test_key', { foo: 'bar' });

    expect(cache.get('test_key')).toEqual({ foo: 'bar' });
    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'tmdb_cache_test_key',
      expect.stringContaining('"foo":"bar"')
    );
  });

  it('expires cache entries after TTL has passed', () => {
    vi.useFakeTimers();
    try {
      cache.set('expire_me', { val: 42 });
      expect(cache.get('expire_me')).toEqual({ val: 42 });

      // Advance time past 1000ms TTL
      vi.advanceTimersByTime(1500);

      expect(cache.get('expire_me')).toBeNull();
      expect(mockStorage.removeItem).toHaveBeenCalledWith('tmdb_cache_expire_me');
    } finally {
      vi.useRealTimers();
    }
  });

  it('restores cached item from sessionStorage if memory map is empty', () => {
    const freshCache = new TmdbCache(5000, mockStorage);
    storageStore['tmdb_cache_saved_key'] = JSON.stringify({
      data: { hello: 'world' },
      timestamp: Date.now(),
    });

    const result = freshCache.get('saved_key');
    expect(result).toEqual({ hello: 'world' });
  });

  it('does not cache null or undefined data', () => {
    cache.set('empty_key', null);
    cache.set('undef_key', undefined);

    expect(cache.get('empty_key')).toBeNull();
    expect(cache.get('undef_key')).toBeNull();
    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });
});
