import { z } from 'zod';
import { t, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { userService } from '@/server/services/user.service';

// Input schemas
const userIdSchema = z.object({
  id: z.string().uuid(),
});

const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN', 'SELLER', 'MODERATOR']).optional(),
  isActive: z.boolean().optional(),
});

// Admin procedure - defined inline to avoid type issues
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, userId: ctx.session.userId },
    },
  });
});

export const userRouter = t.router({
  /**
   * Get currently authenticated user
   */
  getMe: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await userService.getCurrentUser(ctx.session.userId);
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to get current user',
      });
    }
  }),

  /**
   * Get a single user by ID (admin only)
   */
  getUser: adminProcedure
    .input(userIdSchema)
    .query(async ({ input }) => {
      try {
        return await userService.getUserById(input.id);
      } catch (error: any) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: error.message || 'User not found',
        });
      }
    }),

  /**
   * Get all users with pagination (admin only)
   */
  getAllUsers: adminProcedure
    .input(paginationSchema)
    .query(async ({ input }) => {
      try {
        return await userService.getAllUsers(input);
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to get users',
        });
      }
    }),

  /**
   * Update current user's profile
   */
  updateMe: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255).optional(),
        email: z.string().email().optional(),
        phoneNumber: z.string().max(20).optional(),
        profileImageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return await userService.updateProfile(ctx.session.userId, input);
      } catch (error: any) {
        if (error.message === 'Email already in use') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already in use',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update profile',
        });
      }
    }),

  /**
   * Update any user by ID (admin only)
   */
  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().min(2).max(255).optional(),
          email: z.string().email().optional(),
          phoneNumber: z.string().max(20).optional(),
          profileImageUrl: z.string().url().optional(),
          role: z.enum(['USER', 'ADMIN', 'SELLER', 'MODERATOR']).optional(),
          isActive: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await userService.updateUser(input.id, input.data);
      } catch (error: any) {
        if (error.message === 'Email already in use') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email already in use',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update user',
        });
      }
    }),

  /**
   * Change current user's password
   */
  updatePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).max(255),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return await userService.updatePassword(ctx.session.userId, {
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        });
      } catch (error: any) {
        if (error.message === 'Current password is incorrect') {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Current password is incorrect',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to update password',
        });
      }
    }),

  /**
   * Soft or hard delete current user's account
   */
  deleteMe: protectedProcedure
    .input(
      z.object({
        hardDelete: z.boolean().default(false),
      }).optional()
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return await userService.deleteMe(ctx.session.userId);
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete account',
        });
      }
    }),

  /**
   * Delete any user by ID (admin only)
   */
  deleteUser: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        hardDelete: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await userService.deleteUser(input.id, input.hardDelete);
      } catch (error: any) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Failed to delete user',
        });
      }
    }),
});
