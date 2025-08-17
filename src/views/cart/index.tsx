"use client";

import * as React from "react";
import Container from "@/components/container";
import ProductsTable from "@/components/products/products-table";
import CartToolbar from "./CartToolbar";
import { useCartItems } from "./useCartItems";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import DeleteProductDialog from "@/components/products/DeleteProductDialog";
import { useDeleteCartItem } from "./useDeleteCartItem";

export default function CartView() {
  const { items, addItem, editItem, deleteItem, clear } = useCartItems();

  const {
    confirmOpen,
    setConfirmOpen,
    target,
    deleting,
    error,
    askDelete,
    cancel,
    confirm,
  } = useDeleteCartItem((row) => {
    deleteItem(row);
  });

  return (
    <CurrencyProvider>
      <Container>
        <CartToolbar
          items={items}
          onClear={clear}
          onSaved={clear}
          onAdd={addItem}
        />

        <ProductsTable
          data={items}
          onAdd={addItem}
          onEdit={editItem}
          onDelete={askDelete}
          onClear={clear}
          itemsCount={items.length}
        />

        <DeleteProductDialog
          open={confirmOpen}
          onOpenChange={(v) => (v ? setConfirmOpen(true) : cancel())}
          onConfirm={confirm}
          loading={deleting}
          error={error}
          itemName={target?.item_name}
        />
      </Container>
    </CurrencyProvider>
  );
}
