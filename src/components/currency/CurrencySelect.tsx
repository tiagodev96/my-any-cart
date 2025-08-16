"use client";

import * as React from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslations } from "next-intl";

type Props = { className?: string };

export function CurrencySelect({ className }: Props) {
  const { currency, setCurrency, popularCurrencies } = useCurrency();
  const t = useTranslations();

  const id = "currency-select";

  return (
    <div className={className}>
      <label htmlFor={id} className="mr-2 font-medium">
        {t("products.saveDialog.currency")}
      </label>

      <select
        id={id}
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="h-9 rounded-md border px-2 text-sm
                   text-black bg-white
                   dark:text-black dark:bg-white
                   focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        {popularCurrencies.map((c) => (
          <option key={c} value={c} className="text-black bg-white">
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
