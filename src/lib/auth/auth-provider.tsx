"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTokenStore } from '@/lib/auth/token-store';
import { ServerUser } from '@/server/auth/server-auth';

/**
 * Initial user context type
 */
interface InitialUserContextType {
  user: ServerUser;
  newAccessToken: string | null;
}

/**
 * Create context for initial user
 */
const InitialUserContext = createContext<InitialUserContextType | undefined>(undefined);

/**
 * Provider props
 */
interface ServerAuthProviderProps {
  children: React.ReactNode;
  initialUser: ServerUser;
  newAccessToken: string | null;
}

/**
 * Server Auth Provider
 * Receives user from server-side layout and initializes auth state
 * This ensures no flash on page load
 */
export function AuthProvider({ children, initialUser, newAccessToken }: ServerAuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<ServerUser>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const { setAccessToken, clearAccessToken, getAccessToken } = useTokenStore();

  // Initialize token from server if provided
  useEffect(() => {
    if (newAccessToken) {
      setAccessToken(newAccessToken);
    }
  }, [newAccessToken, setAccessToken]);

  // Setup automatic token refresh
  useEffect(() => {
    if (!user) return;

    // Refresh every 10 minutes
    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.accessToken) {
            setAccessToken(data.accessToken);
          }
        } else {
          // Refresh failed, clear state
          clearAccessToken();
          setUser(null);
          router.push('/login');
        }
      } catch {
        clearAccessToken();
        setUser(null);
        router.push('/login');
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, [user, router, setAccessToken, clearAccessToken]);

  return (
    <InitialUserContext.Provider value={{ user, newAccessToken }}>
      {children}
    </InitialUserContext.Provider>
  );
}

/**
 * Hook to get initial user (for client components)
 */
export function useInitialUser() {
  const context = useContext(InitialUserContext);
  if (context === undefined) {
    throw new Error('useInitialUser must be used within a ServerAuthProvider');
  }
  return context;
}
