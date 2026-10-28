/**
 * Site configuration
 * NOTE: No trailing slash.
 * Override with VITE_SITE_URL environment variable if deployed to a custom domain or different Vercel subdomain.
 */
export const SITE_URL = (import.meta.env?.VITE_SITE_URL || 'https://reelist.vercel.app').replace(/\/+$/, '');
