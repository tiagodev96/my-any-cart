"use client";

import * as React from "react";
import type { ProductRow } from "@/components/products/types";

export function useDeleteCartItem(onSuccess?: (row: ProductRow) => void) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [target, setTarget] = React.useState<ProductRow | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const askDelete = React.useCallback((row: ProductRow) => {
    setTarget(row);
    setConfirmOpen(true);
    setError(null);
  }, []);

  const cancel = React.useCallback(() => {
    setConfirmOpen(false);
    setTarget(null);
    setError(null);
  }, []);

  const confirm = React.useCallback(async () => {
    if (!target) return;
    try {
      setDeleting(true);
      setError(null);
      onSuccess?.(target);
      setConfirmOpen(false);
      setTarget(null);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Erro ao excluir o item do carrinho.";
      setError(msg);
    } finally {
      setDeleting(false);
    }
  }, [onSuccess, target]);

  return {
    confirmOpen,
    setConfirmOpen,
    target,
    deleting,
    error,
    askDelete,
    cancel,
    confirm,
  };
}
