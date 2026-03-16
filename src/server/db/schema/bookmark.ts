import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Bookmarks table
 */
export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  productId: varchar('product_id', { length: 255 }).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productPrice: text('product_price'), // Stored as string for flexibility
  productImage: text('product_image'),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

// Bookmark relations
export const bookmarksRelations = relations(bookmarks, ({ many }) => ({
  // Add relations if needed
}));

// Type for bookmark
export type BookmarkType = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
