import { http } from "@/lib/http";
import type {
  AuthTokens,
  BackendAuthTokens,
  BackendUser,
  User,
} from "@/types/auth";

const EP = {
  login: "/auth/login/",
  register: "/auth/register/",
  google: "/auth/google/",
  me: "/me/",
};

function normalizeUser(u?: BackendUser): User | undefined {
  if (!u) return undefined;
  return { id: u.id, email: u.email, name: u.name ?? undefined };
}
function normalizeTokens(t: BackendAuthTokens): AuthTokens {
  return { access: t.access, refresh: t.refresh, user: normalizeUser(t.user) };
}

/**
 * Login with email/password.
 * Always returns AuthTokens already normalized.
 */
export async function loginEmailPassword(
  email: string,
  password: string
): Promise<AuthTokens> {
  const raw = await http<unknown>(EP.login, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const t = raw as BackendAuthTokens;
  return normalizeTokens(t);
}

/**
 * Register with email/password.
 * - Some backends return tokens when registering; others don't.
 * - By default, we do a POST and then call loginEmailPassword to get tokens.
 */
export async function registerEmailPassword(
  email: string,
  password: string,
  name?: string
): Promise<void> {
  await http<unknown>(EP.register, {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

/**
 * Login with Google (swap id_token for backend tokens).
 */
export async function loginWithGoogle(id_token: string): Promise<AuthTokens> {
  const raw = await http<unknown>(EP.google, {
    method: "POST",
    body: JSON.stringify({ id_token }),
  });
  const t = raw as BackendAuthTokens;
  return normalizeTokens(t);
}

/**
 * Buscar usuário logado (caso precise).
 */
export async function me(): Promise<User> {
  const raw = await http<BackendUser>(EP.me, { auth: true });
  return normalizeUser(raw)!;
}
