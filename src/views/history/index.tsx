"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { http } from "@/lib/http";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ReloadIcon } from "@radix-ui/react-icons";

// --- Types (API shape A: id/created/total/items_count) ---
type PurchaseItem = {
  id: number;
  item_name: string;
  item_amount: number;
  item_price: number;
  subtotal?: number;
};

type Purchase = {
  id: number;
  store_name?: string | null;
  created_at: string;
  total: number;
  items_count?: number;
};

type PurchaseDetail = Purchase & { items: PurchaseItem[] };

// --- Local formatters ---
const money = (n: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
    n
  );

const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

// --- Type guards / normalizers (no 'any') ---
type UnknownRecord = Record<string, unknown>;

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function isPurchase(v: unknown): v is Purchase {
  if (!isRecord(v)) return false;
  const idOk = typeof v.id === "number";
  const createdOk = typeof v.created_at === "string";
  const totalOk = typeof v.total === "number";
  return idOk && createdOk && totalOk;
}

function normalizePurchases(resp: unknown): Purchase[] {
  if (Array.isArray(resp)) return resp.filter(isPurchase);
  if (!isRecord(resp)) return [];
  if ("results" in resp && Array.isArray((resp as UnknownRecord).results)) {
    const resultsUnknown = (resp as UnknownRecord).results as unknown[];
    return resultsUnknown.filter(isPurchase);
  }
  if (isPurchase(resp)) return [resp];
  return [];
}

export default function HistoryView() {
  const t = useTranslations();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<Purchase[]>([]);
  const [search, setSearch] = React.useState("");

  const [openDetail, setOpenDetail] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  // Always return an array for rendering safety
  const filtered = React.useMemo<Purchase[]>(() => {
    const list = Array.isArray(rows) ? rows : [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((p) =>
      [
        String(p.id),
        p.store_name ?? "",
        dateTime(p.created_at),
        String(p.items_count ?? ""),
        String(p.total ?? ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  // Fetch purchases (abortable)
  const load = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await http<unknown>("/api/purchases/", {
        auth: true,
        signal,
      });
      setRows(normalizePurchases(resp));
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return; // ignore aborts
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

  const handleOpenDetail = React.useCallback((id: number) => {
    setSelectedId(id);
    setOpenDetail(true);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("history.title")}</CardTitle>
          <CardDescription>{t("history.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-1">
              <Label htmlFor="search">{t("history.search.label")}</Label>
              <Input
                id="search"
                placeholder={t("history.search.placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-80"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => load()}
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <ReloadIcon className="h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </span>
                ) : (
                  t("history.actions.refresh")
                )}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>{t("history.table.store")}</TableHead>
                  <TableHead>{t("history.table.date")}</TableHead>
                  <TableHead className="text-right">
                    {t("history.table.items")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("history.table.total")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("history.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                )}

                {!loading && error && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                )}

                {!loading && !error && filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-muted-foreground"
                    >
                      {t("history.empty")}
                    </TableCell>
                  </TableRow>
                )}

                {/* Extra guard: always iterate over an array */}
                {!loading &&
                  !error &&
                  (Array.isArray(filtered) ? filtered : []).map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-sm">
                        #{p.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {p.store_name ?? "—"}
                          </span>
                          {typeof p.items_count === "number" && (
                            <Badge variant="secondary">
                              {p.items_count} {t("history.badge.items")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{dateTime(p.created_at)}</TableCell>
                      <TableCell className="text-right">
                        {p.items_count ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {money(p.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleOpenDetail(p.id)}
                        >
                          {t("history.actions.details")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          <PurchaseDetailSheet
            open={openDetail}
            onOpenChange={setOpenDetail}
            id={selectedId}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PurchaseDetailSheet({
  open,
  onOpenChange,
  id,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  id: number | null;
}) {
  const t = useTranslations();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<PurchaseDetail | null>(null);

  React.useEffect(() => {
    if (!open || !id) return;

    // Abort fetch on close/unmount
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const detail = await http<PurchaseDetail>(`/api/purchases/${id}/`, {
          auth: true,
          signal: ctrl.signal,
        });
        setData(detail);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [open, id]);

  // Derive total if backend doesn't include subtotals
  const computedTotal =
    data?.items?.reduce(
      (acc, it) => acc + (it.subtotal ?? it.item_amount * it.item_price),
      0
    ) ?? 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {t("history.detail.title")} {id ? `#${id}` : ""}
          </SheetTitle>
        </SheetHeader>

        {!id && (
          <p className="mt-4 text-muted-foreground">
            {t("history.detail.none")}
          </p>
        )}
        {loading && (
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        )}
        {error && <p className="mt-4 text-destructive">{error}</p>}

        {!loading && !error && data && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {t("history.detail.date.label")}
                </div>
                <div className="font-medium">{dateTime(data.created_at)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {t("history.detail.store.label")}
                </div>
                <div className="font-medium">{data.store_name ?? "—"}</div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-sm text-muted-foreground">
                  {t("history.detail.total.label")}
                </div>
                <div className="font-semibold">
                  {money(
                    typeof data.total === "number" ? data.total : computedTotal
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("history.detail.table.product")}</TableHead>
                    <TableHead className="text-right">
                      {t("history.detail.table.qty")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("history.detail.table.unit")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("history.detail.table.subtotal")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-6 text-center text-muted-foreground"
                      >
                        {t("history.detail.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                  {data.items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="flex items-center gap-2 font-medium">
                        {it.item_name}
                        {typeof it.subtotal === "number" && (
                          <Badge
                            variant="secondary"
                            className="hidden sm:inline-flex"
                          >
                            {money(it.subtotal)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums text-right">
                        {it.item_amount}
                      </TableCell>
                      <TableCell className="text-right">
                        {money(it.item_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {money(it.subtotal ?? it.item_amount * it.item_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
