/**
 * Prefix a site-absolute path with the configured base.
 *
 * GitHub Pages serves a project site from a subdirectory
 * (/Suhas_Skates/), and Astro does not rewrite hardcoded hrefs — so every
 * internal link and asset path has to go through here or it 404s in
 * production while working fine in dev.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path: string): string {
  return `${BASE}/${path.replace(/^\//, '')}`;
}
