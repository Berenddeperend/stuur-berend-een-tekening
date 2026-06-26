// CORS for the photos endpoints only, so a browser/Flutter-web client on
// another origin can read and upload photos. Native apps ignore CORS entirely;
// this is only needed for browser-based callers.
export default defineEventHandler((event) => {
  if (!event.path.startsWith("/api/photos")) return;

  handleCors(event, {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowHeaders: "*",
  });
});
