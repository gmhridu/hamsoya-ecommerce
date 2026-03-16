import { cookies } from 'next/headers';
import { db } from '@/server/db';
import { users, cartItems, bookmarks } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyJwt, signJwt } from '@/server/utils/jwt';
import { redis } from '@/server/utils/redis';

/**
 * Get the current user from the server
 * This should be called in Server Components/layouts
 * to ensure auth state is known before rendering
 */
export async function getUser() {
  try {
    const cookieStore = await cookies();

    // Try to get access token from cookie
    let accessToken = cookieStore.get('access-token')?.value;

    // Try to get refresh token from cookie
    const refreshToken = cookieStore.get('refresh-token')?.value;

    let user = null;
    let newAccessToken: string | null = null;

    if (accessToken) {
      // Try to verify access token
      try {
        const payload = verifyJwt(accessToken);

        // Fetch user from database
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, payload.userId),
        });

        if (dbUser && !dbUser.isDeleted && dbUser.isActive) {
          user = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            phoneNumber: dbUser.phoneNumber,
            profileImageUrl: dbUser.profileImageUrl,
            role: dbUser.role,
            emailVerified: dbUser.emailVerified,
          };
        }
      } catch {
        // Access token invalid, try refresh token
        if (refreshToken) {
          try {
            const refreshPayload = verifyJwt(refreshToken);

            // Check if refresh token is in Redis (not invalidated)
            const storedRefreshToken = await redis.get(`refresh:${refreshPayload.userId}`);

            if (storedRefreshToken === refreshToken) {
              // Generate new access token
              newAccessToken = signJwt({
                userId: refreshPayload.userId,
                email: refreshPayload.email,
                role: refreshPayload.role,
                type: 'access',
              });

              // Verify the new token and get user
              const newPayload = verifyJwt(newAccessToken);

              const dbUser = await db.query.users.findFirst({
                where: eq(users.id, newPayload.userId),
              });

              if (dbUser && !dbUser.isDeleted && dbUser.isActive) {
                user = {
                  id: dbUser.id,
                  name: dbUser.name,
                  email: dbUser.email,
                  phoneNumber: dbUser.phoneNumber,
                  profileImageUrl: dbUser.profileImageUrl,
                  role: dbUser.role,
                  emailVerified: dbUser.emailVerified,
                };
              }
            }
          } catch {
            // Refresh failed, user is not authenticated
          }
        }
      }
    }

    return { user, newAccessToken };
  } catch (error) {
    console.error('Error in getServerUser:', error);
    return { user: null, newAccessToken: null };
  }
}

/**
 * Get guest cart from session
 */
export async function getGuestCart(): Promise<ServerCartItem[]> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('cart-session')?.value;

    if (!sessionId) {
      return [];
    }

    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.sessionId, sessionId),
    });

    return items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      price: parseFloat(String(item.productPrice)),
      image: item.productImage || undefined,
      quantity: item.quantity,
    }));
  } catch (error) {
    console.error('Error fetching guest cart:', error);
    return [];
  }
}

/**
 * Server-side user type
 */
export type ServerUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  role: string;
  emailVerified: boolean;
} | null;

/**
 * Cart item for server
 */
export interface ServerCartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

/**
 * Bookmark item for server
 */
export interface ServerBookmarkItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  addedAt: number;
}

/**
 * Get cart for authenticated user
 */
export async function getUserCart(userId: string): Promise<ServerCartItem[]> {
  try {
    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, userId),
    });

    return items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      price: parseFloat(String(item.productPrice)),
      image: item.productImage || undefined,
      quantity: item.quantity,
    }));
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
}

/**
 * Get bookmarks for authenticated user
 */
export async function getUserBookmarks(userId: string): Promise<ServerBookmarkItem[]> {
  try {
    const items = await db.query.bookmarks.findMany({
      where: eq(bookmarks.userId, userId),
    });

    return items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      price: parseFloat(String(item.productPrice) || '0'),
      image: item.productImage || undefined,
      addedAt: new Date(item.addedAt).getTime(),
    }));
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
}
