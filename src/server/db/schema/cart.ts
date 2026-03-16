import { pgTable, uuid, varchar, timestamp, integer, boolean, text, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Cart Items table
 */
export const cartItems = pgTable('cart_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id'), // Nullable for guest users
  sessionId: varchar('session_id', { length: 255 }), // For guest users
  productId: varchar('product_id', { length: 255 }).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productPrice: decimal('product_price', { precision: 10, scale: 2 }).notNull(),
  productImage: text('product_image'),
  quantity: integer('quantity').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cart relations
export const cartItemsRelations = relations(cartItems, ({ many }) => ({
  // Add relations if needed
}));

// Type for cart item
export type CartItemType = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
