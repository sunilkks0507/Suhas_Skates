#!/usr/bin/env bash
# Turn the raw camera originals into web-ready photos.
#
#   raw/*.jpg  (~450 MB, 0.7-14 MB each)
#        |
#   public/photos/<name>-{400,800,1600}.webp   (~10 MB total)
#
# Usage:  npm run images
# Needs:  ImageMagick 7 (`magick`).  macOS: brew install imagemagick
set -euo pipefail

SRC=${1:-raw}
OUT=${2:-public/photos}

if ! command -v magick >/dev/null 2>&1; then
  echo "error: ImageMagick 7 not found. Install it, then re-run." >&2
  echo "  macOS:  brew install imagemagick" >&2
  echo "  Debian: sudo apt install imagemagick" >&2
  exit 1
fi

if [ ! -d "$SRC" ]; then
  echo "error: no '$SRC/' directory. Download the Drive folder into it first." >&2
  exit 1
fi

mkdir -p "$OUT"
count=0

shopt -s nullglob nocaseglob
for f in "$SRC"/*.jpg "$SRC"/*.jpeg; do
  n=$(basename "${f%.*}")
  for w in 400 800 1600; do
    target="$OUT/${n}-${w}.webp"
    # Skip work already done, so re-runs are cheap.
    [ -f "$target" ] && continue
    magick "$f" -auto-orient -strip -resize "${w}x${w}>" -quality 80 "$target"
  done
  count=$((count + 1))
  printf '\r  %s photos processed' "$count"
done
shopt -u nullglob nocaseglob

printf '\n'
if [ "$count" -eq 0 ]; then
  echo "No .jpg files found in '$SRC/'."
  exit 1
fi

echo "Done. $count photos -> $(du -sh "$OUT" | cut -f1) in $OUT/"
