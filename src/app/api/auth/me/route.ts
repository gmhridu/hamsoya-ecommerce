import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { verifyJwt } from '@/server/utils/jwt';
import { redis } from '@/server/utils/redis';
import { getAccessTokenCookieOptions, REFRESH_TOKEN_COOKIE_NAME } from '@/lib/auth/token-store';

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Uses HTTP-only cookie for authentication
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Try to get access token from cookie
    const accessToken = cookieStore.get('access-token')?.value;

    // Try to get refresh token from cookie
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

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
              const { signJwt } = await import('@/server/utils/jwt');
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

    const response = NextResponse.json({
      user,
    });

    // If we have a new access token, set it in the response cookie
    if (newAccessToken) {
      response.cookies.set('access-token', newAccessToken, getAccessTokenCookieOptions());
    }

    return response;
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
