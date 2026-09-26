import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const authIpLimits = new Map<string, RateLimitRecord>();
const apiUserLimits = new Map<string, RateLimitRecord>();

/**
 * IP-based Rate Limiter for Authentication Attempts
 * Limit: 10 attempts per 10-minute window (Requirement 16.5)
 */
export function checkAuthIpRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 10;

  const record = authIpLimits.get(ip);

  if (!record || now > record.resetTime) {
    authIpLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

/**
 * User/IP-based Rate Limiter for API Requests
 * Limit: 100 requests per 60-second window (Requirement 16.4)
 */
export function checkApiRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 60 seconds
  const maxRequests = 100;

  const record = apiUserLimits.get(identifier);

  if (!record || now > record.resetTime) {
    apiUserLimits.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds, retryAfter: retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

export const checkUserRateLimit = checkApiRateLimit;

export function createRateLimitResponse(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
      },
    }
  );
}
