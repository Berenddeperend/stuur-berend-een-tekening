import { readdir, writeFile, glob } from "node:fs/promises";
import path from "node:path";

const storage = useStorage("uploads");

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  const filesToUpload: Promise<any>[] = [];

  formData?.forEach((file) => {
    filesToUpload.push(writeFile(path.resolve(`./public/photos/${file.filename}`), file.data));
  });

  await Promise.all(filesToUpload);

  return 200;

  //
  // const body = await readBody(event);
  // return { file };
});
