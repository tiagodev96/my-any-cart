"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Container from "../container";

type User = {
  id?: number;
  email?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

type NavbarProps = {
  user?: User | null;
  loadingUser?: boolean;
  onLogout?: () => void;
};

function getInitials(firstName?: string, lastName?: string) {
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();
  const fi = f ? f[0] : "";
  const li = l ? l[0] : "";
  const res = (fi + li).toUpperCase();
  return res || "??";
}

function buildFullName(
  t: ReturnType<typeof useTranslations>,
  u?: User | null
): string {
  if (!u) return t("common.guest");
  const full =
    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
    (u.email ? u.email.split("@")[0] : "") ||
    t("common.guest");
  return full;
}

export default function Navbar({ user, loadingUser, onLogout }: NavbarProps) {
  const t = useTranslations("products");
  const pathname = usePathname();
  const locale = React.useMemo(
    () => pathname?.split("/").filter(Boolean)[0] || "pt",
    [pathname]
  );

  const initials = getInitials(user?.firstName, user?.lastName);
  const fullName = buildFullName(t, user);

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    const fullHref = `/${locale}${href.startsWith("/") ? href : `/${href}`}`;
    const active = pathname === fullHref;
    return (
      <Link
        href={fullHref}
        className={cn(
          "px-2 py-1 text-sm transition-colors",
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/60 backdrop-blur">
      <Container verticalPadding={false}>
        <nav className="mx-auto flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={`/${locale}`} className="font-semibold tracking-tight">
              MyAnyCart
            </Link>
            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                <NavLink href="/">{t("cart")}</NavLink>
                <NavLink href="/history">{t("history")}</NavLink>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {loadingUser ? (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="hidden h-4 w-24 animate-pulse rounded bg-muted sm:block" />
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-1 hover:bg-transparent"
                  >
                    <Avatar className="h-8 w-8">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={fullName} />
                      ) : (
                        <AvatarFallback>{initials}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden max-w-[160px] truncate text-sm sm:inline-block">
                      {fullName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-48"
                >
                  <DropdownMenuLabel className="truncate">
                    {fullName}
                  </DropdownMenuLabel>
                  {user.email ? (
                    <div className="px-2 pb-1 text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`}>{t("profile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/`}>{t("cart")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/history`}>{t("history")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href={`/${locale}/login`}>
                <Button variant="default" size="sm">
                  {t("login")}
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
