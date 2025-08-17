"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ProductRow, CommonStrings } from "./types";
import { useTranslations } from "next-intl";

type Props = {
  row: ProductRow;
  onConfirm: (row: ProductRow) => void;
  strings: CommonStrings;
  mode?: "icon" | "default";
};

export function ProductDeleteButton({
  row,
  onConfirm,
  strings,
  mode = "icon",
}: Props) {
  const t = useTranslations("products");
  const [open, setOpen] = React.useState(false);

  const handleTriggerClick: React.MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleCancel = () => setOpen(false);

  const handleConfirm = () => {
    onConfirm(row);
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {mode === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={strings.delete}
            onClick={handleTriggerClick}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            className="gap-1"
            onClick={handleTriggerClick}
          >
            <Trash2 className="h-4 w-4" />
            {strings.delete}
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("actions.removeItem")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.rich("actions.removeItemDescription", {
              b: (chunks) => <b>{chunks}</b>,
              item: row.item_name,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {strings.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleConfirm}
          >
            {strings.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
