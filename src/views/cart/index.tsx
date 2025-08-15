"use client";

import Container from "@/components/container";
import ProductsTable from "@/components/products/products-table";
import type { ProductRow } from "@/components/products/types";
import CartToolbar from "./CartToolbar";
import { useCartItems } from "./useCartItems";

export default function CartView() {
  const { items, addItem, editItem, deleteItem, clear } = useCartItems();

  const handleAdd = (row: ProductRow) => addItem(row);
  const handleEdit = (row: ProductRow) => editItem(row);
  const handleDelete = (row: ProductRow) => deleteItem(row);

  return (
    <Container>
      <CartToolbar items={items} onClear={clear} onSaved={clear} />
      <ProductsTable
        data={items}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Container>
  );
}
