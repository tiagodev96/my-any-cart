"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { APIPurchase } from "../types";
import { money, dateOnly } from "../utils";
import { Button } from "@/components/ui/button";

type Props = {
  data: APIPurchase[];
  loading: boolean;
  error: string | null;
  onDetail: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function PurchasesTable({
  data,
  loading,
  error,
  onDetail,
  onDelete,
}: Props) {
  const t = useTranslations();

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-6 text-center text-muted-foreground"
              >
                {t("common.loading")}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-6 text-center text-destructive"
              >
                {error}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-6 text-center text-muted-foreground"
              >
                {t("history.empty")}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("history.table.store")}</TableHead>
            <TableHead>{t("history.table.date")}</TableHead>
            <TableHead className="text-right">
              {t("history.table.items")}
            </TableHead>
            <TableHead className="text-right">
              {t("history.table.total")}
            </TableHead>
            <TableHead className="text-right">
              {t("history.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p.id} className="hover:bg-muted/40">
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.store_name ?? "—"}</span>
                  {typeof p.items_count === "number" && (
                    <Badge variant="secondary">
                      {p.items_count} {t("history.badge.items")}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{dateOnly(p.completed_at)}</TableCell>
              <TableCell className="text-right">
                {p.items_count ?? "—"}
              </TableCell>
              <TableCell className="text-right">
                {money(Number(p.total_amount), p.currency)}
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex gap-2">
                  <Button size="sm" onClick={() => onDetail(p.id)}>
                    {t("history.actions.details")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(p.id)}
                  >
                    {t("history.actions.delete")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
