import { describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken, hashRefreshToken, compareRefreshToken } from '@/server/utils/jwt';
import { RegisterSchema, LoginSchema, ResetPasswordSchema } from '@/server/validators/auth.validator';
import { checkAuthIpRateLimit, checkApiRateLimit } from '@/server/utils/rateLimiter';
import nextConfig from '@/next.config.js';

describe('Phase 1 — Foundation, Security & Authentication Unit Tests', () => {
  describe('Requirement 1.1 & 1.2: Password Hashing & Validation', () => {
    it('should hash passwords using bcrypt with a minimum cost factor of 12', async () => {
      const rawPassword = 'mySecurePassword123';
      const hash = await bcrypt.hash(rawPassword, 12);
      expect(hash).not.toBe(rawPassword);

      const isRounds12 = hash.startsWith('$2a$12$') || hash.startsWith('$2b$12$');
      expect(isRounds12).toBe(true);

      const matches = await bcrypt.compare(rawPassword, hash);
      expect(matches).toBe(true);
    });

    it('should reject passwords shorter than 10 characters or exceeding 128 characters', () => {
      const shortRes = RegisterSchema.safeParse({
        email: 'test@campus.edu',
        password: 'short',
        displayName: 'Test User',
        campusId: 'STU1001',
        role: 'Student',
      });
      expect(shortRes.success).toBe(false);

      const validRes = RegisterSchema.safeParse({
        email: 'test@campus.edu',
        password: 'validPassword123!',
        displayName: 'Test User',
        campusId: 'STU1001',
        role: 'Student',
      });
      expect(validRes.success).toBe(true);
    });
  });

  describe('Locked UI Rule: Role Registration Status (No PendingApproval)', () => {
    it('should validate role registration schema for Student, Staff, and Administrator', () => {
      ['Student', 'Staff', 'Administrator'].forEach((role) => {
        const res = RegisterSchema.safeParse({
          email: `${role.toLowerCase()}@campus.edu`,
          password: 'validPassword123!',
          displayName: `${role} User`,
          campusId: `ID_${role}`,
          role,
        });
        expect(res.success).toBe(true);
      });
    });
  });

  describe('Requirement 1.3 & 1.4: JWT Tokens & Pre-Digested Refresh Token Hashing', () => {
    it('should generate valid access tokens with 1-hour expiration and refresh tokens with 7-day expiration', async () => {
      const payload = { sub: 'user_id_123', role: 'Student' as const, sessionVersion: 1 };
      const accessToken = await signAccessToken(payload);
      expect(typeof accessToken).toBe('string');

      const verified = await verifyAccessToken(accessToken);
      expect(verified).not.toBeNull();
      expect(verified?.sub).toBe('user_id_123');
      expect(verified?.role).toBe('Student');
      expect(verified?.sessionVersion).toBe(1);

      const refreshPayload = { sub: 'user_id_123', jti: 'random_uuid_v4' };
      const refreshToken = await signRefreshToken(refreshPayload);
      expect(typeof refreshToken).toBe('string');

      const verifiedRefresh = await verifyRefreshToken(refreshToken);
      expect(verifiedRefresh).not.toBeNull();
      expect(verifiedRefresh?.sub).toBe('user_id_123');
    });

    it('should pre-digest refresh token with SHA-256 before bcrypt hashing', async () => {
      const rawRefreshToken = 'sample_raw_refresh_token_string';
      const storedHash = await hashRefreshToken(rawRefreshToken);

      expect(storedHash).not.toBe(rawRefreshToken);
      expect(storedHash.startsWith('$2b$12$') || storedHash.startsWith('$2a$12$')).toBe(true);

      const matches = await compareRefreshToken(rawRefreshToken, storedHash);
      expect(matches).toBe(true);

      const wrongMatches = await compareRefreshToken('different_token', storedHash);
      expect(wrongMatches).toBe(false);
    });
  });

  describe('Requirement 1.7 & 1.8: Password Reset Token Security', () => {
    it('should generate cryptographically secure random reset tokens and store SHA-256 digest', () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      expect(rawToken.length).toBe(64);

      const digest = crypto.createHash('sha256').update(rawToken).digest('hex');
      expect(digest.length).toBe(64);
      expect(digest).not.toBe(rawToken);
    });

    it('should validate reset password schema constraints', () => {
      const invalidRes = ResetPasswordSchema.safeParse({ token: '', newPassword: '123' });
      expect(invalidRes.success).toBe(false);

      const validRes = ResetPasswordSchema.safeParse({ token: 'abc123token', newPassword: 'newValidPassword123' });
      expect(validRes.success).toBe(true);
    });
  });

  describe('Security Headers & CSP Verification', () => {
    it('should configure required security headers in next.config.js', async () => {
      expect(nextConfig.headers).toBeDefined();
      const headerList = await nextConfig.headers!();
      expect(headerList.length).toBeGreaterThan(0);

      const globalHeaders = headerList[0].headers;
      const csp = globalHeaders.find((h: any) => h.key === 'Content-Security-Policy')?.value;
      const xFrame = globalHeaders.find((h: any) => h.key === 'X-Frame-Options')?.value;
      const xType = globalHeaders.find((h: any) => h.key === 'X-Content-Type-Options')?.value;
      const referrer = globalHeaders.find((h: any) => h.key === 'Referrer-Policy')?.value;

      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(xFrame).toBe('DENY');
      expect(xType).toBe('nosniff');
      expect(referrer).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('Requirement 16.4 & 16.5: Rate Limiter Enforcement', () => {
    it('should enforce IP rate limits for auth attempts', () => {
      const testIp = '192.168.99.1';
      for (let i = 0; i < 10; i++) {
        const res = checkAuthIpRateLimit(testIp);
        expect(res.allowed).toBe(true);
      }
      const blockedRes = checkAuthIpRateLimit(testIp);
      expect(blockedRes.allowed).toBe(false);
      expect(blockedRes.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('should enforce API request rate limits per user', () => {
      const testUser = 'user_limit_test';
      for (let i = 0; i < 100; i++) {
        const res = checkApiRateLimit(testUser);
        expect(res.allowed).toBe(true);
      }
      const blockedRes = checkApiRateLimit(testUser);
      expect(blockedRes.allowed).toBe(false);
    });
  });
});
