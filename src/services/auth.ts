import { http } from "@/lib/http";
import type {
  AuthTokens,
  BackendAuthTokens,
  BackendUser,
  User,
} from "@/types/auth";

const EP = {
  login: "/api/token/",
  refresh: "/api/token/refresh/",
  google: "/api/auth/google/",
};

function normalizeUser(u?: BackendUser): User | undefined {
  if (!u) return undefined;
  return { id: u.id, email: u.email, name: u.name ?? undefined };
}

function normalizeTokens(t: BackendAuthTokens): AuthTokens {
  return { access: t.access, refresh: t.refresh, user: normalizeUser(t.user) };
}

export async function loginUsernamePassword(
  username: string,
  password: string
): Promise<AuthTokens> {
  const raw = await http<{ access: string; refresh: string }>(EP.login, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return { access: raw.access, refresh: raw.refresh };
}

export async function loginWithGoogle(id_token: string): Promise<AuthTokens> {
  const raw = await http<BackendAuthTokens>(EP.google, {
    method: "POST",
    body: JSON.stringify({ id_token, credential: id_token }),
  });
  return normalizeTokens(raw);
}
