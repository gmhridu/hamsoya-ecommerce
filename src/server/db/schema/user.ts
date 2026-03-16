import { pgTable, uuid, varchar, timestamp, boolean, pgEnum, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['USER', 'ADMIN', 'SELLER', 'MODERATOR']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  profileImageUrl: text('profile_image_url'),
  role: roleEnum('role').default('USER').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  // Add other relations here as needed
}));

// Type for user data
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Public user data (excludes sensitive fields)
export type UserPublicData = Pick<
  User,
  | 'id'
  | 'name'
  | 'email'
  | 'phoneNumber'
  | 'profileImageUrl'
  | 'role'
  | 'emailVerified'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
  | 'lastLoginAt'
>;
