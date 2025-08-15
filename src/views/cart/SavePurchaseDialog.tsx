"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { http } from "@/lib/http";
import type { ProductRow } from "@/components/products/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

type SavePayload = {
  cart_name: string;
  store_name: string;
  currency: string;
  notes: string;
  tags: string;
  idempotency_key: string;
  products: Array<{
    name: string;
    price: string;
    quantity: number;
  }>;
};

function toPriceString(input: number | string): string {
  const parse = (val: number | string) => {
    if (typeof val === "string") {
      const norm = val.replace(/\s+/g, "").replace(",", ".");
      const n = Number(norm);
      return Number.isFinite(n) ? n : 0;
    }
    return Number.isFinite(val) ? val : 0;
  };
  const n = parse(input);
  const rounded = Math.round((n + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2);
}

export default function SavePurchaseDialog({
  items,
  onSaved,
}: {
  items: ProductRow[];
  onSaved?: () => void;
}) {
  const t = useTranslations("products");
  const [open, setOpen] = React.useState(false);

  const [cartName, setCartName] = React.useState("");
  const [storeName, setStoreName] = React.useState("");
  const [currency, setCurrency] = React.useState("EUR");
  const [notes, setNotes] = React.useState("");
  const [tags, setTags] = React.useState("");

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const productsPayload = React.useMemo<SavePayload["products"]>(
    () =>
      items.map((r) => ({
        name: r.item_name,
        price: toPriceString(r.item_price),
        quantity: Math.max(1, Math.floor(Number(r.item_amount) || 0)),
      })),
    [items]
  );

  const canSubmit = React.useMemo(() => {
    if (saving) return false;
    if (productsPayload.length === 0) return false;
    if (!cartName.trim()) return false;
    if (!storeName.trim()) return false;
    if (!/^[A-Z]{3}$/.test(currency.trim())) return false;
    return true;
  }, [saving, productsPayload.length, cartName, storeName, currency]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError(null);

    const payload: SavePayload = {
      cart_name: cartName.trim(),
      store_name: storeName.trim(),
      currency: currency.trim().toUpperCase(),
      notes,
      tags,
      idempotency_key: crypto.randomUUID(),
      products: productsPayload,
    };

    try {
      await http<unknown>("/api/purchases/", {
        method: "POST",
        auth: true,
        body: JSON.stringify(payload),
      });

      setOpen(false);
      setCartName("");
      setStoreName("");
      setCurrency("EUR");
      setNotes("");
      setTags("");
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" disabled={items.length === 0}>
          {t("actions.save")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("saveDialog.title") ?? "Salvar compra"}</DialogTitle>
          <DialogDescription>
            {t("saveDialog.desc") ??
              "Preencha os dados da compra. Os itens atuais do carrinho serão enviados."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="cart_name">{t("saveDialog.cartName")}</Label>
            <Input
              id="cart_name"
              value={cartName}
              onChange={(e) => setCartName(e.target.value)}
              placeholder="Ex.: Compra do mês"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="store_name">{t("saveDialog.store")}</Label>
            <Input
              id="store_name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ex.: Continente"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="currency">{t("saveDialog.currency")}</Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              placeholder="EUR"
              maxLength={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="mercado, mês, família"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">{t("saveDialog.notes") ?? "Notas"}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações da compra…"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {saving ? t("creating") ?? "Salvando…" : t("actions.save")}
            </Button>
          </DialogFooter>
        </form>

        <div className="rounded-md border p-3 text-xs text-muted-foreground">
          <div className="mb-1 font-medium text-foreground">
            {t("saveDialog.summary") ?? "Resumo"}
          </div>
          <div>
            {t("saveDialog.products") ?? "Produtos"}: {productsPayload.length}
          </div>
          <div>
            {t("saveDialog.currencyLabel") ?? "Moeda"}: {currency || "EUR"}
          </div>
          <div>ID de idempotência: gerado automaticamente</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
