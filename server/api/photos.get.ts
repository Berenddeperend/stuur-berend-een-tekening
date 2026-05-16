import { readdir, glob } from "node:fs/promises";
import path from "node:path";

export default defineEventHandler(async (event) => {
  // return await readdir(path.resolve("./public/photos"));

  const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

  const dir = "./public/photos";
  const entries = await readdir(dir, { withFileTypes: true });

  const images = entries
    .filter((e) => e.isFile() && exts.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name);
  // .map(e => path.join(dir, e.name))

  return images;
});
