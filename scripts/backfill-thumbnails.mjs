// One-off: generate grid thumbnails for photos uploaded before thumbnailing
// existed. Safe to re-run — it skips photos that already have a thumbnail.
//
//   node scripts/backfill-thumbnails.mjs
//
// Run from the project root (resolves ./public/photos relative to cwd).
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PHOTOS_DIR = path.resolve("public/photos");
const THUMB_SUFFIX = ".thumb.webp";
const THUMB_WIDTH = 500;
const THUMB_QUALITY = 75;
const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
const originals = entries.filter(
  (e) =>
    e.isFile() &&
    !e.name.endsWith(THUMB_SUFFIX) &&
    exts.has(path.extname(e.name).toLowerCase()),
);

let made = 0;
for (const e of originals) {
  const ext = path.extname(e.name);
  const dest = path.join(PHOTOS_DIR, e.name.slice(0, e.name.length - ext.length) + THUMB_SUFFIX);

  try {
    await stat(dest);
    console.log(`skip  ${e.name} (thumb exists)`);
    continue;
  } catch {
    // not generated yet
  }

  try {
    await sharp(path.join(PHOTOS_DIR, e.name))
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(dest);
    made++;
    console.log(`thumb ${e.name}`);
  } catch (err) {
    console.error(`FAIL  ${e.name}: ${err.message}`);
  }
}

console.log(`\nDone. Generated ${made} thumbnail(s) from ${originals.length} photo(s).`);
