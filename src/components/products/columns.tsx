"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eur } from "./currency";
import { ProductRow, CommonStrings } from "./types";
import { ProductActionsCell } from "./product-actions-cell";

function SortIcon({ state }: { state: false | "asc" | "desc" }) {
  if (state === "asc") return <ArrowUp className="ml-2 h-4 w-4" />;
  if (state === "desc") return <ArrowDown className="ml-2 h-4 w-4" />;
  return <ArrowUpDown className="ml-2 h-4 w-4" />;
}

export function productsColumns({
  onEdit,
  onDelete,
  currencyLocale = "pt-PT",
  strings,
}: {
  onEdit?: (r: ProductRow) => void;
  onDelete?: (r: ProductRow) => void;
  currencyLocale?: string;
  strings: CommonStrings;
}): ColumnDef<ProductRow>[] {
  return [
    {
      accessorKey: "item_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 md:px-2"
        >
          {strings.item}
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
          {strings.quantity}
          <SortIcon state={column.getIsSorted()} />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="tabular-nums">
          {row.getValue<number>("item_amount")}
        </div>
      ),
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
            {strings.unitPrice}
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
      header: () => <div className="text-right">{strings.actions}</div>,
      cell: ({ row }) => (
        <ProductActionsCell
          row={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          strings={strings}
        />
      ),
    },
  ];
}
