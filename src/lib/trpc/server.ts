import 'server-only';

import { createTRPCReact, createTRPCProxyClient } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { headers } from 'next/headers';
import { cache } from 'react';

import type { AppRouter } from '@/server/trpc/root';

/**
 * This is the client-side tRPC hook.
 * Use this in client components and pages.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * This is the server-side tRPC client.
 * Use this in Server Components.
 *
 * Note: This client does not use React Query,
 * so it should be used only for server-side calls.
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
 * This is a cached version of the server tRPC client.
 * Use this in Server Components for repeated calls.
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
