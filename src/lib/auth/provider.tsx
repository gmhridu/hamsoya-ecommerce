"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTokenStore } from '@/lib/auth/token-store';

/**
 * User type definition
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  role: string;
  emailVerified: boolean;
}

/**
 * Authentication context type
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

/**
 * Create the auth context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth provider component
 * Manages authentication state and provides auth methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const currentPathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const { setAccessToken, clearAccessToken, getAccessToken, setIsRefreshing } = useTokenStore();

  // Track if we've tried to fetch user on mount
  const hasTriedInitialFetch = useRef(false);

  // Track refresh timeout
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch current user with existing token
   */
  const fetchUser = async (token: string) => {
    try {
      // Set token in memory first
      setAccessToken(token);

      // Fetch user data
      const response = await fetch('/api/trpc/user.getMe', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result?.data?.json) {
          setUser(data.result.data.json);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    if (hasTriedInitialFetch.current) return;
    hasTriedInitialFetch.current = true;

    const initAuth = async () => {
      try {
        // Try to get token from memory first
        let token = getAccessToken();

        // If no memory token, try to fetch from server
        if (!token) {
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            if (data.accessToken) {
              token = data.accessToken;
              setAccessToken(token);
            }
            if (data.user) {
              setUser(data.user);
            }
          }
        } else {
          // We have a token in memory, fetch user
          const success = await fetchUser(token);
          if (!success) {
            // Token might be invalid, try refresh
            await refreshToken();
          }
        }
      } catch {
        // Auth initialization failed
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  /**
   * Setup automatic token refresh
   */
  useEffect(() => {
    if (!user || isLoading) return;

    // Calculate refresh time (5 minutes before expiry for 15min token)
    const refreshTime = 10 * 60 * 1000; // 10 minutes

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Set new timeout
    refreshTimeoutRef.current = setTimeout(() => {
      refreshToken();
    }, refreshTime);

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user, isLoading]);

  /**
   * Refresh token using refresh token cookie
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken) {
          setAccessToken(data.accessToken);
          return true;
        }
      }

      // Refresh failed, clear state
      clearAccessToken();
      setUser(null);
      return false;
    } catch {
      clearAccessToken();
      setUser(null);
      return false;
    }
  }, [setAccessToken, clearAccessToken]);

  /**
   * Login function
   */
  const login = useCallback(async (accessToken: string) => {
    setAccessToken(accessToken);

    // Fetch user data
    const success = await fetchUser(accessToken);

    if (!success) {
      clearAccessToken();
      throw new Error('Failed to fetch user data');
    }

    // Redirect to home
    router.push('/');
    router.refresh();
  }, [router, setAccessToken, clearAccessToken]);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      // Call logout API to invalidate refresh token
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore logout API errors
    } finally {
      // Clear all auth state
      clearAccessToken();
      setUser(null);

      // Redirect to login
      router.push('/login');
      router.refresh();
    }
  }, [router, clearAccessToken]);

  /**
   * Provide the auth context value
   */
  const value: AuthContextType = {
    user,
    isLoading: !isInitialized || isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook to get current user (with loading state)
 */
export function useCurrentUser() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return {
    data: user,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Protected route component
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return <>{fallback || <AuthLoadingScreen />}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Public route component (redirects to home if authenticated)
 */
interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Loading screen for auth
 */
function AuthLoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
