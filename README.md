# Suhas Skates

A static catalogue of inline speed skating gear — wheels, frames and complete
skates — kept as an inventory record. No prices, no checkout, no backend.

Built with [Astro](https://astro.build). The site ships as plain HTML, CSS and
about 80 lines of inline JavaScript for filtering and sorting. The whole build
output is under 100 KB before photos.

## How it works

```
data/items.csv          one row per ITEM  ← the thing you edit
raw/                    camera originals (gitignored, ~450 MB)
      │  npm run images
      ▼
public/photos/          web-ready .webp at 400 / 800 / 1600 px (~10 MB)
      │  npm run build
      ▼
dist/                   the static site
```

`data/items.csv` is the single source of truth. Everything on the site —
the table, the filter chips, the per-item pages — is generated from it.

## Getting started

```bash
npm install
npm run dev          # http://localhost:4321
```

The catalogue renders immediately with placeholder marks. Photos are optional
until you run the image pipeline.

## Adding photos

1. Download the Drive folder into `raw/` at the project root.
2. `npm run images`

That reads every `raw/*.jpg`, corrects orientation, strips EXIF and writes three
WebP widths per photo into `public/photos/`. Roughly 450 MB of camera originals
becomes about 10 MB of web assets. Re-runs skip files already converted.

Requires ImageMagick 7 (`brew install imagemagick`, or `apt install imagemagick`).

Raw originals stay out of git deliberately — keep them in Drive. Only the
optimised `public/photos/` files are committed.

## Adding items

Edit `data/items.csv`. One row per **item**, not per photo:

| column | notes |
| --- | --- |
| `id` | lowercase, digits and hyphens. Becomes the URL: `/items/<id>/` |
| `name` | model name, without the brand |
| `brand` | MATTER, MPC, Titan, Cougar … |
| `category` | `wheels`, `frames`, `skates`, `bearings`, `accessories` |
| `diameter_mm` | wheels only; leave blank otherwise |
| `durometer` | `86A`, `XFirm` … ; blank where it doesn't apply |
| `qty` | how many you have |
| `condition` | `new`, `like-new`, `good`, `worn` |
| `photos` | filenames from `raw/`, pipe-separated: `a.jpg\|b.jpg` |
| `notes` | free text, shown on the item page |

The CSV is validated against a schema at build time. A bad row fails the build
and names the line:

```
data/items.csv row 8 is invalid — category: Invalid enum value.
Expected 'wheels' | 'frames' | 'skates' | 'bearings' | 'accessories', received 'sprockets'
```

### Which photos belong to which item?

Several shots in the folder are one item from different angles — five frames
between `163619` and `163631` are the same wheel set, twelve seconds apart.
To cluster them by capture time:

```bash
npm run group                  # default: raw/, 90-second gap
npm run group -- raw 120       # wider gap
```

It prints suggested groupings ready to paste into the `photos` column. Check
them against the pictures before trusting them — it is a time heuristic, not
image recognition.

`data/unsorted.txt` lists the photos not yet assigned to any item. Fifty-one of
the fifty-seven still need identifying.

## Deploying

Any static host works. The build output is `dist/`.

- **Cloudflare Pages** — build `npm run build`, output `dist`
- **Netlify** — same
- **GitHub Pages** — set `site: 'https://sunilkks0507.github.io'` and
  `base: '/Suhas_Skates'` in `astro.config.mjs`

Set `site` in `astro.config.mjs` to the final URL before deploying.

## Project layout

```
data/items.csv            the catalogue
data/unsorted.txt         photos awaiting identification
scripts/optimize-images.sh
scripts/group-by-exif.mjs
src/lib/items.ts          CSV parsing + schema validation
src/pages/index.astro     spec table, filters, sorting
src/pages/items/[id].astro
src/styles/global.css     light and dark themes
```

## Photo credit

The source photographs were shared from a Google Drive folder owned by
`13suhasrao@gmail.com`. Confirm permission before publishing the site publicly.
