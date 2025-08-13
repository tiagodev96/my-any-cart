"use client";

import * as React from "react";
import Container from "@/components/container";
import ProductsTable from "@/components/products/products-table";
import { ProductRow } from "@/components/products/types";

const STORAGE_KEY = "my-any-cart-products";

export default function CartView() {
  const [items, setItems] = React.useState<ProductRow[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProductRow[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn("[cart] read storage failed:", e);
    }
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("[cart] save storage failed:", e);
    }
  }, [items, mounted]);

  React.useEffect(() => {
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

  return (
    <Container>
      <ProductsTable
        data={items}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Container>
  );
}
