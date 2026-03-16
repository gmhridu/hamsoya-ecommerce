import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { env } from '@/env';

export interface CustomJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Sign a JWT token
 * @param payload - The payload to sign (must include userId, email, role)
 * @param expiresIn - The expiration time (default from env)
 * @returns The signed token
 */
export function signJwt(
  payload: Omit<CustomJwtPayload, 'iat' | 'exp'>,
  expiresIn: string = env.JWT_ACCESS_TOKEN_EXPIRES_IN
): string {
  return sign(payload, env.JWT_SECRET as any, { expiresIn: expiresIn as any, algorithm: 'HS256' as any });
}

/**
 * Verify a JWT token
 * @param token - The token to verify
 * @returns The decoded payload
 */
export function verifyJwt(token: string): CustomJwtPayload {
  const payload = verify(token, env.JWT_SECRET as any) as CustomJwtPayload;
  // We know the token contains our expected fields because we signed it
  return payload;
}
