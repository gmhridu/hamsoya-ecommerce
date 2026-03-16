import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Bookmark item type
 */
export interface BookmarkItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  addedAt: number;
}

/**
 * Bookmark state type
 */
interface BookmarkState {
  items: BookmarkItem[];
  isHydrated: boolean;

  // Actions
  setItems: (items: BookmarkItem[]) => void;
  addBookmark: (item: BookmarkItem) => void;
  removeBookmark: (productId: string) => void;
  clearBookmarks: () => void;
  setHydrated: (hydrated: boolean) => void;
  isBookmarked: (productId: string) => boolean;

  // Computed
  getBookmarkCount: () => number;
}

/**
 * Create bookmark store
 * Supports server hydration via setItems
 */
export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,

      setItems: (items) => set({ items, isHydrated: true }),

      addBookmark: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.productId === item.productId);

        if (!existingItem) {
          set({ items: [...items, { ...item, addedAt: Date.now() }] });
        }
      },

      removeBookmark: (productId) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
        });
      },

      clearBookmarks: () => set({ items: [] }),

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      isBookmarked: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      getBookmarkCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'bookmark-storage',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

/**
 * Selector for bookmark count - prevents unnecessary re-renders
 */
export const useBookmarkCount = () => useBookmarkStore((state) => state.getBookmarkCount());

/**
 * Selector for bookmark items
 */
export const useBookmarkItems = () => useBookmarkStore((state) => state.items);

/**
 * Selector for checking if a product is bookmarked
 */
export const useIsBookmarked = (productId: string) =>
  useBookmarkStore((state) => state.isBookmarked(productId));

/**
 * Selector for hydration status
 */
export const useBookmarkHydrated = () => useBookmarkStore((state) => state.isHydrated);
