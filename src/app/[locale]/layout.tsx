import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { LocaleSwitcherFab } from "@/components/locale-switcher-fab";
import NavbarContainer from "@/components/navbar/navbar-container";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let messages: Record<string, unknown>;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NavbarContainer />
      {children}
      <LocaleSwitcherFab />
    </NextIntlClientProvider>
  );
}
