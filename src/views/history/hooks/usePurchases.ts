"use client";

import * as React from "react";
import { listPurchases } from "@/lib/api/purchases";
import { APIPurchase } from "../types";
import { normalizePurchases } from "../utils";
import { dateTime } from "../utils";

export function usePurchases() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<APIPurchase[]>([]);
  const [search, setSearch] = React.useState("");

  const load = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await listPurchases(signal);
      setRows(normalizePurchases(resp));
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [load]);

  const filtered = React.useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((p) =>
      [
        p.id,
        p.cart_name ?? "",
        p.store_name ?? "",
        dateTime(p.completed_at),
        String(p.items_count ?? ""),
        p.total_amount ?? "",
        p.currency ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const removeById = React.useCallback((id: string) => {
    setRows((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    loading,
    error,
    setError,
    rows,
    filtered,
    search,
    setSearch,
    reload: () => load(),
    removeById,
  };
}
