// Turn the raw camera originals into web-ready photos.
//
//   raw/*.jpg  (~450 MB, 0.7-14 MB each)
//        |
//   public/photos/<name>-{400,800,1600}.webp   (~10 MB total)
//
// Usage:  npm run images
// Needs:  nothing but `npm install` — sharp ships its own binaries.
import { mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = process.argv[2] ?? 'raw';
const OUT = process.argv[3] ?? 'public/photos';
const WIDTHS = [400, 800, 1600];

if (!existsSync(SRC)) {
  console.error(`error: no '${SRC}/' directory.`);
  console.error(`Download the Drive folder into '${SRC}/' first, then re-run.`);
  process.exit(1);
}

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /\.jpe?g$/i.test(f));
if (files.length === 0) {
  console.error(`error: no .jpg files found in '${SRC}/'.`);
  process.exit(1);
}

let done = 0;
let skipped = 0;
let bytesIn = 0;
let bytesOut = 0;

for (const file of files) {
  const stem = path.basename(file, path.extname(file));
  bytesIn += (await stat(path.join(SRC, file))).size;

  for (const w of WIDTHS) {
    const target = path.join(OUT, `${stem}-${w}.webp`);

    // Re-runs are cheap: skip anything already converted.
    if (existsSync(target)) {
      skipped++;
      bytesOut += (await stat(target)).size;
      continue;
    }

    await sharp(path.join(SRC, file))
      .rotate()                                   // honour the EXIF orientation
      .resize(w, w, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })                      // strips metadata by default
      .toFile(target);

    bytesOut += (await stat(target)).size;
  }

  done++;
  process.stdout.write(`\r  ${done}/${files.length} photos`);
}

const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
process.stdout.write('\n');
console.log(`Done. ${done} photos -> ${OUT}/`);
console.log(`  originals ${mb(bytesIn)}  ->  web ${mb(bytesOut)}`);
if (skipped) console.log(`  (${skipped} sizes already existed and were skipped)`);
