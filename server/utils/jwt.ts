import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { UserRole } from '../models/User';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'campus_connect_jwt_super_secret_key_2026_production_secure_min_32_chars!'
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'campus_connect_jwt_refresh_super_secret_key_2026_production_secure_min_32_chars!'
);

export interface JWTPayload {
  sub: string;
  role: UserRole;
  sessionVersion: number;
  iat?: number;
  exp?: number;
}

export interface RefreshJWTPayload {
  sub: string;
  jti: string;
  iat?: number;
  exp?: number;
}

export async function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: { sub: string; jti: string }): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as unknown as RefreshJWTPayload;
  } catch {
    return null;
  }
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

/**
 * Pre-digests raw refresh token with SHA-256 and hashes with bcrypt (cost 12)
 */
export async function hashRefreshToken(rawRefreshToken: string): Promise<string> {
  const digest = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  return bcrypt.hash(digest, 12);
}

/**
 * Compares raw refresh token against stored bcrypt hash of SHA-256 digest
 */
export async function compareRefreshToken(rawRefreshToken: string, storedHash: string): Promise<boolean> {
  const digest = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  return bcrypt.compare(digest, storedHash);
}
