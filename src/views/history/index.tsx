"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// hooks
import { usePurchases } from "./hooks/usePurchases";
import { useDeletePurchase } from "./hooks/useDeletePurchase";

// components
import SearchBar from "./components/SearchBar";
import PurchasesTable from "./components/PurchasesTable";
import PurchaseDetailSheet from "./components/PurchaseDetailSheet";
import DeleteDialog from "./components/DeleteDialog";

export default function HistoryView() {
  const t = useTranslations();

  const {
    loading,
    error,
    filtered,
    search,
    setSearch,
    reload,
    removeById,
  } = usePurchases();

  const [detailOpen, setDetailOpen] = React.useState(false);
  const [detailId, setDetailId] = React.useState<string | null>(null);

  const openDetail = React.useCallback((id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  }, []);

  const {
    confirmOpen,
    setConfirmOpen,
    deleting,
    error: delError,
    askDelete,
    cancel,
    confirm,
  } = useDeletePurchase((id) => {
    removeById(id);
    if (detailOpen && detailId === id) {
      setDetailOpen(false);
      setDetailId(null);
    }
  });

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t("history.title")}</CardTitle>
          <CardDescription>{t("history.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            loading={loading}
            onRefresh={reload}
          />

          <Separator />

          <PurchasesTable
            data={filtered}
            loading={loading}
            error={error}
            onDetail={openDetail}
            onDelete={askDelete}
          />

          <PurchaseDetailSheet
            open={detailOpen}
            id={detailId}
            onOpenChange={setDetailOpen}
          />
        </CardContent>
      </Card>

      <DeleteDialog
        open={confirmOpen}
        onOpenChange={(v) => (v ? setConfirmOpen(true) : cancel())}
        onConfirm={confirm}
        loading={deleting}
        error={delError}
      />
    </div>
  );
}
