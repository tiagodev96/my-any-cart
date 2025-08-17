"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductRow, CommonStrings } from "./types";

export function ProductActionsCell({
  row,
  onEdit,
  onDelete,
  strings,
}: {
  row: ProductRow;
  onEdit: (row: ProductRow) => void;
  onDelete: (row: ProductRow) => void;
  strings: CommonStrings;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={strings.edit}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(row);
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label={strings.delete}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(row);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default ProductActionsCell;
