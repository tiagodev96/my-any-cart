"use client";

import * as React from "react";
import { getPurchase } from "@/lib/api/purchases";
import { APIPurchase } from "../types";
import { isAPIPurchase } from "../types";

export function usePurchaseDetail() {
  const [open, setOpen] = React.useState(false);
  const [id, setId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<APIPurchase | null>(null);

  const openWith = React.useCallback((purchaseId: string) => {
    setId(purchaseId);
    setOpen(true);
  }, []);

  React.useEffect(() => {
    if (!open || !id) return;
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const detail = await getPurchase(id, ctrl.signal);
        if (isAPIPurchase(detail)) setData(detail);
        else throw new Error("Resposta inesperada do servidor.");
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [open, id]);

  const close = React.useCallback(() => setOpen(false), []);

  return { open, setOpen, id, data, loading, error, openWith, close };
}
