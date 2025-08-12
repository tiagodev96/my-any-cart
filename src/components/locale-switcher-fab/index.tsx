"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const LABELS: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  fr: "Français",
  es: "Español",
};

const SHORT_LABELS: Record<Locale, string> = {
  pt: "PT",
  en: "EN",
  fr: "FR",
  es: "ES",
};

export function LocaleSwitcherFab() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;

  const handleChange = (l: Locale) => {
    if (l === currentLocale) return;
    router.replace(pathname, { locale: l });
  };

  return (
    <>
      {/* MOBILE: barra fixa inferior */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-50
          flex items-center justify-center
          border-t bg-background/80 backdrop-blur
          px-3 py-2
          md:hidden
        "
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              aria-label="Change language"
            >
              <span className="text-sm font-medium">
                {SHORT_LABELS[currentLocale]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            side="top"
            className="min-w-[10rem]"
          >
            {locales.map((l: Locale) => (
              <DropdownMenuItem key={l} onClick={() => handleChange(l)}>
                <span className="mr-2 inline-block w-4">
                  {l === currentLocale ? <Check className="h-4 w-4" /> : null}
                </span>
                {LABELS[l]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-xs text-muted-foreground">
              {currentLocale.toUpperCase()}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* DESKTOP: botão flutuante */}
      <div className="hidden md:block">
        <div className="fixed bottom-6 right-6 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-3 rounded-full shadow-md"
                aria-label="Change language"
              >
                <span className="text-sm font-medium">
                  {SHORT_LABELS[currentLocale]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[10rem]">
              {locales.map((l: Locale) => (
                <DropdownMenuItem key={l} onClick={() => handleChange(l)}>
                  <span className="mr-2 inline-block w-4">
                    {l === currentLocale ? <Check className="h-4 w-4" /> : null}
                  </span>
                  {LABELS[l]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-xs text-muted-foreground">
                {LABELS[currentLocale]} ({SHORT_LABELS[currentLocale]})
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
