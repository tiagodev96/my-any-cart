"use client";

import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export type ProductRow = {
  id: string;
  item_name: string;
  item_amount: number;
  item_price: number;
};

type ProductsTableProps = {
  data?: ProductRow[] | null;
  onAdd?: (row: ProductRow) => void;
  onEdit?: (row: ProductRow) => void;
  onDelete?: (row: ProductRow) => void;
  currencyLocale?: string;
};

const eur = (value: number, locale = "pt-PT") =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(
    value
  );

function SortIcon({ state }: { state: false | "asc" | "desc" }) {
  if (state === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
  if (state === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
  return <ArrowUpDown className="ml-2 h-4 w-4" />;
}

export const productsColumns = ({
  onEdit,
  onDelete,
  currencyLocale = "pt-PT",
  t,
}: Pick<ProductsTableProps, "onEdit" | "onDelete" | "currencyLocale"> & {
  t: ReturnType<typeof useTranslations>;
}): ColumnDef<ProductRow>[] => [
  {
    accessorKey: "item_name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 md:px-2"
      >
        {t("column.item")}
        <SortIcon state={column.getIsSorted()} />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue<string>("item_name")}</div>
    ),
  },
  {
    accessorKey: "item_amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 md:px-2"
      >
        {t("column.quantity")}
        <SortIcon state={column.getIsSorted()} />
      </Button>
    ),
    cell: ({ row }) => {
      const qty = row.getValue<number>("item_amount");
      return <div className="tabular-nums">{qty}</div>;
    },
  },
  {
    accessorKey: "item_price",
    header: ({ column }) => (
      <div className="flex w-full items-center justify-end">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-auto px-0 md:px-2"
        >
          {t("column.unitPrice")}
          <SortIcon state={column.getIsSorted()} />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const price = Number(row.getValue<number>("item_price"));
      return (
        <div className="text-right tabular-nums">
          {eur(price, currencyLocale)}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    enableSorting: false,
    header: () => <div className="text-right">{t("column.actions")}</div>,
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit?.(record)}
            className="gap-1"
          >
            <Pencil className="h-4 w-4" />
            {t("actions.edit")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete?.(record)}
            className="ml-2 gap-1"
          >
            <Trash2 className="h-4 w-4" />
            {t("actions.delete")}
          </Button>
        </div>
      );
    },
  },
];

export default function ProductsTable({
  data,
  onAdd,
  onEdit,
  onDelete,
  currencyLocale = "pt-PT",
}: ProductsTableProps) {
  const t = useTranslations("products");

  const safeData = React.useMemo(
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

  // dialog state (Add/Edit compartilhado)
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

  // agora os handlers já existem -> seguro usar no memo abaixo
  const columns = React.useMemo(
    () =>
      productsColumns({
        onEdit: handleStartEdit,
        onDelete: handleDelete,
        currencyLocale,
        t,
      }),
    [handleStartEdit, handleDelete, currencyLocale, t]
  );

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

  // Form compartilhado do Dialog (sem criar novas chaves além das fornecidas)
  const DialogForm = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="item_name">{t("column.item")}</Label>
        <Input
          id="item_name"
          value={form.item_name}
          onChange={(e) =>
            setForm((s) => ({ ...s, item_name: e.target.value }))
          }
          // Mantive o placeholder como estático para respeitar seu conjunto de keys
          placeholder="e.g. Leite Meio-Gordo (1L)"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="item_amount">{t("column.quantity")}</Label>
          <Input
            id="item_amount"
            type="number"
            min={0}
            step={1}
            value={form.item_amount}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                item_amount: Number(e.target.value),
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="item_price">
            {/* Usa a key existente + sufixo da moeda */}
            {t("column.unitPrice")} (EUR)
          </Label>
          <Input
            id="item_price"
            type="number"
            min={0}
            step="0.01"
            value={form.item_price}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                item_price: Number(e.target.value),
              }))
            }
            required
          />
        </div>
      </div>
      <DialogFooter className="gap-2 sm:gap-0">
        <DialogClose asChild>
          <Button
            variant="outline"
            type="button"
            onClick={() => setEditing(null)}
          >
            {t("actions.cancel")}
          </Button>
        </DialogClose>
        <Button type="submit" className="gap-1">
          {editing ? (
            t("actions.save")
          ) : (
            <>
              <Plus className="h-4 w-4" /> {t("actions.addProduct")}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );

  // Empty state
  if (safeData.length === 0) {
    return (
      <div className="w-full rounded-md border p-6 text-center text-sm text-muted-foreground md:p-10">
        <div className="mb-3">{t("emptyState.text")}</div>
        <Dialog open={open} onOpenChange={setOpen}>
          <Button size="sm" className="gap-1" onClick={handleStartAdd}>
            <Plus className="h-4 w-4" />
            {t("actions.addProduct")}
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? t("actions.edit") : t("actions.addProduct")}
              </DialogTitle>
            </DialogHeader>
            {DialogForm}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:py-4">
        <Input
          placeholder={t("searchPlaceholder")}
          value={
            (table.getColumn("item_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn("item_name")?.setFilterValue(e.target.value)
          }
          className="max-w-full md:max-w-sm"
        />
        <div className="md:ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full gap-1 md:w-auto"
                onClick={handleStartAdd}
              >
                <Plus className="h-4 w-4" />
                {t("actions.addProduct")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? t("actions.edit") : t("actions.addProduct")}
                </DialogTitle>
              </DialogHeader>
              {DialogForm}
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                    {/* Sem novas keys: reutilizo as colunas para rotular */}
                    {t("column.quantity")}:{" "}
                    <span className="tabular-nums">{r.item_amount}</span> •{" "}
                    {t("column.unitPrice")}:{" "}
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStartEdit(r)}
                  className="gap-1"
                >
                  <Pencil className="h-4 w-4" />
                  {t("actions.edit")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(r)}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("actions.delete")}
                </Button>
              </div>
            </div>
          );
        })}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>{t("total")}</span>
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
                      {t("total")}
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
                    {/* Sem key 'noResults' fornecida: reutilizo a mensagem do empty state */}
                    {t("emptyState.text")}
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
