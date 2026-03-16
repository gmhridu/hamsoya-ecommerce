"use client";

import { useEffect, useState } from 'react';
import { useCartStore, type CartItem } from '@/store/cart-store';
import { useBookmarkStore, type BookmarkItem } from '@/store/bookmark-store';

interface CartBookmarkProviderProps {
  children: React.ReactNode;
  initialCart: CartItem[];
  initialBookmarks: BookmarkItem[];
}

/**
 * Cart and Bookmark Provider
 * Initializes stores with server data for logged-in users
 * Guest users rely on localStorage persistence via Zustand persist middleware
 */
export function CartBookmarkProvider({
  children,
  initialCart,
  initialBookmarks
}: CartBookmarkProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const setCartItems = useCartStore((state) => state.setItems);
  const setBookmarkItems = useBookmarkStore((state) => state.setItems);
  const cartItems = useCartStore((state) => state.items);

  useEffect(() => {
    // Only set server data if:
    // 1. We have server data (logged-in user)
    // 2. The current cart is empty (avoid overriding localStorage data for guests)
    if (initialCart.length > 0 && cartItems.length === 0) {
      setCartItems(initialCart);
    }
    if (initialBookmarks.length > 0) {
      setBookmarkItems(initialBookmarks);
    }
    setIsReady(true);
  }, [initialCart, initialBookmarks, setCartItems, setBookmarkItems, cartItems.length]);

  // Show loading state until hydrated - prevents flash
  // For guest users, this still renders since localStorage hydrates quickly
  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
