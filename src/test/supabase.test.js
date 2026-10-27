import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSupabase,
  hasPersistedSession,
  _resetSupabaseClientPromiseForTesting,
} from '../lib/supabase.js';

describe('Supabase Client Lazy Loader (getSupabase)', () => {
  beforeEach(() => {
    _resetSupabaseClientPromiseForTesting();
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    _resetSupabaseClientPromiseForTesting();
    vi.unstubAllEnvs();
  });

  it('returns null when Supabase environment variables are missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const client = await getSupabase();
    expect(client).toBeNull();
  });

  it('returns null when Supabase environment variables are undefined strings', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'undefined');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'undefined');

    const client = await getSupabase();
    expect(client).toBeNull();
  });

  it('creates and caches the Supabase client when configured', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://mock-project.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key-abc-123');

    const client1 = await getSupabase();
    expect(client1).not.toBeNull();
    expect(typeof client1.auth.signUp).toBe('function');

    const client2 = await getSupabase();
    expect(client2).toBe(client1); // strict reference equality (cached instance)
  });

  describe('hasPersistedSession detector', () => {
    it('returns false when localStorage has no Supabase keys', () => {
      expect(hasPersistedSession()).toBe(false);
    });

    it('returns true when a Supabase auth token key exists in localStorage', () => {
      localStorage.setItem('sb-abcdefgh-auth-token', JSON.stringify({ access_token: 'xyz' }));
      expect(hasPersistedSession()).toBe(true);
    });

    it('returns true when URL hash contains recovery token', () => {
      const origLocation = window.location;
      delete window.location;
      window.location = new URL('https://reelist.app/#access_token=token&type=recovery');

      expect(hasPersistedSession()).toBe(true);

      window.location = origLocation;
    });
  });
});
