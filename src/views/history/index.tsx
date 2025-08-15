"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  listPurchases,
  getPurchase,
  deletePurchase,
} from "@/lib/api/purchases";

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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ReloadIcon } from "@radix-ui/react-icons";

// --------------------
// Types (API shape B)
// --------------------
type APIPurchaseItem = {
  name: string;
  unit_price: string;
  quantity: number;
  created_at: string;
};

type APIPurchase = {
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

// --------------------
// Formatters
// --------------------
const money = (n: number, currency = "EUR") =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(n);

const dateTime = (iso: string) =>
  new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

// --------------------
// Type guards / normalize
// --------------------
type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null;

function isAPIPurchase(v: unknown): v is APIPurchase {
  if (!isRecord(v)) return false;
  return (
    typeof v.id === "string" &&
    typeof v.completed_at === "string" &&
    typeof v.total_amount === "string"
  );
}

function normalizePurchases(resp: unknown): APIPurchase[] {
  if (Array.isArray(resp)) return resp.filter(isAPIPurchase);
  if (!isRecord(resp)) return [];
  if (Array.isArray(resp.results)) {
    return (resp.results as unknown[]).filter(isAPIPurchase);
  }
  if (isAPIPurchase(resp)) return [resp];
  return [];
}

export default function HistoryView() {
  const t = useTranslations();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState<APIPurchase[]>([]);
  const [search, setSearch] = React.useState("");

  const [openDetail, setOpenDetail] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Delete dialog state
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const filtered = React.useMemo<APIPurchase[]>(() => {
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

  // Fetch purchases (abortable)
  const load = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await listPurchases(signal);
      setRows(normalizePurchases(resp));
    } catch (e) {
      if (e instanceof Error && (e as Error).name === "AbortError") return;
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

  const handleOpenDetail = React.useCallback((id: string) => {
    setSelectedId(id);
    setOpenDetail(true);
  }, []);

  // Delete flow
  const askDelete = React.useCallback((id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  }, []);

  const doDelete = React.useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);
    try {
      await deletePurchase(deleteId);
      // fecha dialog
      setConfirmOpen(false);
      // fecha sheet se for o mesmo id
      if (selectedId === deleteId) {
        setOpenDetail(false);
        setSelectedId(null);
      }
      // remove da lista local (feedback instantâneo)
      setRows((prev) => prev.filter((p) => p.id !== deleteId));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }, [deleteId, selectedId]);

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
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                )}

                {!loading && error && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-6 text-center text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                )}

                {!loading && !error && filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      {t("history.empty")}
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  !error &&
                  filtered.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/40">
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
                      <TableCell>{dateTime(p.completed_at)}</TableCell>
                      <TableCell className="text-right">
                        {p.items_count ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {money(Number(p.total_amount), p.currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOpenDetail(p.id)}
                          >
                            {t("history.actions.details")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => askDelete(p.id)}
                          >
                            {t("history.actions.delete")}
                          </Button>
                        </div>
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

      {/* Confirm delete dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("history.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("history.delete.desc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? t("common.loading") : t("history.delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  id: string | null;
}) {
  const t = useTranslations();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<APIPurchase | null>(null);

  React.useEffect(() => {
    if (!open || !id) return;
    const ctrl = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const detail = await getPurchase(id, ctrl.signal);
        if (isAPIPurchase(detail)) {
          setData(detail);
        } else {
          throw new Error("Resposta inesperada do servidor.");
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [open, id]);

  const items: APIPurchaseItem[] = data?.items ?? [];
  const computedTotal = items.reduce(
    (acc, it) => acc + Number(it.unit_price) * it.quantity,
    0
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl px-4">
        <SheetHeader>
          <SheetTitle>
            {t("history.detail.title")} - {data?.cart_name} -{" "}
            {data?.completed_at
              ? new Date(data.completed_at).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : ""}
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
                <div className="font-medium">{dateTime(data.completed_at)}</div>
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
                    Number(data.total_amount ?? computedTotal),
                    data.currency ?? "EUR"
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
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-6 text-center text-muted-foreground"
                      >
                        {t("history.detail.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                  {items.map((it, idx) => {
                    const unit = Number(it.unit_price);
                    const sub = unit * it.quantity;
                    return (
                      <TableRow key={`${it.name}-${it.created_at}-${idx}`}>
                        <TableCell className="flex items-center gap-2 font-medium">
                          {it.name}
                          <Badge
                            variant="secondary"
                            className="hidden sm:inline-flex"
                          >
                            {money(sub, data.currency)}
                          </Badge>
                        </TableCell>
                        <TableCell className="tabular-nums text-right">
                          {it.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {money(unit, data.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          {money(sub, data.currency)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
