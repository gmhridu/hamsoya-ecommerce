import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { env } from "@/env";
import { db } from "@/server/db";
import { redis } from "@/server/utils/redis";
import { verifyJwt } from "@/server/utils/jwt";
import { cookies } from "next/headers";

/**
 * Represents the session data
 */
export interface Session {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Creates the tRPC context for each request
 */
export async function createContext(opts: CreateNextContextOptions) {
  // Extract token from headers or cookies
  const { req, res } = opts;

  let token: string | null = null;

  // Try to get token from Authorization header first
  const authHeader = req.headers.authorization;
  token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  // If no header token, try to get from cookie
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get("auth-token")?.value ?? null; // ✅ coerce undefined to null
  }

  let session: Session | null = null;

  if (token) {
    try {
      const payload = await verifyJwt(token);
      session = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        iat: payload.iat as number,
        exp: payload.exp as number,
      };
    } catch (err) {
      // Invalid token
      session = null;
    }
  }

  return {
    req,
    res,
    session,
    db,
    redis,
  };
}

/**
 * Type definition for the context
 */
export type Context = Awaited<ReturnType<typeof createContext>>;
