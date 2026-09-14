// Cluster raw photos into probable items by capture time.
//
// Several shots of one wheel set were taken seconds apart, so a gap in the
// timestamps is a reliable item boundary. This prints a starting point for
// the `photos` column in data/items.csv — check it against the pictures
// before trusting it.
//
// Usage:  npm run group [-- <dir> <gap-seconds>]
import { readdirSync } from 'node:fs';
import { basename } from 'node:path';

const dir = process.argv[2] ?? 'raw';
const gapSeconds = Number(process.argv[3] ?? 90);

// Phone filenames carry the capture time: IMG_20260626_163619.jpg
const NAME_RE = /^IMG_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/;

function timeOf(name) {
  const m = NAME_RE.exec(basename(name));
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m.map(Number);
  return Date.UTC(y, mo - 1, d, h, mi, s) / 1000;
}

let files;
try {
  files = readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f));
} catch {
  console.error(`error: cannot read '${dir}/'. Pass a directory: npm run group -- <dir>`);
  process.exit(1);
}

const dated = files
  .map((f) => ({ file: f, t: timeOf(f) }))
  .filter((x) => x.t !== null)
  .sort((a, b) => a.t - b.t);

const undated = files.filter((f) => timeOf(f) === null);

if (dated.length === 0) {
  console.error(`error: no IMG_<date>_<time> filenames found in '${dir}/'.`);
  process.exit(1);
}

const groups = [[dated[0]]];
for (let i = 1; i < dated.length; i++) {
  const prev = dated[i - 1];
  const cur = dated[i];
  if (cur.t - prev.t <= gapSeconds) groups.at(-1).push(cur);
  else groups.push([cur]);
}

console.log(`${dated.length} photos -> ${groups.length} probable items (gap > ${gapSeconds}s)\n`);
groups.forEach((g, i) => {
  const id = `item-${String(i + 1).padStart(2, '0')}`;
  const span = g.at(-1).t - g[0].t;
  console.log(`${id}  (${g.length} shot${g.length > 1 ? 's' : ''}, ${span}s)`);
  console.log(`  ${g.map((x) => x.file).join('|')}\n`);
});

if (undated.length) {
  console.log(`${undated.length} file(s) with unrecognised names, assign by hand:`);
  undated.forEach((f) => console.log(`  ${f}`));
}
