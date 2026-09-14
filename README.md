# Suhas Skates

A photographic catalogue of an inline speed skating collection — wheels,
frames and complete skates. Photographs only: no names, no specifications,
no prices.

Built with [Astro](https://astro.build). The published site is static HTML,
one stylesheet and a small lightbox script.

## How it works

```
raw/                    camera originals (gitignored, ~450 MB)
      │  npm run images
      ▼
public/photos/          web-ready .webp at 400 / 800 / 1600 px (~10 MB)
      │  npm run build
      ▼
dist/                   the static site
```

**`public/photos/` is the whole catalogue.** The gallery reads that directory
at build time — drop processed photographs in and they appear, in the order
they were shot. There is no manifest to keep in step.

## Getting started

```bash
npm install
npm run dev          # http://localhost:4321/Suhas_Skates/
```

## Adding photographs

1. Put the camera originals in `raw/` at the project root.
2. `npm run images`
3. Commit `public/photos/` and push. The site deploys automatically.

`npm run images` corrects orientation from EXIF, strips metadata and writes
three widths per photograph as WebP. Roughly 450 MB of originals becomes about
10 MB. Re-runs skip what is already converted, so it is safe to interrupt.

No system packages are needed — `npm install` brings its own image binaries.

Originals stay out of git deliberately; keep them in Drive. Only the optimised
files in `public/photos/` are committed.

## Design notes

- **Nothing is cropped.** Real pixel dimensions are read from every file at
  build time, so the masonry reserves exact space and photographs keep their
  own proportions. Without those dimensions the layout reflows as images load.
- **Dark ground.** White urethane and polished aluminium read better against
  near-black, and the accent is the green of the G13 hubs. The page commits to
  one palette rather than following the viewer's system theme, the way a
  gallery commits to a wall colour.
- **Lightbox.** Click any photograph. Arrow keys and swipe move between them,
  Escape closes, and neighbours are preloaded so it never stutters.
- **No captions anywhere**, including `alt` text, which is empty by design:
  these are decorative plates in a gallery, not informational images.

## The written record

`data/items.csv` and `data/unsorted.txt` are kept in the repository but are
**not rendered**. They hold what could be identified from the photographs —
MATTER G13, MPC Black Magic, Powerslide DIAL AL frames, Titan, Warrun, Cougar,
with sizes and durometers — and remain useful if the catalogue ever needs
specifications again. Earlier versions of this site rendered them; see the git
history.

## Deploying

Deployed to **GitHub Pages** at https://sunilkks0507.github.io/Suhas_Skates/
by `.github/workflows/deploy.yml` on every push to `main`.

One-time setup: **Settings → Pages → Source: GitHub Actions**. Pages is free on
public repositories; a private one needs a paid plan. Free-tier limits are 1 GB
published and 100 GB bandwidth per month — this catalogue is around 10 MB.

Moving to Cloudflare Pages, Netlify or a custom domain: set `site` to the new
origin and delete `base` from `astro.config.mjs`. Build `npm run build`, output
`dist`.

## Photo credit

The photographs were taken by Suhas and shared from his Google Drive folder.
Published here with his permission.
