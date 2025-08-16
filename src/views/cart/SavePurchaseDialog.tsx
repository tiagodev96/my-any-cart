"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ProductRow } from "@/components/products/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

type Props = {
  items: ProductRow[];
  currency: string;
  onSaved?: () => void;
};

export default function SavePurchaseDialog({
  items,
  currency,
  onSaved,
}: Props) {
  const t = useTranslations("products");
  const [open, setOpen] = React.useState(false);
  const [cartName, setCartName] = React.useState("");
  const [storeName, setStoreName] = React.useState("");

  async function handleSave() {
    const payload = {
      cart_name: cartName || "Compra",
      store_name: storeName || "",
      currency,
      items: items.map((i) => ({
        name: i.item_name,
        unit_price: String(i.item_price),
        quantity: Number(i.item_amount),
      })),
    };

    const res = await fetch("/api/carts/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return;
    }

    setOpen(false);
    onSaved?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">{t("actions.save")}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("actions.save")}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cart_name">{t("saveDialog.cartName")}</Label>
            <Input
              id="cart_name"
              value={cartName}
              onChange={(e) => setCartName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="store_name">{t("saveDialog.storeName")}</Label>
            <Input
              id="store_name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">{t("saveDialog.currency")}</Label>
            <Input id="currency" value={currency} readOnly />
          </div>

          <div className="pt-1 flex justify-end">
            <Button onClick={handleSave}>{t("actions.confirm")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
