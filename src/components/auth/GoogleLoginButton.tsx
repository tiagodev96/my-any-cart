"use client";

import React from "react";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  type CredentialResponse,
} from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/lib/env";
import { http } from "@/lib/http";
import { useAuth } from "@/contexts/AuthContext";
import type {
  BackendAuthTokens,
  BackendUser,
  AuthTokens,
  User,
} from "@/types/auth";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

// --- normalizadores: Backend* -> tipos do app (sem null)
function normalizeUser(u?: BackendUser): User | undefined {
  if (!u) return undefined;
  return { id: u.id, email: u.email, name: u.name ?? undefined };
}
function normalizeTokens(t: BackendAuthTokens): AuthTokens {
  return { access: t.access, refresh: t.refresh, user: normalizeUser(t.user) };
}

export function GoogleLoginButton() {
  const { loginWithBackendTokens } = useAuth();

  const handleSuccess = React.useCallback(
    async (cred: CredentialResponse): Promise<void> => {
      try {
        const id_token = cred.credential;
        if (!id_token) throw new Error("Failed to get id_token from Google");

        // Buscamos como unknown para não “contaminar” o resto do app com Backend*
        const raw = await http<unknown>("/auth/google/", {
          method: "POST",
          body: JSON.stringify({ id_token }),
        });

        // Faz o narrowing + normalização aqui
        const backend = raw as BackendAuthTokens;
        const tokens = normalizeTokens(backend); // <- AuthTokens

        await loginWithBackendTokens(tokens); // <- agora bate o tipo
      } catch (err: unknown) {
        alert(getErrorMessage(err) || "Login failed");
      }
    },
    [loginWithBackendTokens]
  );

  const handleError = React.useCallback((): void => {
    alert("Login with Google failed");
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex items-center justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
      </div>
    </GoogleOAuthProvider>
  );
}
