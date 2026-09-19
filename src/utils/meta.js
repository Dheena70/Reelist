/**
 * Dynamic SEO and Open Graph metadata manager for Reelist SPA.
 */

const DEFAULT_TITLE = 'Reelist — Explore September, August & July 2026 Blockbusters';
const DEFAULT_DESC = 'Discover the freshest theatrical blockbusters released in September, August & July 2026 across Tamil, Telugu, Hindi, Malayalam, Kannada & Global cinema with official 4K trailers.';
const SITE_URL = 'https://dheena70.github.io/Reelist/';
const DEFAULT_OG_IMAGE = 'https://dheena70.github.io/Reelist/og-image.png';

function setMetaTag(selector, attribute, value) {
  if (typeof document === 'undefined' || !value) return;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    const [attrName, attrVal] = selector.replace('meta[', '').replace(']', '').split('=');
    element.setAttribute(attrName.trim(), attrVal.replace(/["']/g, '').trim());
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

export function updatePageMeta({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESC,
  ogImage = DEFAULT_OG_IMAGE,
  path = '',
} = {}) {
  if (typeof document === 'undefined') return;

  const fullTitle = title.includes('Reelist') ? title : `${title} | Reelist`;
  document.title = fullTitle;

  // Standard Description
  setMetaTag('meta[name="description"]', 'content', description);

  // Open Graph
  setMetaTag('meta[property="og:title"]', 'content', fullTitle);
  setMetaTag('meta[property="og:description"]', 'content', description);
  setMetaTag('meta[property="og:image"]', 'content', ogImage);
  setMetaTag('meta[property="og:url"]', 'content', `${SITE_URL}${path ? '#' + path.replace(/^#/, '') : ''}`);

  // Twitter
  setMetaTag('meta[name="twitter:title"]', 'content', fullTitle);
  setMetaTag('meta[name="twitter:description"]', 'content', description);
  setMetaTag('meta[name="twitter:image"]', 'content', ogImage);
}
