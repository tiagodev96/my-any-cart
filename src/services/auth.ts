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
  register: "/api/users/",
};

function normalizeUser(u?: BackendUser): User | undefined {
  if (!u) return undefined;
  return {
    id: u.id,
    email: u.email,
    name: u.name ?? null ?? undefined,
  };
}

function normalizeTokens(raw: BackendAuthTokens): AuthTokens {
  return {
    access: raw.access,
    refresh: raw.refresh,
    user: normalizeUser(raw.user),
  };
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

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password2?: string;
};

export type RegisterResponse = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  access: string;
  refresh: string;
};

export async function registerEmailPassword(
  payload: RegisterPayload
): Promise<AuthTokens> {
  const raw = await http<RegisterResponse>(EP.register, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const user: User = {
    id: raw.id,
    email: raw.email,
    name:
      [raw.first_name, raw.last_name].filter(Boolean).join(" ") || undefined,
  };

  return { access: raw.access, refresh: raw.refresh, user };
}
