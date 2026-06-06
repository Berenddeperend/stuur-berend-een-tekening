const DATA_URL_PREFIX = "data:image/png;base64,";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ drawing?: string; artist?: string; date: number }>(event);

  const config = useRuntimeConfig(event);

  if (!body?.drawing || !body.drawing.startsWith(DATA_URL_PREFIX)) {
    throw createError("Missing or invalid `drawing` (expected a PNG data URL).");
  }

  const drawing = body.drawing.slice(DATA_URL_PREFIX.length);
  const artist = (body.artist ?? "").trim();
  const date = new Date(body.date)
    .toLocaleString("sv-SE", { timeZone: "Europe/Amsterdam" })
    .replace("T", " ");

  const result = useDb()
    .prepare(
      "INSERT INTO drawings (drawing, artist, date) VALUES (?, ?, datetime('now', 'localtime'))",
    )
    .run(drawing, artist);

  //
  const printDrawingResponse = await $fetch(
    "https://berendswennenhuis.nl/api/thermal-printer/drawing",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.printerPassword}`,
        "Content-Type": "application/json",
      },
      body: {
        author: artist,
        date: date,
        drawing: `${drawing}`,
      },
    },
  );

  setResponseStatus(event, 202);
  return { id: Number(result.lastInsertRowid), printDrawingResponse };
});
