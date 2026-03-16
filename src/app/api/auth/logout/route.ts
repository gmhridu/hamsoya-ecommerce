import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/server/utils/jwt';
import { redis } from '@/server/utils/redis';
import { REFRESH_TOKEN_COOKIE_NAME } from '@/lib/auth/token-store';

/**
 * POST /api/auth/logout
 * Logout user and invalidate refresh token
 */
export async function POST() {
  try {
    const cookieStore = await cookies();

    // Get refresh token from HTTP-only cookie
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

    // Try to invalidate the refresh token if it exists
    if (refreshToken) {
      try {
        const payload = verifyJwt(refreshToken);

        // Delete refresh token from Redis
        await redis.del(`refresh:${payload.userId}`);
      } catch {
        // Token invalid, ignore
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear cookies
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, '', {
      path: '/',
      expires: new Date(0),
    });

    response.cookies.set('access-token', '', {
      path: '/',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Error in /api/auth/logout:', error);

    // Still return success to clear client-side state
    const response = NextResponse.json({
      success: true,
      message: 'Logged out',
    });

    // Clear cookies
    response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, '', {
      path: '/',
      expires: new Date(0),
    });

    response.cookies.set('access-token', '', {
      path: '/',
      expires: new Date(0),
    });

    return response;
  }
}
