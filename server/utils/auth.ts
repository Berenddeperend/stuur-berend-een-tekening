import type { H3Event } from "h3";

/** Throws 401 unless the request carries `Authorization: Bearer <adminPassword>`. */
export function requireAdmin(event: H3Event) {
  const authHeader = getHeader(event, "authorization");
  const password = authHeader?.replace(/^Bearer\s+/, "");
  const config = useRuntimeConfig(event);

  // Guard the empty-string default explicitly: if NUXT_ADMIN_PASSWORD is
  // never set, an equally-empty client password must not be a valid match.
  if (!config.adminPassword || !password || password !== config.adminPassword) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
}
