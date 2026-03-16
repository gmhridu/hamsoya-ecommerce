import { useCallback } from 'react';
import { useCartStore, type CartItem } from '@/store/cart-store';

/**
 * Hook for cart operations with optimistic updates
 */
export function useCart() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const addToCart = useCallback(async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    // Optimistic update
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity || 1,
    });

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        // Rollback on error
        removeItem(item.productId);
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      // Rollback on error
      removeItem(item.productId);
      throw error;
    }
  }, [addItem, removeItem]);

  const removeFromCart = useCallback(async (productId: string) => {
    // Store item for rollback
    const item = items.find(i => i.productId === productId);

    // Optimistic update
    removeItem(productId);

    try {
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        // Rollback on error
        if (item) addItem(item);
        throw new Error('Failed to remove from cart');
      }
    } catch (error) {
      // Rollback on error
      if (item) addItem(item);
      throw error;
    }
  }, [items, addItem, removeItem]);

  const updateCartQuantity = useCallback(async (productId: string, quantity: number) => {
    // Store old quantity for rollback
    const oldItem = items.find(i => i.productId === productId);
    const oldQuantity = oldItem?.quantity || 0;

    // Optimistic update
    updateQuantity(productId, quantity);

    try {
      if (quantity <= 0) {
        const response = await fetch(`/api/cart?productId=${productId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          updateQuantity(productId, oldQuantity);
          throw new Error('Failed to remove from cart');
        }
      } else {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId, quantity, name: oldItem?.name, price: oldItem?.price }),
        });

        if (!response.ok) {
          updateQuantity(productId, oldQuantity);
          throw new Error('Failed to update quantity');
        }
      }
    } catch (error) {
      // Rollback on error
      updateQuantity(productId, oldQuantity);
      throw error;
    }
  }, [items, updateQuantity]);

  return {
    items,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  };
}
