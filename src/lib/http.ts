import { API_BASE } from "./env";
import { authStore } from "./auth-store";

/**
 * Tries to refresh the access token using the refresh from the authStore.
 * Returns the new access if successful; otherwise, null.
 */
async function refreshAccessToken(): Promise<string | null> {
  const session = authStore.get();
  if (!session?.refresh) return null;

  const res = await fetch(`${API_BASE}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: session.refresh }),
    credentials: "include",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { access: string };
  authStore.setAccess(data.access);
  return data.access;
}

/**
 * HTTP helper:
 * - Defines automatically Content-Type: application/json (except FormData)
 * - Injects Authorization: Bearer <access> when opts.auth === true
 * - Refreshes the token on 401 and repeats the request once
 * - Throws an Error with the response body when not ok
 */
export async function http<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(opts.headers);

  if (opts.auth) {
    const session = authStore.get();
    if (session?.access) {
      headers.set("Authorization", `Bearer ${session.access}`);
    }
  }

  if (!headers.has("Content-Type") && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(url, { ...opts, headers, credentials: "include" });

  if (opts.auth && res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      headers.set("Authorization", `Bearer ${newAccess}`);
      res = await fetch(url, { ...opts, headers, credentials: "include" });
    }
  }

  if (!res.ok) {
    let bodyText = "";
    try {
      bodyText = await res.text();
    } catch {
      /* ignore */
    }
    const statusLine = `HTTP ${res.status} ${res.statusText} - ${url}`;
    const msg = bodyText ? `${statusLine}\n${bodyText}` : statusLine;
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
