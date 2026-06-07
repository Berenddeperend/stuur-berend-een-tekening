import path from "node:path";
import { stat } from "node:fs/promises";
import sharp from "sharp";

export const PHOTOS_DIR = path.resolve("./public/photos");

// Grid thumbnails: small WebP derivatives generated from the uploaded originals.
// Named `<base>.thumb.webp` so they live next to the original in the same volume.
const THUMB_SUFFIX = ".thumb.webp";
const THUMB_WIDTH = 500;
const THUMB_QUALITY = 75;

export const isThumb = (name: string) => name.endsWith(THUMB_SUFFIX);

export const thumbName = (original: string) => {
  const ext = path.extname(original);
  return original.slice(0, original.length - ext.length) + THUMB_SUFFIX;
};

/** Generate the thumbnail for `original` if it doesn't already exist. */
export const ensureThumb = async (original: string) => {
  const dest = path.join(PHOTOS_DIR, thumbName(original));
  try {
    await stat(dest);
    return; // already generated
  } catch {
    // not generated yet — fall through and create it
  }

  await sharp(path.join(PHOTOS_DIR, original))
    .rotate() // bake in EXIF orientation so the WebP needs no orientation tag
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: THUMB_QUALITY })
    .toFile(dest);
};

/** Orientation-corrected pixel dimensions of the original, for PhotoSwipe. */
export const imageDimensions = async (original: string) => {
  const meta = await sharp(path.join(PHOTOS_DIR, original)).metadata();
  // EXIF orientations 5–8 rotate by 90°, swapping the displayed width/height.
  const swap = (meta.orientation ?? 1) >= 5;
  return {
    w: swap ? meta.height : meta.width,
    h: swap ? meta.width : meta.height,
  };
};
