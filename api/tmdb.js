import { validateTmdbPath, sanitizePath } from '../src/utils/tmdbValidation.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rawPath = req.query?.path || '';
  if (!validateTmdbPath(rawPath)) {
    return res.status(400).json({ error: 'Invalid or unauthorized path' });
  }

  const token = process.env.TMDB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'TMDB_TOKEN is not configured on the server' });
  }

  const cleanPath = sanitizePath(rawPath);
  const targetUrl = new URL(`https://api.themoviedb.org/3/${cleanPath}`);

  Object.entries(req.query || {}).forEach(([k, v]) => {
    if (k !== 'path' && v !== undefined && v !== null && v !== '') {
      targetUrl.searchParams.set(k, String(v));
    }
  });

  try {
    const upstreamRes = await fetch(targetUrl.toString(), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    const data = await upstreamRes.json();

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(upstreamRes.status).json(data);
  } catch {
    return res.status(502).json({ error: 'Upstream gateway error fetching from TMDB' });
  }
}
