import { z } from "zod";
import { t, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { authService } from "@/server/services/auth.service";

export const authRouter = t.router({
  /**
   * Register a new user
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.email(),
        password: z.string().min(8).max(255),
        phoneNumber: z.string().max(20).optional().nullable(),
        profileImageUrl: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        // Convert empty strings to undefined for optional fields
        const sanitizedInput = {
          name: input.name,
          email: input.email,
          password: input.password,
          phoneNumber: input.phoneNumber || undefined,
          profileImageUrl: input.profileImageUrl || undefined,
        };
        return await authService.register(sanitizedInput);
      } catch (error: any) {
        if (error.message === "User already exists") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Registration failed",
        });
      }
    }),

  /**
   * Verify email with OTP
   */
  verifyEmail: publicProcedure
    .input(
      z.object({
        otp: z.string().length(6),
        userId: z.uuid().optional(),
        email: z.email().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await authService.verifyEmail(
          input.otp,
          input.userId,
          input.email,
        );
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Invalid or expired OTP",
        });
      }
    }),

  /**
   * Resend verification OTP
   */
  resendVerificationOtp: publicProcedure
    .input(
      z.object({
        userId: z.uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await authService.resendVerificationOtp(input.userId);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to resend OTP",
        });
      }
    }),

  /**
   * Login user
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await authService.login(input);
      } catch (error: any) {
        if (error.message === "Please verify your email first") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: error.message,
          });
        }
        if (error.message === "Account is disabled. Please contact support.") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error.message || "Invalid email or password",
        });
      }
    }),

  /**
   * Request password reset
   */
  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.email(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await authService.forgotPassword(input.email);
      } catch (error: any) {
        // Don't reveal if the user exists or not
        return {
          success: true,
          message: "If the email exists, an OTP has been sent.",
        };
      }
    }),

  /**
   * Verify password reset OTP
   */
  verifyResetOtp: publicProcedure
    .input(
      z.object({
        email: z.email(),
        otp: z.string().length(6),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await authService.verifyResetOtp(input.email, input.otp);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Invalid or expired OTP",
        });
      }
    }),

  /**
   * Reset password using token
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8).max(255),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await authService.resetPassword(input.token, input.password);
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to reset password",
        });
      }
    }),

  /**
   * Refresh access token
   */
  refresh: publicProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        return await authService.refreshToken(input.refreshToken);
      } catch (error: any) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error.message || "Invalid or expired refresh token",
        });
      }
    }),

  /**
   * Logout user
   */
  logout: publicProcedure
    .input(
      z
        .object({
          refreshToken: z.string().optional(),
        })
        .optional(),
    )
    .mutation(async ({ input }) => {
      try {
        // Invalidate refresh token in Redis
        if (input?.refreshToken) {
          try {
            const { verifyJwt } = await import('@/server/utils/jwt');
            const payload = verifyJwt(input.refreshToken);
            const { redis } = await import('@/server/utils/redis');
            await redis.del(`refresh:${payload.userId}`);
          } catch {
            // Ignore errors
          }
        }

        return { success: true, message: 'Logged out successfully' };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to logout",
        });
      }
    }),
});
