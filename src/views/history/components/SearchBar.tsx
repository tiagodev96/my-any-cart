"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

type Props = {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  onRefresh: () => void;
};

export default function SearchBar({
  value,
  onChange,
  loading,
  onRefresh,
}: Props) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="grid gap-1">
        <Label htmlFor="search">{t("history.search.label")}</Label>
        <Input
          id="search"
          placeholder={t("history.search.placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full sm:w-80"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <ReloadIcon className="h-4 w-4 animate-spin" />
              {t("common.loading")}
            </span>
          ) : (
            t("history.actions.refresh")
          )}
        </Button>
      </div>
    </div>
  );
}
