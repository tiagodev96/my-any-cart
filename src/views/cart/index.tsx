"use client";

import * as React from "react";
import Container from "@/components/container";
import ProductsTable, { ProductRow } from "@/components/products-table";

const initialData: ProductRow[] = [];

export default function CartView() {
  const [items, setItems] = React.useState<ProductRow[]>(initialData);

  const handleAdd = (row: ProductRow) => setItems((prev) => [row, ...prev]);

  const handleEdit = (row: ProductRow) =>
    setItems((prev) => prev.map((r) => (r.id === row.id ? row : r)));

  const handleDelete = (row: ProductRow) =>
    setItems((prev) => prev.filter((r) => r.id !== row.id));

  return (
    <Container>
      <ProductsTable
        data={items}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Container>
  );
}
