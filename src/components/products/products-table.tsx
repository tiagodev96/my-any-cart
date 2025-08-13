"use client";

import React, { useMemo } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

import { eur } from "./currency";
import { productsColumns } from "./columns";
import { ProductDialogForm } from "./product-dialog-form";
import { ProductsToolbar } from "./products-toolbar";
import { ProductActionsCell } from "./product-actions-cell";
import type { ProductRow, CommonStrings } from "./types";

export type ProductsTableProps = {
  data?: ProductRow[] | null;
  onAdd?: (row: ProductRow) => void;
  onEdit?: (row: ProductRow) => void;
  onDelete?: (row: ProductRow) => void;
  currencyLocale?: string;
};

export default function ProductsTable({
  data,
  onAdd,
  onEdit,
  onDelete,
  currencyLocale = "pt-PT",
}: ProductsTableProps) {
  const t = useTranslations("products");

  const strings: CommonStrings = useMemo(() => ({
    item: t("column.item"),
    quantity: t("column.quantity"),
    unitPrice: t("column.unitPrice"),
    actions: t("column.actions"),
    edit: t("actions.edit"),
    delete: t("actions.delete"),
    addProduct: t("actions.addProduct"),
    cancel: t("actions.cancel"),
    save: t("actions.save"),
    total: t("total"),
    emptyText: t("emptyState.text"),
    searchPlaceholder: t("searchPlaceholder"),
  }), [t]);

  const safeData = React.useMemo<ProductRow[]>(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  // table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // dialog/form state
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductRow | null>(null);
  const [form, setForm] = React.useState({
    item_name: "",
    item_amount: 1,
    item_price: 0,
  });

  const resetForm = React.useCallback(
    () => setForm({ item_name: "", item_amount: 1, item_price: 0 }),
    []
  );

  const handleStartAdd = React.useCallback(() => {
    setEditing(null);
    resetForm();
    setOpen(true);
  }, [resetForm]);

  const handleStartEdit = React.useCallback((row: ProductRow) => {
    setEditing(row);
    setForm({
      item_name: row.item_name,
      item_amount: row.item_amount,
      item_price: row.item_price,
    });
    setOpen(true);
  }, []);

  const handleDelete = React.useCallback(
    (row: ProductRow) => {
      onDelete?.(row);
    },
    [onDelete]
  );

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.item_name.trim()) return;

      if (editing) {
        const updated: ProductRow = {
          ...editing,
          item_name: form.item_name.trim(),
          item_amount: Number(form.item_amount) || 0,
          item_price: Number(form.item_price) || 0,
        };
        onEdit?.(updated);
      } else {
        const newRow: ProductRow = {
          id:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : String(Date.now()),
          item_name: form.item_name.trim(),
          item_amount: Number(form.item_amount) || 0,
          item_price: Number(form.item_price) || 0,
        };
        onAdd?.(newRow);
      }

      setOpen(false);
      setEditing(null);
      resetForm();
    },
    [
      editing,
      form.item_amount,
      form.item_name,
      form.item_price,
      onAdd,
      onEdit,
      resetForm,
    ]
  );

  // columns
  const columns = React.useMemo<ColumnDef<ProductRow>[]>(
    () =>
      productsColumns({
        onEdit: handleStartEdit,
        onDelete: handleDelete,
        currencyLocale,
        strings,
      }),
    [handleStartEdit, handleDelete, currencyLocale, strings]
  );

  // table instance
  const table = useReactTable({
    data: safeData,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const grandTotal = React.useMemo(
    () => safeData.reduce((sum, r) => sum + r.item_amount * r.item_price, 0),
    [safeData]
  );

  const dialogTitle = editing ? strings.edit : strings.addProduct;
  const dialogForm = (
    <ProductDialogForm
      editing={editing}
      form={form}
      setForm={setForm}
      onSubmit={handleSubmit}
      onCancel={() => {
        setEditing(null);
        setOpen(false);
      }}
      strings={strings}
    />
  );

  // Empty state
  if (safeData.length === 0) {
    return (
      <div className="w-full rounded-md border p-6 text-center text-sm text-muted-foreground md:p-10">
        <div className="mb-3">{strings.emptyText}</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" onClick={handleStartAdd}>
              <Plus className="h-4 w-4" />
              {strings.addProduct}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            {dialogForm}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <ProductsToolbar
        table={table}
        open={open}
        setOpen={setOpen}
        onStartAdd={handleStartAdd}
        dialogTitle={dialogTitle}
        dialogForm={dialogForm}
        strings={strings}
      />

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {table.getRowModel().rows.map((row) => {
          const r = row.original;
          const total = r.item_amount * r.item_price;
          return (
            <div key={row.id} className="rounded-lg border p-4 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold">
                    {r.item_name}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {strings.quantity}:{" "}
                    <span className="tabular-nums">{r.item_amount}</span> •{" "}
                    {strings.unitPrice}:{" "}
                    <span className="tabular-nums">
                      {eur(r.item_price, currencyLocale)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm font-medium">
                  {eur(total, currencyLocale)}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <ProductActionsCell
                  row={r}
                  onEdit={handleStartEdit}
                  onDelete={handleDelete}
                  strings={strings}
                />
              </div>
            </div>
          );
        })}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>{strings.total}</span>
            <span className="tabular-nums">
              {eur(grandTotal, currencyLocale)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      {strings.total}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {eur(grandTotal, currencyLocale)}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getAllColumns().length}
                    className="h-24 text-center"
                  >
                    {strings.emptyText}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
