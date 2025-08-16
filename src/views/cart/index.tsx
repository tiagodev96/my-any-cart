"use client";

import Container from "@/components/container";
import ProductsTable from "@/components/products/products-table";
import CartToolbar from "./CartToolbar";
import { useCartItems } from "./useCartItems";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

export default function CartView() {
  const { items, addItem, editItem, deleteItem, clear } = useCartItems();

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
          onDelete={deleteItem}
          onClear={clear}
          itemsCount={items.length}
        />
      </Container>
    </CurrencyProvider>
  );
}
