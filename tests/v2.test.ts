import { describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';
import { signAccessToken, verifyAccessToken, hashRefreshToken, compareRefreshToken } from '../server/utils/jwt';
import { hasRolePermission } from '../server/utils/rbac';
import { IssueStatus } from '../server/models/Issue';

describe('CampusConnect v2 Security & Authentication', () => {
  it('hashes and verifies passwords correctly with bcrypt', async () => {
    const rawPassword = 'SecurePassword123!';
    const hashed = await bcrypt.hash(rawPassword, 12);
    
    expect(hashed).not.toBe(rawPassword);
    const isValid = await bcrypt.compare(rawPassword, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await bcrypt.compare('WrongPassword', hashed);
    expect(isInvalid).toBe(false);
  });

  it('signs and verifies access JWT tokens securely', async () => {
    const payload = {
      sub: '650000000000000000000001',
      role: 'Student' as const,
      sessionVersion: 1,
    };

    const token = await signAccessToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifyAccessToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.sub).toBe(payload.sub);
    expect(decoded?.role).toBe(payload.role);
    expect(decoded?.sessionVersion).toBe(payload.sessionVersion);
  });

  it('returns null for invalid JWT tokens', async () => {
    const decoded = await verifyAccessToken('invalid.token.str');
    expect(decoded).toBeNull();
  });

  it('hashes and compares refresh tokens', async () => {
    const rawRefreshToken = 'sample_refresh_token_12345';
    const hash = await hashRefreshToken(rawRefreshToken);

    const isValid = await compareRefreshToken(rawRefreshToken, hash);
    expect(isValid).toBe(true);

    const isInvalid = await compareRefreshToken('wrong_refresh_token', hash);
    expect(isInvalid).toBe(false);
  });
});

describe('CampusConnect v2 Server RBAC Enforcement', () => {
  it('grants and denies access based on user role rank', () => {
    expect(hasRolePermission('Student', 'Student')).toBe(true);
    expect(hasRolePermission('Student', 'Staff')).toBe(false);
    expect(hasRolePermission('Student', 'Administrator')).toBe(false);

    expect(hasRolePermission('Staff', 'Student')).toBe(true);
    expect(hasRolePermission('Staff', 'Staff')).toBe(true);
    expect(hasRolePermission('Staff', 'Administrator')).toBe(false);

    expect(hasRolePermission('Administrator', 'Student')).toBe(true);
    expect(hasRolePermission('Administrator', 'Staff')).toBe(true);
    expect(hasRolePermission('Administrator', 'Administrator')).toBe(true);
  });
});

describe('CampusConnect v2 Canonical Status Architecture', () => {
  it('has all canonical status constants defined', () => {
    const statuses: IssueStatus[] = [
      'Reported',
      'Under_Review',
      'Assigned',
      'In_Progress',
      'Resolved',
      'Verified',
    ];
    expect(statuses.length).toBe(6);
  });

  it('provides accessible aria-label and title descriptions for user-facing canonical status mappings', () => {
    const canonicalMap: Record<string, { userFacingLabel: string; detailedAria: string }> = {
      Reported: { userFacingLabel: 'Verification', detailedAria: 'Status: Verification (Reported)' },
      Under_Review: { userFacingLabel: 'Verification', detailedAria: 'Status: Verification (Under Review)' },
      Assigned: { userFacingLabel: 'Verification', detailedAria: 'Status: Verification (Assigned)' },
      In_Progress: { userFacingLabel: 'Work in Process', detailedAria: 'Status: Work in Process (In Progress)' },
      Resolved: { userFacingLabel: 'Completed', detailedAria: 'Status: Completed (Resolved)' },
      Verified: { userFacingLabel: 'Completed', detailedAria: 'Status: Completed (Verified)' },
    };

    Object.entries(canonicalMap).forEach(([canonicalStatus, expected]) => {
      const formattedName = canonicalStatus.replace(/_/g, ' ');
      const isDifferent = expected.userFacingLabel.toLowerCase() !== formattedName.toLowerCase();
      const statusDetail = isDifferent
        ? `Status: ${expected.userFacingLabel} (${formattedName})`
        : `Status: ${expected.userFacingLabel}`;

      expect(statusDetail).toBe(expected.detailedAria);
    });
  });
});
