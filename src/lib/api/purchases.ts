import { http } from "@/lib/http";

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
