"use client";

import SavePurchaseDialog from "./SavePurchaseDialog";
import ClearCartButton from "@/components/products/clear-cart-button";
import { useTranslations } from "next-intl";
import type { ProductRow } from "@/components/products/types";

export default function CartToolbar({
  items,
  onClear,
  onSaved,
}: {
  items: ProductRow[];
  onClear: () => void;
  onSaved?: () => void;
}) {
  const t = useTranslations("products");

  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold">{t("cart")}</h1>
      <div className="flex gap-2">
        <SavePurchaseDialog items={items} onSaved={onSaved} />
        <ClearCartButton itemsCount={items.length} onClear={onClear} />
      </div>
    </div>
  );
}
