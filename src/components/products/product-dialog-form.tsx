"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { CommonStrings, ProductRow } from "./types";

function normalizeIntInput(raw: string): string {
  let v = raw.replace(/\D+/g, "");
  if (v.length > 1) v = v.replace(/^0+(?=\d)/, "");
  return v;
}

function normalizeDecimalInput(raw: string): string {
  let v = raw.replace(/,/g, ".").replace(/[^\d.]/g, "");

  const i = v.indexOf(".");
  if (i !== -1) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, "");

  if (v.startsWith(".")) v = "0" + v;

  if (v.length > 1 && v[0] === "0" && v[1] !== ".") {
    v = v.replace(/^0+(?=\d)/, "");
  }

  return v;
}

export function ProductDialogForm({
  editing,
  form,
  setForm,
  onSubmit,
  onCancel,
  strings,
}: {
  editing: ProductRow | null;
  form: { item_name: string; item_amount: number; item_price: number };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  strings: CommonStrings;
}) {
  const [amountStr, setAmountStr] = useState<string>(
    form.item_amount ? String(form.item_amount) : "1"
  );
  const [priceStr, setPriceStr] = useState<string>(
    form.item_price ? String(form.item_price) : ""
  );

  useEffect(() => {
    setAmountStr(
      typeof form.item_amount === "number" && !Number.isNaN(form.item_amount)
        ? String(form.item_amount)
        : ""
    );
    setPriceStr(
      typeof form.item_price === "number" && !Number.isNaN(form.item_price)
        ? String(form.item_price)
        : ""
    );
  }, [editing, form.item_amount, form.item_price]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="item_name">{strings.item}</Label>
        <Input
          id="item_name"
          value={form.item_name}
          onChange={(e) =>
            setForm((s) => ({ ...s, item_name: e.target.value }))
          }
          placeholder="e.g. Leite Meio-Gordo (1L)"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="item_amount">{strings.quantity}</Label>
          <Input
            id="item_amount"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={amountStr}
            onChange={(e) => {
              const next = normalizeIntInput(e.target.value);
              setAmountStr(next);
              setForm((s) => ({
                ...s,
                item_amount: next === "" ? 0 : Number(next),
              }));
            }}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item_price">{strings.unitPrice} (EUR)</Label>
          <Input
            id="item_price"
            type="text"
            inputMode="decimal"
            value={priceStr}
            onChange={(e) => {
              const next = normalizeDecimalInput(e.target.value);
              setPriceStr(next);
              setForm((s) => ({
                ...s,
                item_price: next === "" || next === "." ? 0 : Number(next),
              }));
            }}
            onBlur={(e) => {
              let v = normalizeDecimalInput(e.target.value);
              if (v.endsWith(".")) v = v.slice(0, -1);
              setPriceStr(v);
              setForm((s) => ({
                ...s,
                item_price: v === "" ? 0 : Number(v),
              }));
            }}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          {strings.cancel}
        </Button>
        <Button type="submit" className="gap-1">
          {editing ? (
            strings.save
          ) : (
            <>
              <Plus className="h-4 w-4" /> {strings.addProduct}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
