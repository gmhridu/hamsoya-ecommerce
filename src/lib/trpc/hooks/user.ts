import { trpc, queryClient } from '../client';
import type { AppRouter } from '@/server/trpc/root';
import { inferRouterOutputs } from '@trpc/server';

// Type definitions for user data
type RouterOutputsType = inferRouterOutputs<AppRouter>;
export type User = RouterOutputsType['user']['getMe'];
export type UserList = RouterOutputsType['user']['getAllUsers'];

/**
 * Hook: Get current authenticated user
 */
export const useCurrentUser = () => {
  return trpc.user.getMe.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook: Get current user with custom options
 */
export const useCurrentUserQuery = (options?: Parameters<typeof trpc.user.getMe.useQuery>[1]) => {
  return trpc.user.getMe.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Hook: Get a single user by ID (admin only)
 */
export const useUser = (userId: string) => {
  return trpc.user.getUser.useQuery({ id: userId }, {
    enabled: !!userId,
  });
};

/**
 * Hook: Get all users with pagination (admin only)
 */
export const useUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'USER' | 'ADMIN' | 'SELLER' | 'MODERATOR';
  isActive?: boolean;
}) => {
  return trpc.user.getAllUsers.useQuery({
    page: params?.page || 1,
    limit: params?.limit || 10,
    search: params?.search,
    role: params?.role,
    isActive: params?.isActive,
  });
};

/**
 * Hook: Update current user's profile
 */
export const useUpdateProfile = () => {
  return trpc.user.updateMe.useMutation({
    onSuccess: () => {
      // Invalidate the current user query to refetch
      queryClient.invalidateQueries({ queryKey: ['user', 'getMe'] });
    },
  });
};

/**
 * Hook: Update any user (admin only)
 */
export const useUpdateUser = () => {
  return trpc.user.updateUser.useMutation({
    onSuccess: () => {
      // Invalidate the users list
      queryClient.invalidateQueries({ queryKey: ['user', 'getAllUsers'] });
    },
  });
};

/**
 * Hook: Change current user's password
 */
export const useUpdatePassword = () => {
  return trpc.user.updatePassword.useMutation();
};

/**
 * Hook: Delete current user's account
 */
export const useDeleteMyAccount = () => {
  return trpc.user.deleteMe.useMutation({
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.invalidateQueries({ queryKey: ['user', 'getMe'] });
    },
  });
};

/**
 * Hook: Delete any user (admin only)
 */
export const useDeleteUser = () => {
  return trpc.user.deleteUser.useMutation({
    onSuccess: () => {
      // Invalidate the users list
      queryClient.invalidateQueries({ queryKey: ['user', 'getAllUsers'] });
    },
  });
};

/**
 * Prefetch user data for server-side rendering
 */
export const prefetchUser = async (trpcServer: any) => {
  try {
    return await trpcServer.user.getMe.query();
  } catch {
    return null;
  }
};
