"use client";

import * as React from "react";
import Container from "@/components/container";
import ProductsTable, { ProductRow } from "@/components/products-table";

const initialData: ProductRow[] = [
  {
    id: "1",
    item_name: "Pão de Forma (500g)",
    item_amount: 1,
    item_price: 1.49,
  },
  {
    id: "2",
    item_name: "Leite Meio-Gordo (1L)",
    item_amount: 2,
    item_price: 0.89,
  },
  {
    id: "3",
    item_name: "Arroz Agulha (1kg)",
    item_amount: 1,
    item_price: 1.19,
  },
];

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
