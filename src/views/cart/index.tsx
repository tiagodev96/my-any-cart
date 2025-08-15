"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@/components/container";
import ProductsTable from "@/components/products/products-table";
import { ProductRow } from "@/components/products/types";
import ClearCartButton from "@/components/products/clear-cart-button";
import { useTranslations } from "next-intl";
import { http } from "@/lib/http";

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

const STORAGE_KEY = "my-any-cart-products";

type SavePayload = {
  cart_name: string;
  store_name: string;
  currency: string;
  notes: string;
  tags: string;
  idempotency_key: string;
  products: Array<{
    name: string;
    price: string; // string com exatamente 2 casas decimais
    quantity: number;
  }>;
};

// Garante string com 2 casas (ex.: "3.20"), lidando com floats e vírgula.
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
  // arredonda corretamente para 2 casas
  const rounded = Math.round((n + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2);
}

export default function CartView() {
  const t = useTranslations("products");
  const [items, setItems] = useState<ProductRow[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProductRow[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (e) {
      console.warn("[cart] read storage failed:", e);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("[cart] save storage failed:", e);
    }
  }, [items, mounted]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const raw = e.newValue;
          const next = raw ? (JSON.parse(raw) as ProductRow[]) : [];
          setItems(Array.isArray(next) ? next : []);
        } catch {
          console.warn("[cart] storage event processing failed:", e);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleAdd = (row: ProductRow) => setItems((prev) => [row, ...prev]);
  const handleEdit = (row: ProductRow) =>
    setItems((prev) => prev.map((r) => (r.id === row.id ? row : r)));
  const handleDelete = (row: ProductRow) =>
    setItems((prev) => prev.filter((r) => r.id !== row.id));

  const clearAll = () => {
    setItems([]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {}
  };

  return (
    <Container>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("cart")}</h1>

        <div className="flex gap-2">
          <SavePurchaseDialog items={items} />
          <ClearCartButton itemsCount={items.length} onClear={clearAll} />
        </div>
      </div>

      <ProductsTable
        data={items}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Container>
  );
}

function SavePurchaseDialog({ items }: { items: ProductRow[] }) {
  const t = useTranslations("products");
  const [open, setOpen] = useState(false);

  // Simple form state
  const [cartName, setCartName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const productsPayload = useMemo<SavePayload["products"]>(() => {
    return items.map((r) => ({
      name: r.item_name,
      price: toPriceString(r.item_price),
      quantity: Math.max(1, Math.floor(Number(r.item_amount) || 0)),
    }));
  }, [items]);

  const canSubmit = useMemo(() => {
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
    setSuccess(null);

    const payload: SavePayload = {
      cart_name: cartName.trim(),
      store_name: storeName.trim(),
      currency: currency.trim().toUpperCase(),
      notes,
      tags,
      idempotency_key: crypto.randomUUID(), // Evita duplicados
      products: productsPayload,
    };

    try {
      await http<unknown>("/api/purchases/", {
        method: "POST",
        auth: true,
        body: JSON.stringify(payload),
      });
      setSuccess("Compra salva com sucesso.");
      setCartName("");
      setStoreName("");
      setCurrency("EUR");
      setNotes("");
      setTags("");
      setOpen(false);
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
        if (!v) {
          setError(null);
          setSuccess(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" disabled={items.length === 0}>
          {t("actions.save")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar compra</DialogTitle>
          <DialogDescription>
            Preencha os dados da compra. Os itens atuais do carrinho serão
            enviados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="cart_name">Nome do carrinho</Label>
            <Input
              id="cart_name"
              value={cartName}
              onChange={(e) => setCartName(e.target.value)}
              placeholder="Ex.: Compra do mês"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="store_name">Loja</Label>
            <Input
              id="store_name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ex.: Continente"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="currency">Moeda (ISO 4217)</Label>
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
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(e.target.value)
              }
              placeholder="Observações da compra…"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <p className="text-sm text-green-600 dark:text-green-500">
              {success}
            </p>
          )}

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
          <div className="mb-1 font-medium text-foreground">Resumo</div>
          <div>Produtos: {productsPayload.length}</div>
          <div>Moeda: {currency || "EUR"}</div>
          <div>ID de idempotência: gerado automaticamente</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
