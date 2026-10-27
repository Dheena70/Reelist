import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { validateTmdbPath, filterTmdbQueryParams } from './src/utils/tmdbValidation.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const token = (env.TMDB_TOKEN || process.env.TMDB_TOKEN || '').trim();

  return {
    plugins: [
      react(),
      {
        name: 'dev-tmdb-validator',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.startsWith('/api/tmdb')) {
              const parsed = new URL(req.url, 'http://localhost');
              const tmdbPath = parsed.searchParams.get('path') || '';
              if (!validateTmdbPath(tmdbPath)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid or unauthorized path' }));
                return;
              }
              const rawObj = {};
              parsed.searchParams.forEach((v, k) => {
                rawObj[k] = v;
              });
              const queryCheck = filterTmdbQueryParams(rawObj);
              if (!queryCheck.valid) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: queryCheck.error }));
                return;
              }
              if (!token) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'TMDB_TOKEN is not configured on the server' }));
                return;
              }
            }
            next();
          });
        },
      },
    ],
    server: {
      proxy: {
        '/api/tmdb': {
          target: 'https://api.themoviedb.org/3',
          changeOrigin: true,
          rewrite: (urlPath) => {
            const parsed = new URL(urlPath, 'http://localhost');
            const tmdbPath = (parsed.searchParams.get('path') || '').replace(/^\/+/, '');
            const rawObj = {};
            parsed.searchParams.forEach((v, k) => {
              rawObj[k] = v;
            });
            const filtered = filterTmdbQueryParams(rawObj);
            const remaining = new URLSearchParams(filtered.params).toString();
            return `/${tmdbPath}${remaining ? `?${remaining}` : ''}`;
          },
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
              }
            : undefined,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      fileParallelism: false,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'lucide-icons': ['lucide-react'],
            'supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
  };
});
