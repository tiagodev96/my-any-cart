"use client";

import * as React from "react";
import { deletePurchase } from "@/lib/api/purchases";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useDeletePurchase(onSuccess?: (id: string) => void) {
  const t = useTranslations("history");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const askDelete = React.useCallback((id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
    setError(null);
  }, []);

  const cancel = React.useCallback(() => {
    setConfirmOpen(false);
    setDeleteId(null);
    setError(null);
  }, []);

  const confirm = React.useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);
    try {
      await deletePurchase(deleteId);

      toast.success(t("delete.toastSuccess"));

      onSuccess?.(deleteId);
      setConfirmOpen(false);
      setDeleteId(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);

      toast.error(t("delete.toastError"));
    } finally {
      setDeleting(false);
    }
  }, [deleteId, onSuccess, t]);

  return {
    confirmOpen,
    setConfirmOpen,
    deleting,
    error,
    askDelete,
    cancel,
    confirm,
    deleteId,
  };
}
