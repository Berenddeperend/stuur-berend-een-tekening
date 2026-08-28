import { unlink } from "node:fs/promises";
import path from "node:path";
import { PHOTOS_DIR, isThumb, thumbName } from "../../utils/images";
import { requireAdmin } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const name = getRouterParam(event, "name");
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: "Missing name" });
  }

  // Same traversal-guard idiom as routes/photos/[...file].get.ts — `name`
  // comes straight from the client via the URL.
  const abs = path.resolve(PHOTOS_DIR, name);
  if (abs !== PHOTOS_DIR && !abs.startsWith(PHOTOS_DIR + path.sep)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  // Only originals are deletable directly — deleting `<x>.thumb.webp` by
  // name would orphan the original with no pointer back to regenerate from.
  if (isThumb(name)) {
    throw createError({ statusCode: 400, statusMessage: "Cannot delete a thumbnail directly" });
  }

  const originalAbs = path.join(PHOTOS_DIR, name);
  const thumbAbs = path.join(PHOTOS_DIR, thumbName(name));

  let deletedSomething = false;
  for (const target of [originalAbs, thumbAbs]) {
    try {
      await unlink(target);
      deletedSomething = true;
    } catch (err: unknown) {
      if ((err as { code?: string })?.code !== "ENOENT") throw err;
    }
  }

  if (!deletedSomething) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  return { ok: true };
});
