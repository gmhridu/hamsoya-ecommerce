import { useCallback } from 'react';
import { useBookmarkStore, type BookmarkItem } from '@/store/bookmark-store';
import { useInitialUser } from '@/lib/auth/auth-provider';

/**
 * Hook for bookmark operations with optimistic updates
 * Supports both logged-in users (API + localStorage) and guest users (localStorage only)
 */
export function useBookmarks() {
  const { user } = useInitialUser();
  const isAuthenticated = !!user;

  const items = useBookmarkStore((state) => state.items);
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  const isBookmarkedFn = useBookmarkStore((state) => state.isBookmarked);

  const toggleBookmark = useCallback(async (item: Omit<BookmarkItem, 'addedAt'>) => {
    const currentlyBookmarked = isBookmarkedFn(item.productId);

    if (currentlyBookmarked) {
      // Optimistic remove
      removeBookmark(item.productId);

      // Only sync with server if authenticated
      if (isAuthenticated) {
        try {
          const response = await fetch(`/api/bookmarks?productId=${item.productId}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!response.ok) {
            // Rollback on error
            addBookmark({ ...item, addedAt: Date.now() });
            throw new Error('Failed to remove bookmark');
          }
        } catch (error) {
          // Rollback on error
          addBookmark({ ...item, addedAt: Date.now() });
          throw error;
        }
      }
      // For guests, just keep it in localStorage (already removed optimistically)
    } else {
      // Optimistic add
      addBookmark({ ...item, addedAt: Date.now() });

      // Only sync with server if authenticated
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(item),
          });

          if (!response.ok) {
            // Rollback on error
            removeBookmark(item.productId);
            throw new Error('Failed to add bookmark');
          }
        } catch (error) {
          // Rollback on error
          removeBookmark(item.productId);
          throw error;
        }
      }
      // For guests, just keep it in localStorage (already added optimistically)
    }
  }, [addBookmark, removeBookmark, isBookmarkedFn, isAuthenticated]);

  return {
    items,
    toggleBookmark,
    isBookmarked: isBookmarkedFn,
  };
}
