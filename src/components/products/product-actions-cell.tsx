"use client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { ProductRow, CommonStrings } from "./types";

export function ProductActionsCell({
  row,
  onEdit,
  onDelete,
  strings,
}: {
  row: ProductRow;
  onEdit?: (r: ProductRow) => void;
  onDelete?: (r: ProductRow) => void;
  strings: CommonStrings;
}) {
  return (
    <div className="flex justify-end">
      <Button variant="secondary" size="sm" onClick={() => onEdit?.(row)} className="gap-1">
        <Pencil className="h-4 w-4" />
        {strings.edit}
      </Button>
      <Button variant="destructive" size="sm" onClick={() => onDelete?.(row)} className="ml-2 gap-1">
        <Trash2 className="h-4 w-4" />
        {strings.delete}
      </Button>
    </div>
  );
}
