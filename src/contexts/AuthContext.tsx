"use client";

import React from "react";
import { authStore } from "@/lib/auth-store";
import type { User, AuthTokens } from "@/types/auth";
import { decodeJwt } from "@/lib/jwt";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  loginWithBackendTokens: (tokens: AuthTokens) => Promise<void>;
  logout: () => void;
  reloadUser: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

function userFromAccess(access: string): User | null {
  const payload = decodeJwt<Record<string, unknown>>(access);
  if (!payload) return null;

  const id =
    (payload.user_id as number | undefined) ??
    (typeof payload.sub === "number" ? (payload.sub as number) : undefined);

  const email =
    (payload.email as string | undefined) ??
    (payload.username as string | undefined);

  if (!id && !email) return null;
  return { id: id ?? -1, email: email ?? "" };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const logout = React.useCallback((): void => {
    authStore.clear();
    setUser(null);
  }, []);

  const reloadUser = React.useCallback(async (): Promise<void> => {
    const session = authStore.get();
    if (!session?.access) {
      setUser(null);
      return;
    }
    if (session.user?.id) {
      setUser(session.user);
      return;
    }
    setUser(userFromAccess(session.access));
  }, []);

  const loginWithBackendTokens = React.useCallback(
    async (tokens: AuthTokens): Promise<void> => {
      const u = tokens.user ?? userFromAccess(tokens.access);
      authStore.set({ ...tokens, user: u ?? undefined });
      setUser(u ?? null);
    },
    []
  );

  React.useEffect(() => {
    (async () => {
      const session = authStore.get();
      if (session?.access) {
        const u = session.user ?? userFromAccess(session.access);
        setUser(u ?? null);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithBackendTokens, logout, reloadUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
