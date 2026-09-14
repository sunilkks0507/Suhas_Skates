// @ts-check
import { defineConfig } from 'astro/config';

// Deployed to GitHub Pages as a project site, so the whole catalogue lives
// under /Suhas_Skates/. Internal links go through src/lib/url.ts, which reads
// `base` — do not hardcode absolute paths in templates.
//
// Moving to a custom domain or Cloudflare Pages later? Set `site` to that
// origin and delete `base` — nothing else changes.
export default defineConfig({
  site: 'https://sunilkks0507.github.io',
  base: '/Suhas_Skates',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
