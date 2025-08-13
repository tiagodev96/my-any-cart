"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductRow, CommonStrings } from "./types";
import { ProductDeleteButton } from "./product-delete-button";

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
        onClick={() => onEdit(row)}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <ProductDeleteButton
        row={row}
        onConfirm={onDelete}
        strings={strings}
        mode="icon"
      />
    </div>
  );
}

export default ProductActionsCell;
