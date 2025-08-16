import { isAPIPurchase, UnknownRecord } from "./types";

export const money = (n: number, currency = "EUR") =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(n);

export const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

export const dateOnly = (iso: string) =>
  new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
  }).format(new Date(iso));

export function normalizePurchases(resp: unknown) {
  if (Array.isArray(resp)) return resp.filter(isAPIPurchase);
  if (!resp || typeof resp !== "object") return [];
  const r = resp as UnknownRecord;
  if (Array.isArray(r.results))
    return (r.results as unknown[]).filter(isAPIPurchase);
  if (isAPIPurchase(resp)) return [resp];
  return [];
}
