import { existsSync, readFileSync } from 'node:fs';
import { z } from 'zod';
import { url } from './url';

/** Minimal RFC-4180 parser: handles quoted fields and escaped "" quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
      continue;
    }

    if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }

  row.push(field);
  if (row.some((f) => f.trim() !== '')) rows.push(row);
  return rows;
}

export const CATEGORIES = ['wheels', 'frames', 'skates', 'bearings', 'accessories'] as const;
export const CONDITIONS = ['new', 'like-new', 'good', 'worn'] as const;

const optionalNumber = z
  .string()
  .transform((s) => (s.trim() === '' ? undefined : Number(s)))
  .pipe(z.number().positive().optional());

const ItemSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'id must be lowercase letters, digits and hyphens'),
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.enum(CATEGORIES),
  diameter_mm: optionalNumber,
  durometer: z.string().transform((s) => s.trim() || undefined),
  qty: z.string().transform((s) => (s.trim() === '' ? 1 : Number(s))).pipe(z.number().int().min(0)),
  condition: z.enum(CONDITIONS),
  photos: z
    .string()
    .transform((s) => s.split('|').map((p) => p.trim()).filter(Boolean)),
  notes: z.string().transform((s) => s.trim() || undefined),
});

export type Item = z.infer<typeof ItemSchema>;

function load(): Item[] {
  const rows = parseCsv(readFileSync('data/items.csv', 'utf8'));
  if (rows.length === 0) throw new Error('data/items.csv is empty');

  const [header, ...body] = rows;
  const keys = header.map((h) => h.trim());

  const items = body.map((cells, i) => {
    const raw = Object.fromEntries(keys.map((k, j) => [k, cells[j] ?? '']));
    const parsed = ItemSchema.safeParse(raw);
    if (!parsed.success) {
      // Fail the build loudly and point at the offending spreadsheet row.
      const detail = parsed.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      throw new Error(`data/items.csv row ${i + 2} is invalid — ${detail}`);
    }
    return parsed.data;
  });

  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) throw new Error(`data/items.csv has a duplicate id: ${item.id}`);
    seen.add(item.id);
  }

  return items;
}

export const items = load();

const WIDTHS = [400, 800, 1600] as const;

/**
 * Photo base name -> the three widths written by scripts/optimize-images.sh.
 * Returns null until the optimised files exist, so the catalogue renders a
 * placeholder instead of a broken image before `npm run images` has been run.
 */
export function srcset(photo: string) {
  const stem = photo.replace(/\.[^.]+$/, '');
  if (!existsSync(`public/photos/${stem}-800.webp`)) return null;
  return {
    src: url(`/photos/${stem}-800.webp`),
    srcset: WIDTHS.map((w) => `${url(`/photos/${stem}-${w}.webp`)} ${w}w`).join(', '),
  };
}

/** First photo of an item that has actually been processed, if any. */
export function firstPhoto(item: Item) {
  for (const photo of item.photos) {
    const found = srcset(photo);
    if (found) return found;
  }
  return null;
}

/** Distinct values actually present, so the filter bar never offers a dead option. */
export const facets = {
  category: [...new Set(items.map((i) => i.category))].sort(),
  diameter: [...new Set(items.map((i) => i.diameter_mm).filter((d): d is number => d !== undefined))]
    .sort((a, b) => b - a),
  durometer: [...new Set(items.map((i) => i.durometer).filter((d): d is string => !!d))].sort(),
  condition: [...new Set(items.map((i) => i.condition))].sort(),
};

export const totals = {
  items: items.length,
  units: items.reduce((sum, i) => sum + i.qty, 0),
  photos: items.reduce((sum, i) => sum + i.photos.length, 0),
};
