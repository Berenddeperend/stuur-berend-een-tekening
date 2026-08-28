export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);
  if (!idParam || !Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid id" });
  }

  const result = useDb().prepare("DELETE FROM drawings WHERE id = ?").run(id);
  if (result.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }

  return { ok: true };
});
