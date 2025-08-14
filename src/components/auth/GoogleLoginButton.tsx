"use client";

import React from "react";
import {
  GoogleLogin,
  GoogleOAuthProvider,
  type CredentialResponse,
} from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "@/lib/env";
import { useAuth } from "@/contexts/AuthContext";
import { loginWithGoogle } from "@/services/auth";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Erro desconhecido";
  }
}

export function GoogleLoginButton() {
  const { loginWithBackendTokens } = useAuth();

  const handleSuccess = React.useCallback(
    async (cred: CredentialResponse): Promise<void> => {
      try {
        const id_token = cred.credential;
        if (!id_token) throw new Error("Falha ao obter id_token do Google");
        const tokens = await loginWithGoogle(id_token);
        await loginWithBackendTokens(tokens);
      } catch (err: unknown) {
        alert(getErrorMessage(err) || "Login falhou");
      }
    },
    [loginWithBackendTokens]
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex items-center justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => alert("Login com Google falhou")}
          useOneTap
        />
      </div>
    </GoogleOAuthProvider>
  );
}
