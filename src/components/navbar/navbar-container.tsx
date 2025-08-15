"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "./index";
import { useAuth } from "@/contexts/AuthContext";
import { http } from "@/lib/http";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/get-error-message";
import { useTranslations } from "next-intl";

type MeResponse = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  name?: string | null;
  avatar_url?: string | null;
  is_staff: boolean;
};

type DisplayUser = {
  id?: number;
  email?: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

function deriveFromAuth(
  authUser: { email: string; name?: string } | null
): DisplayUser | null {
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

  return {
    id: undefined,
    email: authUser.email,
    firstName,
    lastName,
    avatarUrl: null,
  };
}

export default function NavbarContainer() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split("/").filter(Boolean)[0] || "pt";

  const { user, logout } = useAuth();

  const [me, setMe] = React.useState<MeResponse | null>(null);
  const [loadingMe, setLoadingMe] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    const ac = new AbortController();

    async function fetchMe() {
      if (!user) {
        setMe(null);
        return;
      }
      setLoadingMe(true);
      try {
        const data = await http<MeResponse>("/api/me/", {
          method: "GET",
          auth: true,
          signal: ac.signal,
        });
        if (!alive) return;
        setMe(data);
      } catch (err) {
        if (alive) {
          setMe(null);
          const msg = getErrorMessage(err);
          toast.error(t("auth.errors.generic", { message: msg }));
        }
      } finally {
        if (alive) setLoadingMe(false);
      }
    }

    fetchMe();
    return () => {
      alive = false;
      ac.abort();
    };
  }, [user, t]);

  const displayUser: DisplayUser | null = React.useMemo(() => {
    if (me) {
      const first = (me.first_name || "").trim();
      const last = (me.last_name || "").trim();

      return {
        id: me.id,
        email: me.email,
        firstName: first || deriveFromAuth(user)?.firstName || "User",
        lastName: last || deriveFromAuth(user)?.lastName || "",
        avatarUrl: me.avatar_url ?? null,
      };
    }
    return deriveFromAuth(user);
  }, [me, user]);

  async function handleLogout() {
    logout();
    router.replace(`/${locale}/login`);
  }

  return (
    <Navbar
      user={displayUser}
      loadingUser={loadingMe}
      onLogout={handleLogout}
    />
  );
}
