export default defineI18nConfig(() => ({
  legacy: false,
  // Both locale files are complete, but a fallback means a forgotten key shows
  // Dutch copy instead of leaking a raw key like "how.step2.title" to visitors.
  fallbackLocale: "nl",
}));
