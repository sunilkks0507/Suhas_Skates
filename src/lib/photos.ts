import { existsSync, readdirSync } from 'node:fs';
import sharp from 'sharp';

const DIR = 'public/photos';
const WIDTHS = [400, 800, 1600] as const;

export interface Photo {
  stem: string;
  width: number;
  height: number;
  src: string;
  srcset: string;
}

/** Base path, so the gallery works under the GitHub Pages subdirectory. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * Every photograph in public/photos/, newest last.
 *
 * The gallery reads the directory rather than a manifest: drop processed
 * photos in and they appear. Filenames are IMG_<date>_<time>, so a plain
 * sort puts the collection in the order it was shot.
 *
 * Real pixel dimensions are read from each file at build time. Without them
 * a masonry layout reflows as images load; with them the browser reserves
 * the exact space and nothing moves.
 */
async function load(): Promise<Photo[]> {
  if (!existsSync(DIR)) return [];

  const stems = [
    ...new Set(
      readdirSync(DIR)
        .filter((f) => f.endsWith('-800.webp'))
        .map((f) => f.slice(0, -'-800.webp'.length)),
    ),
  ].sort();

  return Promise.all(
    stems.map(async (stem) => {
      const meta = await sharp(`${DIR}/${stem}-800.webp`).metadata();
      return {
        stem,
        width: meta.width ?? 800,
        height: meta.height ?? 800,
        src: `${BASE}/photos/${stem}-800.webp`,
        srcset: WIDTHS.map((w) => `${BASE}/photos/${stem}-${w}.webp ${w}w`).join(', '),
      };
    }),
  );
}

export const photos = await load();
