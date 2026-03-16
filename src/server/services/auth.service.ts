import { db } from '@/server/db';
import { users } from '@/server/db/schema/user';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { signJwt, verifyJwt } from '@/server/utils/jwt';
import { redis } from '@/server/utils/redis';
import { env } from '@/env';
import { emailService } from '@/lib/email/email-service';
import { VerifyEmail, PasswordResetOtp } from '@/lib/email/emails';

// Types
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 12);

    // Create user
    const [user] = await db.insert(users).values({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      phoneNumber: input.phoneNumber,
      profileImageUrl: input.profileImageUrl,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    });

    // Generate email verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification OTP in Redis with 24 hour expiration
    await redis.set(`verification:${user.id}`, otp, 'EX', 60 * 60 * 24);

    // Send verification email with OTP
    await emailService.sendReactEmail({
      to: user.email,
      subject: 'Verify your email - Hamsoya',
      emailComponent: VerifyEmail({
        userName: user.name,
        otpCode: otp,
        brandName: 'Hamsoya',
        expiresIn: '24 hours',
      }),
    });

    return {
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  },

  /**
   * Verify email with OTP
   */
  async verifyEmail(otp: string, userId?: string, email?: string) {
    try {
      
      // If userId is provided, use it directly
      // Otherwise, try to find user by email
      let lookupKey = '';
      let verifiedUserId = userId;

      if (userId) {
        lookupKey = `verification:${userId}`;
      } else if (email) {
        // Find user by email to get userId
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (!user) {
          throw new Error('User not found');
        }
        lookupKey = `verification:${user.id}`;
        verifiedUserId = user.id;
      } else {
        throw new Error('User ID or email is required');
      }

      console.log('Looking up Redis key:', lookupKey);

      const storedOtp = await redis.get(lookupKey);

      console.log('Stored OTP:', storedOtp, 'Provided OTP:', otp, 'Match:', storedOtp === otp);

      // Strict comparison - ensure both are strings and match exactly
      if (!storedOtp || String(storedOtp).trim() !== String(otp).trim()) {
        console.log('OTP mismatch - stored:', storedOtp, 'provided:', otp);
        throw new Error('Invalid or expired OTP');
      }

      if (!verifiedUserId) {
        throw new Error('User not found');
      }

      console.log('Updating user:', verifiedUserId, 'emailVerified to true');

      // Update user emailVerified to true
      const updateResult = await db.update(users)
        .set({ emailVerified: true })
        .where(eq(users.id, verifiedUserId));

      console.log('Update result:', updateResult);

      // Verify the update worked by fetching the user
      const updatedUser = await db.query.users.findFirst({
        where: eq(users.id, verifiedUserId),
      });

      console.log('User after update:', updatedUser?.emailVerified);

      // Delete verification OTP from Redis
      await redis.del(lookupKey);

      console.log('Email verified successfully');
      return {
        success: true,
        message: 'Email verified successfully.',
      };
    } catch (error: any) {
      console.log('Verification error:', error.message);
      // Only throw 'Invalid or expired OTP' for actual OTP mismatch errors
      // Otherwise, re-throw the original error for better debugging
      if (error.message === 'Invalid or expired OTP') {
        throw error;
      }
      throw new Error('Verification failed. Please try again.');
    }
  },

  /**
   * Verify email with token (legacy - kept for backward compatibility)
   */
  async verifyEmailWithToken(token: string) {
    try {
      const payload = verifyJwt(token);

      if (payload.type !== 'email_verification') {
        throw new Error('Invalid token type');
      }

      const userId = payload.userId;

      // Update user emailVerified to true
      await db.update(users)
        .set({ emailVerified: true })
        .where(eq(users.id, userId));

      // Delete verification token from Redis
      await redis.del(`verification:${userId}`);

      return {
        success: true,
        message: 'Email verified successfully.',
      };
    } catch (error: any) {
      throw new Error('Invalid or expired token');
    }
  },

  /**
   * Verify email with OTP (alternative method)
   */
  async verifyEmailWithOtp(userId: string, otp: string) {
    const storedOtp = await redis.get(`verification:${userId}`);

    if (!storedOtp || storedOtp !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    // Update user emailVerified to true
    await db.update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userId));

    // Delete OTP from Redis
    await redis.del(`verification:${userId}`);

    return {
      success: true,
      message: 'Email verified successfully.',
    };
  },

  /**
   * Resend email verification OTP
   */
  async resendVerificationOtp(userId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 24 hour expiration (same key as initial verification)
    await redis.set(`verification:${user.id}`, otp, 'EX', 60 * 60 * 24);

    // Send OTP email
    await emailService.sendReactEmail({
      to: user.email,
      subject: 'Your verification code - Hamsoya',
      emailComponent: VerifyEmail({
        userName: user.name,
        otpCode: otp,
        brandName: 'Hamsoya',
        expiresIn: '24 hours',
      }),
    });

    return {
      success: true,
      message: 'Verification OTP sent successfully.',
    };
  },

  /**
   * Login user
   */
  async login(input: LoginInput) {
    // Find user
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.email, input.email),
        eq(users.isDeleted, false)
      ),
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(input.password, user.password);

    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is disabled. Please contact support.');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error('Please verify your email first');
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

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    // Find user
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.email, email),
        eq(users.isDeleted, false)
      ),
    });

    if (!user) {
      // Don't reveal if the user exists or not
      return { success: true, message: 'If the email exists, an OTP has been sent.' };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 10 minute expiration
    await redis.set(`otp:${user.id}`, otp, 'EX', 60 * 10);

    // Send password reset OTP email
    await emailService.sendReactEmail({
      to: user.email,
      subject: 'Reset your password - Hamsoya',
      emailComponent: PasswordResetOtp({
        userName: user.name,
        otp,
        brandName: 'Hamsoya',
        expiresIn: '10 minutes',
      }),
    });

    return {
      success: true,
      message: 'If the email exists, an OTP has been sent.',
    };
  },

  /**
   * Verify password reset OTP
   */
  async verifyResetOtp(email: string, otp: string) {
    // Find user
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.email, email),
        eq(users.isDeleted, false)
      ),
    });

    if (!user) {
      throw new Error('Invalid OTP');
    }

    // Verify OTP
    const storedOtp = await redis.get(`otp:${user.id}`);

    if (!storedOtp || storedOtp !== otp) {
      throw new Error('Invalid OTP');
    }

    // Delete OTP from Redis
    await redis.del(`otp:${user.id}`);

    // Generate a temporary token to reset password (valid for 15 minutes)
    const resetToken = signJwt(
      { userId: user.id, email: user.email, type: 'password_reset' },
      '15m'
    );

    // Store reset token in Redis with 15 minute expiration
    await redis.set(`password_reset:${user.id}`, resetToken, 'EX', 60 * 15);

    return {
      success: true,
      resetToken,
    };
  },

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = verifyJwt(token);

      if (payload.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }

      const userId = payload.userId;

      // Find user
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId));

      // Delete all refresh tokens for this user (logout from all devices)
      await redis.del(`refresh:${userId}`);

      // Delete password reset token
      await redis.del(`password_reset:${userId}`);

      return {
        success: true,
        message: 'Password reset successful.',
      };
    } catch (error: any) {
      throw new Error('Invalid or expired token');
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyJwt(refreshToken);

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const userId = payload.userId;

      // Verify that the refresh token is valid and matches the one in Redis
      const storedToken = await redis.get(`refresh:${userId}`);

      if (storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access and refresh tokens
      const user = await db.query.users.findFirst({
        where: and(
          eq(users.id, userId),
          eq(users.isDeleted, false)
        ),
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.isActive) {
        throw new Error('Account is disabled');
      }

      const newAccessToken = signJwt({
        userId: user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      });

      const newRefreshToken = signJwt(
        { userId: user.id, email: user.email, role: user.role, type: 'refresh' },
        env.JWT_REFRESH_TOKEN_EXPIRES_IN
      );

      // Update refresh token in Redis
      await redis.set(`refresh:${user.id}`, newRefreshToken, 'EX', 60 * 60 * 24 * 7);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      throw new Error('Invalid refresh token');
    }
  },

  /**
   * Logout user
   */
  async logout(refreshToken?: string) {
    if (refreshToken) {
      try {
        const payload = verifyJwt(refreshToken);

        if (payload.type !== 'refresh') {
          throw new Error('Invalid token type');
        }

        const userId = payload.userId;

        // Delete refresh token from Redis
        await redis.del(`refresh:${userId}`);
      } catch (error) {
        // Token is invalid, but we still return success
      }
    }

    return {
      success: true,
      message: 'Logged out successfully.',
    };
  },

  /**
   * Validate access token
   */
  async validateToken(token: string) {
    try {
      const payload = verifyJwt(token);

      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      const user = await db.query.users.findFirst({
        where: and(
          eq(users.id, payload.userId),
          eq(users.isDeleted, false)
        ),
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error: any) {
      throw new Error('Invalid token');
    }
  },
};
