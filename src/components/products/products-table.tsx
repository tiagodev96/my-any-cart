"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { PencilLine, Trash2 } from "lucide-react";
import type { ProductRow } from "./types";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ProductDialog } from "@/components/products/ProductDialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Props = {
  data: ProductRow[];
  onAdd: (row: ProductRow) => void;
  onEdit: (row: ProductRow) => void;
  onDelete: (row: ProductRow) => void;
  onClear: () => void;
  itemsCount: number;
};

export default function ProductsTable({
  data,
  onEdit,
  onDelete,
  onClear,
  itemsCount,
}: Props) {
  const t = useTranslations("products");
  const { currency, format } = useCurrency();

  const [clearOpen, setClearOpen] = React.useState(false);

  const cartTotal = React.useMemo(() => {
    if (!Array.isArray(data)) return 0;
    return data.reduce((sum, item) => {
      const qty = Number(item.item_amount ?? 0);
      const unit = Number(item.item_price ?? 0);
      return sum + qty * unit;
    }, 0);
  }, [data]);

  const columns = React.useMemo<ColumnDef<ProductRow>[]>(() => {
    return [
      { accessorKey: "item_name", header: t("column.item") },
      {
        accessorKey: "item_amount",
        header: t("column.quantity"),
        cell: ({ getValue }) => <span>{getValue<number>()}</span>,
      },
      {
        accessorKey: "item_price",
        header: `${t("column.unitPrice")} (${currency})`,
        cell: ({ getValue }) => (
          <span>{format(Number(getValue<number>()))}</span>
        ),
      },
      {
        id: "total",
        header: `${t("total")} (${currency})`,
        cell: ({ row }) => {
          const qty = Number(row.original.item_amount ?? 0);
          const unit = Number(row.original.item_price ?? 0);
          return <span>{format(qty * unit)}</span>;
        },
      },
      {
        id: "actions",
        header: t("column.actions"),
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <ProductDialog
              trigger={
                <Button variant="outline" size="sm">
                  {t("actions.edit")}
                </Button>
              }
              editing={row.original}
              onSubmit={(updated) => onEdit(updated)}
              onClose={() => {}}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(row.original)}
            >
              {t("actions.delete")}
            </Button>
          </div>
        ),
      },
    ];
  }, [currency, format, t, onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isEmpty = !data || data.length === 0;

  // label do botão mobile (mostra contagem)
  const clearLabel =
    itemsCount > 0
      ? t("clearCart", { count: itemsCount })
      : t("emptyCart");

  return (
    <div className="rounded-md border">
      {isEmpty ? (
        <div className="p-8 text-center">
          <p className="mb-4 text-sm opacity-80">{t("emptyState.text")}</p>
        </div>
      ) : (
        <>
          {/* ===== Mobile (cards) ===== */}
          <div className="block md:hidden p-3 pb-24">
            <ul className="space-y-3">
              {data.map((item) => {
                const qty = Number(item.item_amount ?? 0);
                const unit = Number(item.item_price ?? 0);
                const subtotal = qty * unit;
                return (
                  <li
                    key={item.id}
                    className="w-full rounded-lg border p-3 shadow-sm bg-background"
                  >
                    <p className="w-full truncate font-medium">
                      {item.item_name}
                    </p>

                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="opacity-70">
                        {t("column.quantity")}:
                      </span>
                      <span>{qty}</span>

                      <span className="opacity-70">
                        {t("column.unitPrice")} ({currency}):
                      </span>
                      <span>{format(unit)}</span>

                      <span className="opacity-70">
                        {t("total")} ({currency}):
                      </span>
                      <span className="font-medium">{format(subtotal)}</span>
                    </div>

                    <div className="mt-3 flex w-full justify-end gap-2">
                      <ProductDialog
                        trigger={
                          <Button
                            variant="outline"
                            size="icon"
                            aria-label={t("actions.edit")}
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                        }
                        editing={item}
                        onSubmit={(updated) => onEdit(updated)}
                        onClose={() => {}}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        aria-label={t("actions.delete")}
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Barra fixa inferior (MOBILE) */}
            <div
              className="
                fixed inset-x-0 bottom-0 z-40 md:hidden
                border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60
                py-3 px-4
                [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))]
              "
              role="region"
              aria-label={t("aria.cartTotalBar")}
            >
              <div className="mx-auto flex max-w-screen-sm items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs opacity-70">
                    {t("total")} ({currency})
                  </div>
                  <div className="text-base font-semibold truncate">
                    {format(cartTotal)}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={itemsCount === 0}
                    onClick={() => setClearOpen(true)} // ← abre o diálogo
                    className="whitespace-nowrap"
                    aria-label={t("clearCart")}
                    title={t("clearCart")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {clearLabel}
                  </Button>
                </div>
              </div>
            </div>

            {/* Diálogo de confirmação (MOBILE) */}
            <ConfirmDialog
              open={clearOpen}
              onOpenChange={setClearOpen}
              title="actions.dialog-title"
              description="actions.dialog-description"
              confirmText="actions.confirm"
              cancelText="actions.cancel"
              destructive
              onConfirm={() => {
                onClear();
                setClearOpen(false);
              }}
            />
          </div>

          {/* ===== Desktop (tabela) ===== */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead
                        key={h.id}
                        className={
                          h.column.id === "actions" ? "text-right" : ""
                        }
                      >
                        {h.isPlaceholder
                          ? null
                          : flexRender(
                              h.column.columnDef.header,
                              h.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((r) => (
                  <TableRow key={r.id}>
                    {r.getVisibleCells().map((c) => (
                      <TableCell
                        key={c.id}
                        className={
                          c.column.id === "actions" ? "text-right" : ""
                        }
                      >
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    {t("total")} ({currency})
                  </TableCell>
                  <TableCell className="font-semibold">
                    {format(cartTotal)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
