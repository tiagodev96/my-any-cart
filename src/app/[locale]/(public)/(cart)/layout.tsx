import { ReactNode } from "react";
import NavbarContainer from "@/components/navbar/navbar-container";
import { LocaleSwitcherFab } from "@/components/locale-switcher-fab";

export default async function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <NavbarContainer />
      {children}
      <LocaleSwitcherFab />
    </>
  );
}
