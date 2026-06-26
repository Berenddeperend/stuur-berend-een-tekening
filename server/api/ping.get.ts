export default defineEventHandler(() => {
  return {
    status: "ok",
    service: "stuur-berend-een-tekening",
    timestamp: new Date().toISOString(),
  };
});
