"use client";

import { useEffect, useState } from "react";
import type { ProductRow } from "@/components/products/types";

const STORAGE_KEY = "my-any-cart-products";

export function useCartItems() {
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
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* noop */
    }
  }, [items, mounted]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        const next = e.newValue ? (JSON.parse(e.newValue) as ProductRow[]) : [];
        setItems(Array.isArray(next) ? next : []);
      } catch {
        /* noop */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = (row: ProductRow) => setItems((prev) => [row, ...prev]);
  const editItem = (row: ProductRow) =>
    setItems((prev) => prev.map((r) => (r.id === row.id ? row : r)));
  const deleteItem = (row: ProductRow) =>
    setItems((prev) => prev.filter((r) => r.id !== row.id));
  const clear = () => {
    setItems([]);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch {
      /* noop */
    }
  };

  return { items, addItem, editItem, deleteItem, clear };
}
