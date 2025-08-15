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
  const { setOpen, data, loading, error } = usePurchaseDetail();

  React.useEffect(() => {
    setOpen(open);
  }, [open, setOpen]);

  const items = data?.items ?? [];
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
