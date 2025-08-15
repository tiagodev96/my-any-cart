"use client";

import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      const segs = (pathname || "/").split("/").filter(Boolean);
      const locale = segs[0] || "pt";
      const next = encodeURIComponent(pathname || `/${locale}`);
      router.replace(`/${locale}/login?next=${next}`);
    }
  }, [loading, user, pathname, router]);

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!user) return null;

  return <>{children}</>;
}
