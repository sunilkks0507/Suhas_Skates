// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Set this to your final URL before deploying, e.g.
  //   'https://sunilkks0507.github.io'  + base: '/Suhas_Skates'
  //   or your own domain with no base.
  site: 'https://example.com',
  build: { format: 'directory' },
  // The catalogue ships zero client-side framework code. The only JS is the
  // ~80 line filter/sort script inlined on the index page.
});
