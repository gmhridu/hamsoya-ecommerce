import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cart item type
 */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

/**
 * Cart state type
 */
interface CartState {
  items: CartItem[];
  isHydrated: boolean;

  // Actions
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setHydrated: (hydrated: boolean) => void;

  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

/**
 * Create cart store
 * Supports server hydration via setItems
 * Persists to localStorage for guest users
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      setItems: (items) => set({ items, isHydrated: true }),

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.productId === item.productId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

/**
 * Selector for cart count - prevents unnecessary re-renders
 */
export const useCartCount = () => useCartStore((state) => state.getTotalItems());

/**
 * Selector for cart items
 */
export const useCartItems = () => useCartStore((state) => state.items);

/**
 * Selector for cart total price
 */
export const useCartTotal = () => useCartStore((state) => state.getTotalPrice());

/**
 * Selector for hydration status
 */
export const useCartHydrated = () => useCartStore((state) => state.isHydrated);
