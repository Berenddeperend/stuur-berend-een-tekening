const VALID_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.mp4$/;

// Proxies a print-verification video from the thermal printer. The browser
// can't hit berendswennenhuis.nl/api/thermal-printer/video/* directly since
// that route is Bearer-gated by Caddy and <video> tags can't attach custom
// headers — so this route attaches the token server-side and streams the
// file back same-origin, mirroring drawing.post.ts's proxy of the print POST.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id || !VALID_ID.test(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid video id" });
  }

  const config = useRuntimeConfig(event);
  const upstream = await fetch(`https://berendswennenhuis.nl/api/thermal-printer/video/${id}`, {
    headers: { Authorization: `Bearer ${config.printerPassword}` },
  });

  if (!upstream.ok || !upstream.body) {
    throw createError({
      statusCode: upstream.status === 404 ? 404 : 502,
      statusMessage: "Video not available",
    });
  }

  setResponseHeader(event, "Content-Type", "video/mp4");
  const length = upstream.headers.get("content-length");
  if (length) setResponseHeader(event, "Content-Length", Number(length));

  return sendStream(event, upstream.body);
});
