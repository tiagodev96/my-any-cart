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

const AuthContext = React.createContext<AuthContextValue | null>(null);

function userFromTokens(tokens: AuthTokens): User | null {
  if (tokens.user) return tokens.user;
  const payload = decodeJwt<{ user_id?: number; sub?: string }>(tokens.access);
  const id =
    payload?.user_id ?? (payload?.sub ? Number(payload.sub) : undefined);
  if (!id) return null;
  return { id, email: "", name: undefined };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const session = authStore.get();
    if (session) {
      const u = session.user ?? userFromTokens(session);
      setUser(u ?? null);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const loginWithBackendTokens = React.useCallback(
    async (tokens: AuthTokens) => {
      const u = tokens.user ?? userFromTokens(tokens);
      const session: AuthTokens = { ...tokens, user: u ?? undefined };
      authStore.set(session);
      setUser(u ?? null);
    },
    []
  );

  const logout = React.useCallback(() => {
    authStore.clear();
    setUser(null);
  }, []);

  const reloadUser = React.useCallback(async () => {
    const session = authStore.get();
    if (!session) {
      setUser(null);
      return;
    }
    const u = session.user ?? userFromTokens(session);
    setUser(u ?? null);
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
