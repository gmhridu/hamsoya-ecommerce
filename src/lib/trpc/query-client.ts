import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 1000, // 5 seconds
        refetchOnWindowFocus: false,
      },
    },
  });
}

// We export a singleton query client (not preconfigured)
// so we can adjust it on the client.
export const queryClient = createQueryClient();
