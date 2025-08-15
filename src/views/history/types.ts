export type APIPurchaseItem = {
  name: string;
  unit_price: string;
  quantity: number;
  created_at: string;
};

export type APIPurchase = {
  id: string;
  cart_name: string;
  completed_at: string;
  store_name: string | null;
  currency: string;
  notes: string;
  tags: string[] | null;
  items_count: number;
  total_amount: string;
  idempotency_key: string | null;
  items?: APIPurchaseItem[];
};

export type UnknownRecord = Record<string, unknown>;
export const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null;

export function isAPIPurchase(v: unknown): v is APIPurchase {
  if (!isRecord(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.completed_at === "string" &&
    typeof v.total_amount === "string"
  );
}
