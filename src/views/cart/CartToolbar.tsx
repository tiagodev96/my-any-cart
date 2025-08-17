"use client";

import * as React from "react";
import SavePurchaseDialog from "./SavePurchaseDialog";
import ClearCartButton from "@/components/products/clear-cart-button";
import { useTranslations } from "next-intl";
import type { ProductRow } from "@/components/products/types";
import { CurrencySelect } from "@/components/currency/CurrencySelect";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { ProductDialog } from "@/components/products/ProductDialog";
import { Plus, ShoppingCart } from "lucide-react";

export default function CartToolbar({
  items,
  onAdd,
  onClear,
  onSaved,
}: {
  items: ProductRow[];
  onAdd: (row: ProductRow) => void;
  onClear: () => void;
  onSaved?: () => void;
}) {
  const t = useTranslations("products");
  const { currency } = useCurrency();

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5" />
            <h1 className="text-xl font-semibold">{t("cart")}</h1>
          </div>
          <CurrencySelect className="pt-1" />
        </div>
        <div className="flex gap-2">
          <ProductDialog
            onSubmit={onAdd}
            trigger={
              <Button type="button" className="hidden sm:inline-flex">
                {t("actions.addProduct")}
              </Button>
            }
          />
          <SavePurchaseDialog
            items={items}
            currency={currency}
            onSaved={onSaved}
          />
          <div className="hidden md:block">
            <ClearCartButton itemsCount={items.length} onClear={onClear} />
          </div>
        </div>
      </div>

      <div className="sm:hidden fixed left-4 bottom-20 z-30">
        <ProductDialog
          onSubmit={onAdd}
          trigger={
            <button
              type="button"
              aria-label={t("actions.addProduct")}
              className="h-10 w-10 rounded-full shadow-lg bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition"
            >
              <Plus className="h-5 w-5" />
            </button>
          }
        />
      </div>
    </>
  );
}
