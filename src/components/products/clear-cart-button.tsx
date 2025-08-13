"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useTranslations } from "next-intl";

type ClearCartButtonProps = {
  disabled?: boolean;
  onClear: () => void;
  itemsCount: number;
};

export default function ClearCartButton({
  disabled,
  onClear,
  itemsCount,
}: ClearCartButtonProps) {
  const [open, setOpen] = React.useState(false);
  const t = useTranslations("products");

  const label =
    itemsCount > 0
      ? `${t("clearCart", { count: itemsCount })}`
      : t("emptyCart");

  const DesktopButton = (
    <div className="hidden sm:block">
      <Button
        variant="destructive"
        disabled={disabled || itemsCount === 0}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {t("clearCart")}
      </Button>
    </div>
  );

  const MobileBarButton = (
    <div className="sm:hidden fixed bottom-0 inset-x-0 z-40">
      <div className="p-3 backdrop-blur bg-background/70 border-t">
        <Button
          className="w-full"
          variant="destructive"
          size="lg"
          disabled={disabled || itemsCount === 0}
          onClick={() => setOpen(true)}
        >
          <Trash2 className="mr-2 h-5 w-5" />
          {label}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {DesktopButton}
      {MobileBarButton}

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="actions.dialog-title"
        description="actions.dialog-description"
        confirmText="actions.confirm"
        cancelText="actions.cancel"
        destructive
        onConfirm={() => {
          onClear();
          setOpen(false);
        }}
      />
    </>
  );
}
