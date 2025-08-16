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
import { useTranslations } from "next-intl";

function getErrorMessage(
  err: unknown,
  t: ReturnType<typeof useTranslations>
): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return t("auth.errors.generic");
  }
}

export function GoogleLoginButton() {
  const t = useTranslations();
  const { loginWithBackendTokens } = useAuth();

  const handleSuccess = React.useCallback(
    async (cred: CredentialResponse): Promise<void> => {
      try {
        const id_token = cred.credential;
        if (!id_token) throw new Error(t("auth.errors.googleToken"));
        const tokens = await loginWithGoogle(id_token);
        await loginWithBackendTokens(tokens);
      } catch (err: unknown) {
        alert(getErrorMessage(err, t));
      }
    },
    [loginWithBackendTokens, t]
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex items-center justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => alert(t("auth.errors.googleLogin"))}
          useOneTap
        />
      </div>
    </GoogleOAuthProvider>
  );
}
