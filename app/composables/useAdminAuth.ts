const STORAGE_KEY = "stuur-berend-admin-password";

export function useAdminAuth() {
  const password = useLocalStorage<string>(STORAGE_KEY, "");

  const authHeaders = computed<Record<string, string>>(() =>
    password.value ? { Authorization: `Bearer ${password.value}` } : {},
  );

  /** Call from a catch block: clears a stale/wrong password on a 401 so the
   *  login form re-appears instead of every subsequent request failing silently. */
  function handleUnauthorized(err: unknown): boolean {
    const status = (err as { statusCode?: number })?.statusCode;
    if (status === 401) {
      password.value = "";
      return true;
    }
    return false;
  }

  return { password, authHeaders, handleUnauthorized };
}
