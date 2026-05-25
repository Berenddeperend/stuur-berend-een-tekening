export default defineEventHandler(async (event) => {
  const db = useDb();

  const entries = db.prepare(`SELECT * FROM drawings`).all();

  return entries;
});
