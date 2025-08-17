"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { loginUsernamePassword } from "@/services/auth";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/get-error-message";
import { useTranslations } from "next-intl";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

interface LoginRequiredViewProps {
  next?: string;
}

export function LoginRequiredView({ next }: LoginRequiredViewProps) {
  const { user, loginWithBackendTokens } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "pt";
  const defaultNext = next || search.get("next") || `/${locale}`;

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const t = useTranslations();

  React.useEffect(() => {
    if (user) router.replace(defaultNext);
  }, [user, defaultNext, router]);

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
      router.replace(defaultNext);
      toast.success(t("auth.login.loginSuccess"));
    } catch (err: unknown) {
      const msg = getErrorMessage(err, t);
      toast.error(t("auth.errors.generic", { message: msg }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-4 h-screen flex justify-center items-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("auth.loginRequired.title")}</CardTitle>
          <CardDescription>
            {t("auth.loginRequired.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />

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

          <div className="text-sm text-muted-foreground">
            {t("auth.loginRequired.noAccount")}
            <Link
              className="underline hover:no-underline"
              href={`/register?next=${encodeURIComponent(defaultNext)}`}
            >
              {t("auth.loginRequired.goToRegister")}
            </Link>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button asChild variant="secondary">
            <Link href={defaultNext}>{t("auth.loginRequired.goToCart")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginRequiredView;
