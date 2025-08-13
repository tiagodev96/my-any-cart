"use client";

import { useEffect, useState } from "react";
import Container from "@/components/container";
import ProductsTable from "@/components/products/products-table";
import { ProductRow } from "@/components/products/types";
import ClearCartButton from "@/components/products/clear-cart-button";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "my-any-cart-products";

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
        <ClearCartButton itemsCount={items.length} onClear={clearAll} />
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
