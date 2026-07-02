import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { PHOTOS_DIR } from "../../utils/images";

// Serve uploaded photos from disk at request time. Nitro's static handler only
// serves files that existed at build time (they're baked into a manifest), so
// runtime uploads 404 there. This route reads straight from PHOTOS_DIR instead,
// covering both the committed photos and anything uploaded via /api/photos.

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export default defineEventHandler(async (event) => {
  const rel = event.context.params?.file ?? "";

  // Resolve and confirm the path stays inside PHOTOS_DIR (block ../ traversal).
  const abs = path.resolve(PHOTOS_DIR, rel);
  if (abs !== PHOTOS_DIR && !abs.startsWith(PHOTOS_DIR + path.sep)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  let stats;
  try {
    stats = await stat(abs);
  } catch {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
  if (!stats.isFile()) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  const type = contentTypes[path.extname(abs).toLowerCase()];
  if (type) setHeader(event, "content-type", type);
  setHeader(event, "content-length", stats.size);
  setHeader(event, "cache-control", "public, max-age=31536000, immutable");

  return sendStream(event, createReadStream(abs));
});
