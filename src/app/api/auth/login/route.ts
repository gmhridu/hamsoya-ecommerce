import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/server/utils/jwt';
import { redis } from '@/server/utils/redis';
import { env } from '@/env';
import { REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenCookieOptions, getAccessTokenCookieOptions } from '@/lib/auth/token-store';

/**
 * POST /api/auth/login
 * Login user with email and password
 * Sets HTTP-only cookies for refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.email, email),
        eq(users.isDeleted, false)
      ),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is disabled. Please contact support.' },
        { status: 403 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email first', code: 'EMAIL_NOT_VERIFIED' },
        { status: 403 }
      );
    }

    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Generate access and refresh tokens
    const accessToken = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    });

    const refreshToken = signJwt(
      { userId: user.id, email: user.email, role: user.role, type: 'refresh' },
      env.JWT_REFRESH_TOKEN_EXPIRES_IN
    );

    // Store refresh token in Redis
    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 60 * 60 * 24 * 7); // 7 days

    // Create response with cookies
    const response = NextResponse.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });

    // Set refresh token in HTTP-only cookie
    response.cookies.set(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      getRefreshTokenCookieOptions()
    );

    // Set access token in HTTP-only cookie (for server-side)
    response.cookies.set(
      'access-token',
      accessToken,
      getAccessTokenCookieOptions()
    );

    return response;
  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
