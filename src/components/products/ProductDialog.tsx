"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ProductRow, CommonStrings } from "./types";
import { ProductDialogForm } from "./product-dialog-form";
import { useTranslations } from "next-intl";

function makeId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

type Props = {
  trigger: React.ReactNode;
  onSubmit: (row: ProductRow) => void;
  editing?: ProductRow | null;
  onClose?: () => void;
};

export function ProductDialog({
  trigger,
  onSubmit,
  editing = null,
  onClose,
}: Props) {
  const t = useTranslations("products");
  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState<{
    item_name: string;
    item_amount: number;
    item_price: number;
  }>({
    item_name: editing?.item_name ?? "",
    item_amount: editing?.item_amount ?? 1,
    item_price: editing?.item_price ?? 0,
  });

  React.useEffect(() => {
    setForm({
      item_name: editing?.item_name ?? "",
      item_amount: editing?.item_amount ?? 1,
      item_price: editing?.item_price ?? 0,
    });
  }, [editing, open]);

  function handleCancel() {
    setOpen(false);
    onClose?.();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const row: ProductRow = {
      id: editing?.id ?? makeId(),
      item_name: form.item_name.trim(),
      item_amount: Math.max(1, Number(form.item_amount || 1)),
      item_price: Math.max(0, Number(form.item_price || 0)),
    };

    if (!row.item_name) return;

    onSubmit(row);
    setOpen(false);
  }

  const strings: CommonStrings = {
    item: t("column.item"),
    quantity: t("column.quantity"),
    unitPrice: t("column.unitPrice"),
    cancel: t("actions.cancel"),
    save: t("actions.save"),
    addProduct: t("actions.addProduct"),
    actions: t("column.actions"),
    edit: t("actions.edit"),
    delete: t("actions.delete"),
    total: t("total"),
    confirm: t("actions.confirm"),
    removeItem: t("actions.removeItem"),
    emptyText: t("emptyState.text"),
    searchPlaceholder: t("searchPlaceholder"),
  };

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("actions.edit") : t("actions.addProduct")}
          </DialogTitle>
        </DialogHeader>

        <ProductDialogForm
          editing={editing ?? null}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          strings={strings}
        />
      </DialogContent>
    </Dialog>
  );
}
