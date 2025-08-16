"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { APIPurchase } from "../types";
import { money, dateOnly } from "../utils";
import {
  Eye,
  Trash2,
  Store,
  CalendarDays,
  ShoppingBasket,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  data: APIPurchase[];
  loading: boolean;
  error: string | null;
  onDetail: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function PurchasesTable({
  data,
  loading,
  error,
  onDetail,
  onDelete,
}: Props) {
  const t = useTranslations();

  if (loading) {
    return (
      <div className="rounded-md border p-6 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-md border p-6 text-center text-destructive">
        {error}
      </div>
    );
  }
  if (!data.length) {
    return (
      <div className="rounded-md border p-6 text-center text-muted-foreground">
        {t("history.empty")}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:hidden">
        {data.map((p) => {
          const total = money(Number(p.total_amount ?? 0), p.currency ?? "EUR");
          const itemsCount =
            typeof p.items_count === "number" ? p.items_count : undefined;

          return (
            <div
              key={p.id}
              role="button"
              onClick={() => onDetail(p.id)}
              className={cn(
                "group rounded-lg border bg-card p-3 transition hover:bg-accent/40",
                "overflow-hidden"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">
                    {p.store_name ?? "—"}
                  </span>
                </div>
                {itemsCount !== undefined && (
                  <Badge variant="secondary" className="shrink-0">
                    {itemsCount} {t("history.badge.items")}
                  </Badge>
                )}
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span className="truncate">{dateOnly(p.completed_at)}</span>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">
                      {t("history.table.total")}
                    </div>
                    <div className="font-semibold tabular-nums">{total}</div>
                  </div>
                  <ChevronRight className="hidden min-[380px]:block h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5" />
                </div>

                <div className="flex flex-col gap-2 min-[380px]:flex-row">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full min-[380px]:w-auto gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetail(p.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    {t("history.actions.details")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full min-[380px]:w-auto gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(p.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("history.actions.delete")}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">
                {t("history.table.store")}
              </TableHead>
              <TableHead className="w-[20%]">
                {t("history.table.date")}
              </TableHead>
              <TableHead className="w-[10%] text-right">
                {t("history.table.items")}
              </TableHead>
              <TableHead className="w-[15%] text-right">
                {t("history.table.total")}
              </TableHead>
              <TableHead className="w-[15%] text-right">
                {t("history.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p) => (
              <TableRow key={p.id} className="hover:bg-muted/40">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ShoppingBasket className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{p.store_name ?? "—"}</span>
                    {typeof p.items_count === "number" && (
                      <Badge variant="secondary">
                        {p.items_count} {t("history.badge.items")}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{dateOnly(p.completed_at)}</TableCell>
                <TableCell className="text-right">
                  {p.items_count ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  {money(Number(p.total_amount ?? 0), p.currency ?? "EUR")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-2">
                    <Button size="sm" onClick={() => onDetail(p.id)}>
                      {t("history.actions.details")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(p.id)}
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
    </>
  );
}
