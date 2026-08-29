import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { PHOTOS_DIR, isThumb, thumbName, ensureThumb, imageDimensions } from "../utils/images";

const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

export default defineEventHandler(async () => {
  const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });

  const originals = entries
    .filter(
      (e) => e.isFile() && !isThumb(e.name) && exts.has(path.extname(e.name).toLowerCase()),
    )
    .map((e) => e.name);

  const photos = await Promise.all(
    originals.map(async (name) => {
      // mtime doubles as "uploaded at" — files are written once and never
      // modified afterward, so it's a reliable upload-order signal.
      const mtimeMs = (await stat(path.join(PHOTOS_DIR, name)).catch(() => null))?.mtimeMs ?? 0;

      try {
        // Backfill / self-heal: generate the thumbnail if it's missing.
        await ensureThumb(name);
        const { w, h } = await imageDimensions(name);
        return { name, thumb: thumbName(name), w, h, mtimeMs };
      } catch {
        // Processing failed — serve the original and let the client measure it.
        return { name, thumb: name, w: undefined, h: undefined, mtimeMs };
      }
    }),
  );

  // Most recently uploaded first.
  photos.sort((a, b) => b.mtimeMs - a.mtimeMs);

  return photos.map(({ mtimeMs: _mtimeMs, ...photo }) => photo);
});
