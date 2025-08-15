import * as React from "react";
import { getPurchase } from "@/lib/api/purchases";

type Item = { name: string; unit_price: string; quantity: number; created_at: string };
type APIPurchase = {
  id: string;
  cart_name: string;
  completed_at: string;
  store_name: string | null;
  currency: string;
  total_amount?: string;
  items?: Item[];
};

export function usePurchaseDetail() {
  const [open, setOpen] = React.useState(false);
  const [id, setId] = React.useState<string | null>(null);
  const [data, setData] = React.useState<APIPurchase | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !id) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await getPurchase(id, ctrl.signal);
        setData(detail as APIPurchase);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [open, id]);

  return { setOpen, setId, data, loading, error };
}
