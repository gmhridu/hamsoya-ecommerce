"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { CartItem } from "@/types/cart.type";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CartTrigger } from "./cart-trigger";
import { CartContent } from "./cart-content";

interface CartDrawerProps {
  cartCount: number;
}

export function CartDrawer({ cartCount }: CartDrawerProps) {
  const [count, setCount] = useState(cartCount);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const items: CartItem[] = [
    {
      product: {
        id: "1",
        name: "Product 1",
        description: "Product 1 description",
        price: 100,
        original_price: 120,
        images: ["https://via.placeholder.com/150"],
        category: "Category 1",
        in_stock: true,
        featured: true,
        tags: ["tag1", "tag2"],
        weight: "1kg",
        origin: "Origin 1",
        benefits: ["benefit1", "benefit2"],
        rating: 4.5,
        reviews: 10,
        stock_quantity: 10,
        allowPreorder: true,
      },
      quantity: 1,
    },
    {
      product: {
        id: "2",
        name: "Product 2",
        description: "Product 2 description",
        price: 200,
        original_price: 220,
        images: ["https://via.placeholder.com/150"],
        category: "Category 2",
        in_stock: true,
        featured: true,
        tags: ["tag1", "tag2"],
        weight: "1kg",
        origin: "Origin 1",
        benefits: ["benefit1", "benefit2"],
        rating: 4.5,
        reviews: 10,
        stock_quantity: 10,
        allowPreorder: true,
      },
      quantity: 1,
    },
  ];
  const totalItems = 0;
  const totalPrice = 0;

  useEffect(() => {
    setCount(cartCount);
  }, [totalItems]);

  // Desktop: Use Sheet (side drawer)
  if (isDesktop) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <CartTrigger count={count} />
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left">
              Shopping Cart {totalItems > 0 && `(${totalItems})`}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <CartContent
              items={items}
              totalItems={totalItems}
              totalPrice={totalPrice}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <CartTrigger count={count} />
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="text-center">
            Shopping Cart {totalItems > 0 && `(${totalItems})`}
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden">
          <CartContent
            items={items}
            totalItems={totalItems}
            totalPrice={totalPrice}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
