"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

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

import { useAuth } from "@/contexts/AuthContext";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { registerEmailPassword } from "@/services/auth";
import { getErrorMessage } from "@/utils/get-error-message";

export default function RegisterView() {
  const t = useTranslations();
  const { user, loginWithBackendTokens } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "pt";
  const next = search.get("next") || `/${locale}`;

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password || !firstName || !lastName) {
      toast.error(t("auth.errors.fillAllRequired"));
      return;
    }
    if (password !== confirm) {
      toast.error(t("auth.errors.passwordMismatch"));
      return;
    }

    setBusy(true);
    try {
      const tokens = await registerEmailPassword({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        password2: confirm,
      });

      await loginWithBackendTokens(tokens);
      toast.success(t("auth.register.registerSuccess"));
      router.replace(next);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, t);
      toast.error(t("auth.errors.generic", { message: msg }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.register.title")}</CardTitle>
          <CardDescription>{t("auth.register.description")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  {t("auth.register.firstName") || "Nome"}
                </Label>
                <Input
                  id="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">
                  {t("auth.register.lastName") || "Sobrenome"}
                </Label>
                <Input
                  id="last_name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t("auth.register.email") || "Email"}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.register.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">
                  {t("auth.register.confirmPassword")}
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? t("auth.register.creating") : t("auth.register.cta")}
            </Button>
          </form>

          <div className="relative my-2">
            <div aria-hidden className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 opacity-60">
                {t("auth.orContinueWith")}
              </span>
            </div>
          </div>

          <GoogleLoginButton />
        </CardContent>

        <CardFooter className="flex justify-between text-sm">
          <span className="opacity-80">{t("auth.register.haveAccount")}</span>
          <Link
            href={`/${locale}/login?next=${encodeURIComponent(next)}`}
            className="underline"
          >
            {t("auth.register.goToLogin")}
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
