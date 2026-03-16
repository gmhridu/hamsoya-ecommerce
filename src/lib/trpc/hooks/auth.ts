import { trpc, queryClient } from '../client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTokenStore } from '@/lib/auth/token-store';

/**
 * Hook: Register a new user
 */
export const useRegister = () => {
  const router = useRouter();

  return trpc.auth.register.useMutation({
    onSuccess: (data) => {
      // Redirect to verify email page
      router.push(`/verify-email?userId=${data.userId}`);
    },
  });
};

/**
 * Hook: Verify email with OTP
 */
export const useVerifyEmail = () => {
  const router = useRouter();

  return trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      router.push('/login?verified=true');
    },
  });
};

/**
 * Hook: Resend verification OTP
 */
export const useResendVerificationOtp = () => {
  return trpc.auth.resendVerificationOtp.useMutation();
};

/**
 * Hook: Login user
 * Uses API route for HTTP-only cookie setting
 */
export const useLogin = () => {
  const router = useRouter();
  const { setAccessToken } = useTokenStore();
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (credentials: { email: string; password: string }) => {
    setIsPending(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store access token in memory only (NOT localStorage)
      setAccessToken(data.accessToken);

      // Invalidate user query to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ['user', 'getMe'] });

      // Force full page reload to re-run server layout
      // This ensures the server fetches the user with the new cookies
      window.location.href = '/';

      return data;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
    isSuccess: false,
    isError: false,
    error: null,
    reset: () => {},
  };
};

/**
 * Hook: Request password reset
 */
export const useForgotPassword = () => {
  return trpc.auth.forgotPassword.useMutation();
};

/**
 * Hook: Verify password reset OTP
 */
export const useVerifyResetOtp = () => {
  return trpc.auth.verifyResetOtp.useMutation();
};

/**
 * Hook: Reset password
 */
export const useResetPassword = () => {
  const router = useRouter();

  return trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      router.push('/login?reset=true');
    },
  });
};

/**
 * Hook: Refresh token
 */
export const useRefreshToken = () => {
  return trpc.auth.refresh.useMutation({
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        document.cookie = `auth-token=${data.accessToken}; path=/; max-age=${15 * 60}; SameSite=Lax`;
      }
    },
  });
};

/**
 * Hook: Logout user
 */
export const useLogout = () => {
  const router = useRouter();
  const { clearAccessToken } = useTokenStore();

  return trpc.auth.logout.useMutation({
    onSuccess: async () => {
      // Clear in-memory token
      clearAccessToken();

      // Call logout API to clear cookies and invalidate refresh token
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        // Ignore errors
      }

      // Clear all queries
      queryClient.clear();

      // Redirect to login
      router.push('/login');
      router.refresh();
    },
  });
};

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = trpc.user.getMe.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};

/**
 * Get stored token from in-memory store
 */
export const getStoredToken = (): string | null => {
  // Access token is stored in memory, not localStorage
  const { getAccessToken } = useTokenStore.getState();
  return getAccessToken();
};

/**
 * Clear stored tokens
 */
export const clearStoredTokens = () => {
  const { clearAccessToken } = useTokenStore.getState();
  clearAccessToken();
};

