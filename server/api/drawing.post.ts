const DATA_URL_PREFIX = "data:image/png;base64,";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ drawing?: string; artist?: string }>(event);

  if (!body?.drawing || !body.drawing.startsWith(DATA_URL_PREFIX)) {
    throw createError("Missing or invalid `drawing` (expected a PNG data URL).");
  }

  const drawing = body.drawing.slice(DATA_URL_PREFIX.length);
  const artist = (body.artist ?? "").trim();

  const result = useDb()
    .prepare("INSERT INTO drawings (drawing, artist) VALUES (?, ?)")
    .run(drawing, artist);

  //
  const response = await fetch("https://berendswennenhuis.nl/api/thermal-printer/label", {
    method: "POST",
    headers: {
      Authorization: `Bearer sbc`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: "bbr",
    }),
  });

  console.log(response);

  setResponseStatus(event, 202);
  return { id: Number(result.lastInsertRowid) };
});
