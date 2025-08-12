import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en", "fr", "es"] as const,
  defaultLocale: "pt",
  localePrefix: "always",
});

export const locales = routing.locales;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = routing.defaultLocale;
