import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { LocaleSwitcherFab } from "@/components/locale-switcher-fab";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages: Record<string, unknown>;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <LocaleSwitcherFab />
    </NextIntlClientProvider>
  );
}
