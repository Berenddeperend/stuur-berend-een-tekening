import { writeFile } from "node:fs/promises";
import path from "node:path";
import { PHOTOS_DIR, ensureThumb } from "../utils/images";

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  const written: string[] = [];
  for (const file of formData ?? []) {
    if (!file.filename) continue;
    await writeFile(path.join(PHOTOS_DIR, file.filename), file.data);
    written.push(file.filename);
  }

  // Generate grid thumbnails up front so the first Hall of Fame load is cheap.
  // A failure here (e.g. unsupported file) shouldn't fail the upload — the GET
  // handler regenerates lazily as a fallback.
  await Promise.all(written.map((name) => ensureThumb(name).catch(() => {})));

  return 200;
});
