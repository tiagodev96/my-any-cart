import { API_BASE } from "./env";
import { authStore } from "./auth-store";

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

export async function http<T>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = new Headers(opts.headers);

  if (opts.auth) {
    const session = authStore.get();
    if (session?.access)
      headers.set("Authorization", `Bearer ${session.access}`);
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
    const text = await res.text();
    throw new Error(
      `HTTP ${res.status} ${res.statusText} - ${url}\n${text || ""}`.trim()
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
