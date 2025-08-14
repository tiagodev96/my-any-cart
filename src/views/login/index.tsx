"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/contexts/AuthContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { loginUsernamePassword } from "@/services/auth";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Erro desconhecido";
  }
}

export default function LoginView() {
  const { user, loginWithBackendTokens } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "pt";
  const next = search.get("next") || `/${locale}`;

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const t = useTranslations();

  React.useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username || !password) {
      toast.error(t("auth.errors.fillUserPass"));
      return;
    }

    setBusy(true);
    try {
      const tokens = await loginUsernamePassword(username, password);
      await loginWithBackendTokens(tokens);
      router.replace(next);
      toast.success(t("auth.login.loginSuccess"));
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.error(t("auth.errors.generic", { message: msg }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.login.title")}</CardTitle>
          <CardDescription>{t("auth.login.description")}</CardDescription>
        </CardHeader>
  
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="username">{t("auth.login.username")}</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                required
              />
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.login.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />
            </div>
  
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? t("auth.login.entering") : t("auth.login.enter")}
            </Button>
          </form>
  
          <div className="relative">
            <Separator className="my-6" />
            <div className="absolute inset-x-0 -top-3 flex justify-center">
              <span className="bg-background px-2 text-xs opacity-70">
                {t("auth.login.or")}
              </span>
            </div>
          </div>
  
          <GoogleLoginButton />
        </CardContent>
  
        <CardFooter className="flex justify-between text-sm">
          <span className="opacity-80">{t("auth.login.noAccount")}</span>
          <Link
            href={`/${locale}/register?next=${encodeURIComponent(next)}`}
            className="underline"
          >
            {t("auth.login.createAccount")}
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
  
}
