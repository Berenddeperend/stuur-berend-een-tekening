import { requireAdmin } from "../utils/auth";

export default defineEventHandler(async (event) => {
  requireAdmin(event);

  const db = useDb();

  const entries = db.prepare(`SELECT * FROM drawings`).all();

  return entries;
});
