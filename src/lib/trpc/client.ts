import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { createQueryClient } from './query-client';
import type { AppRouter } from '@/server/trpc/root';
import { useTokenStore } from '@/lib/auth/token-store';

export const trpc = createTRPCReact<AppRouter>();

// Export query client for direct manipulation
export const queryClient = createQueryClient();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/trpc`,
      headers() {
        // Get token from in-memory store (not localStorage for security)
        const token = useTokenStore.getState().getAccessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

export { createTRPCReact };
