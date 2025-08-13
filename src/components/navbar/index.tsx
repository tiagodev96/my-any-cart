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
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

type NavbarProps = {
  user?: User | null;
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

export default function Navbar({ user, onLogout }: NavbarProps) {
  const t = useTranslations("products");
  const pathname = usePathname();
  const initials = getInitials(user?.firstName, user?.lastName);
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Convidado";

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
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
            <Link href="/" className="font-semibold tracking-tight">
              MyAnyCart
            </Link>
            <div className="hidden items-center gap-2 sm:flex">
              <NavLink href="/carrinho">{t("cart")}</NavLink>
              <NavLink href="/historico">{t("history")}</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 px-1 hover:bg-transparent"
                >
                  <Avatar className="h-8 w-8">
                    {user?.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={fullName} />
                    ) : (
                      <AvatarFallback>{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden text-sm sm:inline-block">
                    {fullName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-44">
                <DropdownMenuLabel className="truncate">
                  {fullName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil">{t("profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-destructive focus:text-destructive"
                >
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </Container>
    </header>
  );
}
