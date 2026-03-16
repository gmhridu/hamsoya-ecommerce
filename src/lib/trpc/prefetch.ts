import { headers } from 'next/headers';
import { cache } from 'react';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/trpc/root';

/**
 * This is a server-side tRPC client for prefetching.
 * Use this in Server Components to prefetch queries.
 */
export const serverTrpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/trpc`,
      async headers() {
        // Get headers from the server
        const heads = await headers();
        const headerObj: Record<string, string> = {};
        heads.forEach((value, key) => {
          headerObj[key] = value;
        });
        return headerObj;
      },
    }),
  ],
});

/**
 * Create a cached version of the server tRPC client for prefetching.
 */
export const getServerTrpc = cache(() => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/trpc`,
        async headers() {
          // Get headers from the server
          const heads = await headers();
          const headerObj: Record<string, string> = {};
          heads.forEach((value, key) => {
            headerObj[key] = value;
          });
          return headerObj;
        },
      }),
    ],
  });
});

/**
 * Prefetch current user for server-side rendering
 * Returns the user data if authenticated, null otherwise
 */
export const prefetchUser = async () => {
  try {
    const user = await serverTrpc.user.getMe.query();
    return user;
  } catch {
    return null;
  }
};

/**
 * Prefetch user by ID (admin only)
 */
export const prefetchUserById = async (userId: string) => {
  try {
    const user = await serverTrpc.user.getUser.query({ id: userId });
    return user;
  } catch {
    return null;
  }
};

/**
 * Prefetch all users with pagination (admin only)
 */
export const prefetchAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'USER' | 'ADMIN' | 'SELLER' | 'MODERATOR';
  isActive?: boolean;
}) => {
  try {
    const users = await serverTrpc.user.getAllUsers.query({
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search,
      role: params?.role,
      isActive: params?.isActive,
    });
    return users;
  } catch {
    return null;
  }
};
