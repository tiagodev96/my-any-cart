"use client";

import React from "react";
import {
  formatMoney,
  getCurrencySymbol,
  POPULAR_CURRENCIES,
} from "@/lib/currency";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "my-any-cart:currency";

type CurrencyContextType = {
  currency: string;
  setCurrency: (c: string) => void;
  format: (v: number) => string;
  symbol: string;
  popularCurrencies: string[];
};

const CurrencyContext = React.createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<string>("EUR");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCurrencyState(saved);
    } catch {}
  }, []);

  const setCurrency = React.useCallback((c: string) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {}
  }, []);

  const value = React.useMemo<CurrencyContextType>(() => {
    return {
      currency,
      setCurrency,
      format: (v: number) => formatMoney(v, currency),
      symbol: getCurrencySymbol(currency),
      popularCurrencies: POPULAR_CURRENCIES,
    };
  }, [currency, setCurrency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = React.useContext(CurrencyContext);
  const t = useTranslations();
  if (!ctx) throw new Error(t("products.errors.useCurrencyError"));
  return ctx;
}
