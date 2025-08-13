"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { CommonStrings, ProductRow } from "./types";

export function ProductsToolbar({
  table,
  open,
  setOpen,
  onStartAdd,
  dialogTitle,
  dialogForm,
  strings,
}: {
  table: Table<ProductRow>;
  open: boolean;
  setOpen: (v: boolean) => void;
  onStartAdd: () => void;
  dialogTitle: string;
  dialogForm: React.ReactNode;
  strings: CommonStrings;
}) {
  return (
    <div className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:py-4">
      <Input
        placeholder={strings.searchPlaceholder}
        value={(table.getColumn("item_name")?.getFilterValue() as string) ?? ""}
        onChange={(e) =>
          table.getColumn("item_name")?.setFilterValue(e.target.value)
        }
        className="max-w-full md:max-w-sm"
      />
      <div className="md:ml-auto">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-1 md:w-auto" onClick={onStartAdd}>
              <Plus className="h-4 w-4" />
              {strings.addProduct}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            {dialogForm}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
