"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePurchaseDetail } from "../hooks/usePurchaseDetail";
import { money, dateTime } from "../utils";

type Props = {
  open: boolean;
  id: string | null;
  onOpenChange: (v: boolean) => void;
};

export default function PurchaseDetailSheet({ open, id, onOpenChange }: Props) {
  const t = useTranslations();
  const { setOpen, setId, data, loading, error } = usePurchaseDetail();

  React.useEffect(() => {
    setOpen(open);
    setId(id ?? null);
    return () => setId(null);
  }, [open, id, setOpen, setId]);

  const items = data?.items ?? [];
  const computedTotal = items.reduce(
    (acc, it) => acc + Number(it.unit_price) * it.quantity,
    0
  );
  const totalValue = Number(data?.total_amount ?? computedTotal);
  const currency = data?.currency ?? "EUR";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl flex h-full max-h-[100dvh] flex-col px-4">
        <SheetHeader className="shrink-0">
          <SheetTitle>
            {t("history.detail.title")} - {data?.cart_name}{" "}
            {data?.completed_at
              ? `- ${new Date(data.completed_at).toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}`
              : ""}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pt-4 pb-8">
          {!id && (
            <p className="text-muted-foreground">{t("history.detail.none")}</p>
          )}
          {loading && (
            <p className="text-muted-foreground">{t("common.loading")}</p>
          )}
          {error && <p className="text-destructive">{error}</p>}

          {!loading && !error && data && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {t("history.detail.date.label")}
                  </div>
                  <div className="font-medium">
                    {dateTime(data.completed_at)}
                  </div>
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
                  <div className="font-semibold tabular-nums">
                    {money(totalValue, currency)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="sm:hidden">
                {items.length === 0 ? (
                  <p className="py-6 text-center text-muted-foreground">
                    {t("history.detail.empty")}
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {items.map((it, idx) => {
                      const unit = Number(it.unit_price);
                      const sub = unit * it.quantity;
                      return (
                        <div
                          key={`${it.name}-${it.created_at}-${idx}`}
                          className="rounded-md border bg-card p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs text-muted-foreground">
                                {t("history.detail.table.product")}
                              </div>
                              <div className="truncate font-medium">
                                {it.name}
                              </div>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {money(sub, currency)}
                            </Badge>
                          </div>

                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="min-w-0">
                              <div className="text-xs text-muted-foreground">
                                {t("history.detail.table.qty")}
                              </div>
                              <div className="tabular-nums">{it.quantity}</div>
                            </div>
                            <div className="min-w-0 text-right">
                              <div className="text-xs text-muted-foreground">
                                {t("history.detail.table.unit")}
                              </div>
                              <div className="tabular-nums">
                                {money(unit, currency)}
                              </div>
                            </div>
                            <div className="min-w-0 text-right">
                              <div className="text-xs text-muted-foreground">
                                {t("history.detail.table.subtotal")}
                              </div>
                              <div className="font-medium tabular-nums">
                                {money(sub, currency)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="hidden sm:block rounded-md border">
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
                              {money(sub, currency)}
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular-nums text-right">
                            {it.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {money(unit, currency)}
                          </TableCell>
                          <TableCell className="text-right">
                            {money(sub, currency)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
