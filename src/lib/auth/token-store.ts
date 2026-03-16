import { create } from 'zustand';

/**
 * Token manager that stores access token in memory only (not localStorage)
 * Refresh token is stored in HTTP-only cookie (handled server-side)
 */
interface TokenState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  getAccessToken: () => string | null;
  clearAccessToken: () => void;
  isRefreshing: boolean;
  setIsRefreshing: (value: boolean) => void;
}

// In-memory token storage (not localStorage for security)
let accessToken: string | null = null;
let isRefreshing = false;

export const useTokenStore = create<TokenState>((set, get) => ({
  accessToken: null,

  setAccessToken: (token: string | null) => {
    accessToken = token;
    set({ accessToken: token });
  },

  getAccessToken: () => {
    return accessToken;
  },

  clearAccessToken: () => {
    accessToken = null;
    set({ accessToken: null, isRefreshing: false });
  },

  isRefreshing: false,

  setIsRefreshing: (value: boolean) => {
    isRefreshing = value;
    set({ isRefreshing: value });
  },
}));

/**
 * Cookie management helpers for refresh token (HTTP-only)
 * These are used by the server-side code
 */
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh-token';
export const ACCESS_TOKEN_COOKIE_NAME = 'access-token';

/**
 * Get cookie options for refresh token (HTTP-only, secure, same-site)
 */
export function getRefreshTokenCookieOptions(maxAge: number = 7 * 24 * 60 * 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  };
}

/**
 * Get cookie options for access token (for server-side reads)
 */
export function getAccessTokenCookieOptions(maxAge: number = 15 * 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  };
}
