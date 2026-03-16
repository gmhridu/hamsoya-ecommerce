"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBagIcon } from "lucide-react";
import { CartContent } from "./cart-content";
import { useCart } from "@/lib/hooks/use-cart";
import type { CartItem as CartItemType } from "@/types/cart.type";

interface CartDrawerProps {
  cartCount: number;
}

export function CartDrawer({ cartCount: initialCount }: CartDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Use cart hook
  const { items, removeFromCart, updateCartQuantity } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Transform cart items to the expected format
  const cartItems: CartItemType[] = items.map((item) => ({
    product: {
      id: item.productId,
      name: item.name,
      description: "",
      price: item.price,
      original_price: item.price,
      images: item.image ? [item.image] : [""],
      category: "",
      in_stock: true,
      featured: false,
      tags: [],
      weight: "",
      origin: "",
      benefits: [],
      rating: 0,
      reviews: 0,
      stock_quantity: 0,
      allowPreorder: false,
    },
    quantity: item.quantity,
  }));

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateCartQuantity(productId, quantity);
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

  const cartCount = totalItems || initialCount;

  // Desktop: Use Sheet (side drawer)
  if (isDesktop) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-accent cursor-pointer"
          >
            <ShoppingBagIcon className="size-5 cursor-pointer" />
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 size-4 rounded-full p-0 text-xs font-semibold text-white flex items-center justify-center min-w-4 min-h-4 text-center"
              suppressHydrationWarning
            >
              {cartCount}
            </Badge>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left">
              Shopping Cart {totalItems > 0 && `(${totalItems})`}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <CartContent
              items={cartItems}
              totalItems={totalItems}
              totalPrice={totalPrice}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent cursor-pointer"
        >
          <ShoppingBagIcon className="size-5 cursor-pointer" />
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 size-4 rounded-full p-0 text-xs font-semibold text-white flex items-center justify-center min-w-4 min-h-4 text-center"
            suppressHydrationWarning
          >
            {cartCount}
          </Badge>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="text-center">
            Shopping Cart {totalItems > 0 && `(${totalItems})`}
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden">
          <CartContent
            items={cartItems}
            totalItems={totalItems}
            totalPrice={totalPrice}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
