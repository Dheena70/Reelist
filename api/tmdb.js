import { validateTmdbPath, sanitizePath, filterTmdbQueryParams } from '../src/utils/tmdbValidation.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rawPath = req.query?.path || '';
  if (!validateTmdbPath(rawPath)) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(400).json({ error: 'Invalid or unauthorized path' });
  }

  const queryCheck = filterTmdbQueryParams(req.query || {});
  if (!queryCheck.valid) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(400).json({ error: queryCheck.error });
  }

  const token = (process.env.TMDB_TOKEN || '').trim();
  if (!token) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ error: 'TMDB_TOKEN is not configured on the server' });
  }

  const cleanPath = sanitizePath(rawPath);
  const targetUrl = new URL(`https://api.themoviedb.org/3/${cleanPath}`);

  // Forward only allowlisted query parameters
  Object.entries(queryCheck.params).forEach(([k, v]) => {
    targetUrl.searchParams.set(k, v);
  });

  const headers = { Accept: 'application/json' };
  if (token.startsWith('eyJ')) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    targetUrl.searchParams.set('api_key', token);
  }

  try {
    const upstreamRes = await fetch(targetUrl.toString(), { headers });

    const data = await upstreamRes.json();

    if (upstreamRes.ok) {
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }

    return res.status(upstreamRes.status).json(data);
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Upstream gateway error fetching from TMDB' });
  }
}
