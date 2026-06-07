import { readdir } from "node:fs/promises";
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

  return await Promise.all(
    originals.map(async (name) => {
      try {
        // Backfill / self-heal: generate the thumbnail if it's missing.
        await ensureThumb(name);
        const { w, h } = await imageDimensions(name);
        return { name, thumb: thumbName(name), w, h };
      } catch {
        // Processing failed — serve the original and let the client measure it.
        return { name, thumb: name, w: undefined, h: undefined };
      }
    }),
  );
});
