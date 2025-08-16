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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createPurchase } from "@/lib/api/purchases";
import { toast } from "sonner"; // ⬅️ novo

type Props = {
  items: ProductRow[];
  currency: string;
  onSaved?: () => void;
};

function makeIdempotencyKey() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function SavePurchaseDialog({
  items,
  currency,
  onSaved,
}: Props) {
  const t = useTranslations("products");
  const [open, setOpen] = React.useState(false);
  const [cartName, setCartName] = React.useState("");
  const [storeName, setStoreName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const isDisabled = items.length === 0 || saving;

  async function handleSave() {
    if (items.length === 0 || saving) return;

    setSaving(true);
    try {
      const products = items.map((i) => {
        const unit = Number(i.item_price) || 0;
        const qty = Number(i.item_amount) || 0;
        const subtotal = unit * qty;
        return {
          name: i.item_name,
          unit_price: String(unit),
          price: String(subtotal),
          quantity: qty,
        };
      });

      const payload = {
        cart_name: cartName || "Compra",
        store_name: storeName || "",
        currency,
        idempotency_key: makeIdempotencyKey(),
        products,
      };

      await createPurchase(payload);

      toast.success(t("saveDialog.toastPurchaseSuccess"));

      setOpen(false);
      onSaved?.();
    } catch (err: unknown) {
      console.error(err);
      toast.error(t("toastPurchaseError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="default"
                disabled={isDisabled}
                aria-disabled={isDisabled}
              >
                {saving ? t("creating") : t("actions.save")}
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          {items.length === 0 && (
            <TooltipContent>{t("saveDialog.tooltip")}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

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
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="store_name">{t("saveDialog.storeName")}</Label>
            <Input
              id="store_name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="pt-1 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isDisabled}
              aria-disabled={isDisabled}
            >
              {t("actions.confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
