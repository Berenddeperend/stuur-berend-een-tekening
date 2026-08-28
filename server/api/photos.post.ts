import { writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { PHOTOS_DIR, ensureThumb } from "../utils/images";
import { requireAdmin } from "../utils/auth";

// Mirrors routes/photos/[...file].get.ts's `contentTypes` map, reversed —
// keep the two in sync if new formats are ever added.
const extensionsByMime: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const formData = await readMultipartFormData(event);
  const files = (formData ?? []).filter((part) => part.filename);

  // Never trust the client-provided filename (path traversal, collisions,
  // arbitrary extensions) — derive our own name from a UUID + a server-side
  // mime→extension lookup. Validate everything before writing anything, so
  // a request either fully succeeds or fully fails (no partial writes).
  const toWrite = files.map((file) => {
    const ext = file.type ? extensionsByMime[file.type] : undefined;
    if (!ext) {
      throw createError({
        statusCode: 400,
        statusMessage: `Unsupported file type: ${file.type ?? "unknown"}`,
      });
    }
    return { name: `${randomUUID()}${ext}`, data: file.data };
  });

  await Promise.all(toWrite.map((f) => writeFile(path.join(PHOTOS_DIR, f.name), f.data)));

  // Generate grid thumbnails up front so the first Hall of Fame load is cheap.
  // A failure here shouldn't fail the upload — the GET handler regenerates
  // lazily as a fallback.
  await Promise.all(toWrite.map((f) => ensureThumb(f.name).catch(() => {})));

  return { ok: true, files: toWrite.map((f) => f.name) };
});
