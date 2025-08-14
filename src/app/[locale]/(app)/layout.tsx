import { ReactNode } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import NavbarContainer from "@/components/navbar/navbar-container";
import { LocaleSwitcherFab } from "@/components/locale-switcher-fab";

export default async function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireAuth>
      <NavbarContainer />
      {children}
      <LocaleSwitcherFab />
    </RequireAuth>
  );
}
