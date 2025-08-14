"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "./index";
import { useAuth } from "@/contexts/AuthContext";

function toDisplayUser(authUser: { email: string; name?: string } | null) {
  if (!authUser) return null;

  const full = (authUser.name || "").trim();
  let firstName = "";
  let lastName = "";

  if (full) {
    const parts = full.split(/\s+/);
    firstName = parts[0] ?? "";
    lastName = parts.slice(1).join(" ");
  } else {
    const [local] = authUser.email.split("@");
    firstName = local || "User";
    lastName = "";
  }

  return { firstName, lastName, avatarUrl: null as string | null };
}

export default function NavbarContainer() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "pt";

  const { user, logout } = useAuth();
  const displayUser = toDisplayUser(user);

  async function handleLogout() {
    logout();
    router.replace(`/${locale}/login`);
  }

  return <Navbar user={displayUser} onLogout={handleLogout} />;
}
