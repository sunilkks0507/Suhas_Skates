// @ts-check
import { defineConfig } from 'astro/config';

// Deployed to GitHub Pages as a project site, so the whole catalogue lives
// under /Suhas_Skates/. Internal links go through src/lib/url.ts, which reads
// `base` — do not hardcode absolute paths in templates.
//
// Moving to a custom domain or Cloudflare Pages later? Set `site` to that
// origin and delete `base` — nothing else changes.
//
// Azure Static Web Apps serves from the root, so its workflow sets
// SITE_BASE=/ and SITE_URL=<swa url>. GitHub Pages keeps the defaults.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://sunilkks0507.github.io',
  base: process.env.SITE_BASE ?? '/Suhas_Skates',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
