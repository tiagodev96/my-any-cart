"use client";

import React from "react";
import { authStore } from "@/lib/auth-store";
import { http } from "@/lib/http";
import type { User, AuthTokens, BackendUser } from "@/types/auth";

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

function normalizeUser(u: BackendUser): User {
  return { id: u.id, email: u.email, name: u.name ?? undefined };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const logout = React.useCallback((): void => {
    authStore.clear();
    setUser(null);
  }, []);

  const reloadUser = React.useCallback(async (): Promise<void> => {
    try {
      const me = await http<BackendUser>("/me/", { auth: true });
      setUser(normalizeUser(me));
    } catch {
      setUser(null);
    }
  }, []);

  const loginWithBackendTokens = React.useCallback(
    async (tokens: AuthTokens): Promise<void> => {
      authStore.set(tokens);
      await reloadUser();
    },
    [reloadUser]
  );

  React.useEffect(() => {
    (async () => {
      const session = authStore.get();
      if (session?.access) {
        await reloadUser();
      }
      setLoading(false);
    })();
  }, [reloadUser]);

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
