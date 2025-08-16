import { http } from "@/lib/http";

export type CreatePurchaseProduct = {
  name: string;
  unit_price: string;
  price: string;
  quantity: number;
};

export type CreatePurchasePayload = {
  cart_name: string;
  store_name: string;
  currency: string;
  idempotency_key?: string;
  products: CreatePurchaseProduct[];
};

export async function listPurchases(signal?: AbortSignal) {
  return http<unknown>("/api/purchases/", { auth: true, signal });
}

export async function getPurchase(id: string, signal?: AbortSignal) {
  return http<unknown>(`/api/purchases/${encodeURIComponent(id)}/`, {
    auth: true,
    signal,
  });
}

export async function deletePurchase(id: string): Promise<void> {
  await http<void>(`/api/purchases/${encodeURIComponent(id)}/`, {
    method: "DELETE",
    auth: true,
  });
}

export async function createPurchase(
  payload: CreatePurchasePayload,
  signal?: AbortSignal
) {
  return http<unknown>("/api/purchases/", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
    signal,
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": payload.idempotency_key ?? "",
    },
  });
}
