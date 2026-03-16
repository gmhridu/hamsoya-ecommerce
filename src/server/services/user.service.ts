import { db } from '@/server/db';
import { users } from '@/server/db/schema/user';
import { eq, and, desc, like, or, sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Types
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  role?: 'USER' | 'ADMIN' | 'SELLER' | 'MODERATOR';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  role?: 'USER' | 'ADMIN' | 'SELLER' | 'MODERATOR';
  isActive?: boolean;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedUsers {
  users: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const userService = {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        password: false, // Exclude password
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string, includeDeleted = false) {
    const conditions = [eq(users.id, userId)];

    if (!includeDeleted) {
      conditions.push(eq(users.isDeleted, false));
    }

    const user = await db.query.users.findFirst({
      where: and(...conditions),
      columns: {
        password: false,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    return user;
  },

  /**
   * Get all users with pagination (admin only)
   */
  async getAllUsers(filters: UserFilters = {}): Promise<PaginatedUsers> {
    const { search, role, isActive, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    // Build conditions
    const conditions: any[] = [eq(users.isDeleted, false)];

    if (role) {
      conditions.push(eq(users.role, role as any));
    }

    if (isActive !== undefined) {
      conditions.push(eq(users.isActive, isActive));
    }

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.phoneNumber, `%${search}%`)
        )
      );
    }

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(...conditions));

    const total = countResult[0]?.count || 0;

    // Get users
    const userList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        emailVerified: users.emailVerified,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        lastLoginAt: users.lastLoginAt,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      users: userList,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput) {
    // Check if user exists
    const existingUser = await this.getUserByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 12);

    const [user] = await db.insert(users).values({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phoneNumber: input.phoneNumber,
      profileImageUrl: input.profileImageUrl,
      role: input.role || 'USER',
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phoneNumber: users.phoneNumber,
      profileImageUrl: users.profileImageUrl,
      role: users.role,
      emailVerified: users.emailVerified,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    return user;
  },

  /**
   * Update current user's profile
   */
  async updateProfile(userId: string, input: { name?: string; email?: string; phoneNumber?: string; profileImageUrl?: string }) {
    // Check if email is being changed and if it's already in use
    if (input.email) {
      const existingUser = await db.query.users.findFirst({
        where: and(
          eq(users.email, input.email),
          sql`${users.id} != ${userId}`
        ),
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    const [user] = await db.update(users)
      .set({
        ...(input.name && { name: input.name }),
        ...(input.email && { email: input.email }),
        ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
        ...(input.profileImageUrl !== undefined && { profileImageUrl: input.profileImageUrl }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        emailVerified: users.emailVerified,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Update any user by ID (admin only)
   */
  async updateUser(userId: string, input: UpdateUserInput) {
    // Check if email is being changed and if it's already in use
    if (input.email) {
      const existingUser = await db.query.users.findFirst({
        where: and(
          eq(users.email, input.email),
          sql`${users.id} != ${userId}`
        ),
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    const [user] = await db.update(users)
      .set({
        ...(input.name && { name: input.name }),
        ...(input.email && { email: input.email }),
        ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
        ...(input.profileImageUrl !== undefined && { profileImageUrl: input.profileImageUrl }),
        ...(input.role && { role: input.role }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber,
        profileImageUrl: users.profileImageUrl,
        role: users.role,
        emailVerified: users.emailVerified,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Change user's password
   */
  async updatePassword(userId: string, input: UpdatePasswordInput) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(input.newPassword, 12);

    // Update password
    await db.update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Invalidate all refresh tokens (optional security measure)
    // await redis.del(`refresh:${userId}`);

    return { success: true, message: 'Password updated successfully' };
  },

  /**
   * Soft delete current user's account
   */
  async deleteMe(userId: string) {
    const [user] = await db.update(users)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        email: sql`CONCAT(${users.email}, '_deleted_', ${users.id})`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!user) {
      throw new Error('User not found');
    }

    return { success: true, message: 'Account deleted successfully' };
  },

  /**
   * Delete any user by ID (admin only)
   */
  async deleteUser(userId: string, hardDelete = false) {
    if (hardDelete) {
      // Hard delete
      const [user] = await db.delete(users)
        .where(eq(users.id, userId))
        .returning({ id: users.id });

      if (!user) {
        throw new Error('User not found');
      }
    } else {
      // Soft delete
      const [user] = await db.update(users)
        .set({
          isDeleted: true,
          deletedAt: new Date(),
          email: sql`CONCAT(${users.email}, '_deleted_', ${users.id})`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({ id: users.id });

      if (!user) {
        throw new Error('User not found');
      }
    }

    return { success: true, message: 'User deleted successfully' };
  },

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string) {
    await db.update(users)
      .set({
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, userId));
  },
};
