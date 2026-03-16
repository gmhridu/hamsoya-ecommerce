import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/server/utils/jwt';
import { redis } from '@/server/utils/redis';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions, getAccessTokenCookieOptions } from '@/lib/auth/token-store';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token (with rotation)
 * Creates a new token pair and invalidates the old refresh token
 */
export async function POST() {
  try {
    const cookieStore = await cookies();

    // Get refresh token from HTTP-only cookie
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    let payload;
    try {
      payload = verifyJwt(refreshToken);
    } catch {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Check if token type is refresh
    if (payload.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      );
    }

    // Check if refresh token is still valid in Redis (not invalidated)
    const storedRefreshToken = await redis.get(`refresh:${payload.userId}`);

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token has been invalidated' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user || user.isDeleted || !user.isActive) {
      // Invalidate the refresh token
      await redis.del(`refresh:${payload.userId}`);

      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Generate new token pair (token rotation)
    const { signJwt } = await import('@/server/utils/jwt');

    const newAccessToken = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    });

    const newRefreshToken = signJwt(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'refresh',
      },
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d'
    );

    // Store new refresh token in Redis (invalidate old one)
    await redis.set(`refresh:${user.id}`, newRefreshToken, 'EX', 60 * 60 * 24 * 7); // 7 days

    // Create response with new tokens
    const response = NextResponse.json({
      accessToken: newAccessToken,
    });

    // Set new refresh token in HTTP-only cookie
    response.cookies.set(
      REFRESH_TOKEN_COOKIE_NAME,
      newRefreshToken,
      getRefreshTokenCookieOptions()
    );

    // Set new access token in HTTP-only cookie (for server-side reads)
    response.cookies.set(
      'access-token',
      newAccessToken,
      getAccessTokenCookieOptions()
    );

    return response;
  } catch (error) {
    console.error('Error in /api/auth/refresh:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
