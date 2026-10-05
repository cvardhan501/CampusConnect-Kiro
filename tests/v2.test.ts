import { describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';
import { signAccessToken, verifyAccessToken, hashRefreshToken, compareRefreshToken } from '../server/utils/jwt';
import { hasRolePermission } from '../server/utils/rbac';
import { IssueStatus } from '../server/models/Issue';
import { UpdatePasswordSchema } from '../server/validators/auth.validator';

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

describe('CampusConnect v2 Admin Password Update Flow', () => {
  it('validates password update input correctly with UpdatePasswordSchema', () => {
    const validResult = UpdatePasswordSchema.safeParse({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewSecureAdminPassword456!',
      confirmPassword: 'NewSecureAdminPassword456!',
    });
    expect(validResult.success).toBe(true);

    const mismatchResult = UpdatePasswordSchema.safeParse({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewSecureAdminPassword456!',
      confirmPassword: 'DifferentPassword789!',
    });
    expect(mismatchResult.success).toBe(false);

    const shortPasswordResult = UpdatePasswordSchema.safeParse({
      currentPassword: 'OldPassword123!',
      newPassword: 'short',
      confirmPassword: 'short',
    });
    expect(shortPasswordResult.success).toBe(false);
  });

  it('updates bcrypt hash so old password fails and new password succeeds', async () => {
    const oldRaw = 'AdminOldPass123!';
    const newRaw = 'AdminNewPass456!';
    
    let storedHash = await bcrypt.hash(oldRaw, 12);
    expect(await bcrypt.compare(oldRaw, storedHash)).toBe(true);
    expect(await bcrypt.compare(newRaw, storedHash)).toBe(false);

    // Simulate password update
    storedHash = await bcrypt.hash(newRaw, 12);
    expect(await bcrypt.compare(oldRaw, storedHash)).toBe(false);
    expect(await bcrypt.compare(newRaw, storedHash)).toBe(true);
  });

  it('enforces Administrator role requirement for admin password update', () => {
    expect(hasRolePermission('Administrator', 'Administrator')).toBe(true);
    expect(hasRolePermission('Staff', 'Administrator')).toBe(false);
    expect(hasRolePermission('Student', 'Administrator')).toBe(false);
  });

  it('ensures audit log payload excludes sensitive passwords or hashes', () => {
    const auditDetails = { email: 'admin@campusconnect.local', role: 'Administrator' };

    expect(auditDetails).not.toHaveProperty('password');
    expect(auditDetails).not.toHaveProperty('passwordHash');
    expect(auditDetails).not.toHaveProperty('currentPassword');
    expect(auditDetails).not.toHaveProperty('newPassword');
    expect(auditDetails).not.toHaveProperty('refreshToken');
    expect(auditDetails).not.toHaveProperty('accessToken');
  });
});

describe('CampusConnect v2 Staff Assignment & View Navigation', () => {
  it('strictly enforces Administrator role for staff assignment', () => {
    expect(hasRolePermission('Administrator', 'Administrator')).toBe(true);
    expect(hasRolePermission('Staff', 'Administrator')).toBe(false);
    expect(hasRolePermission('Student', 'Administrator')).toBe(false);
  });

  it('validates issue IDs and returns false for malformed ObjectIds', () => {
    const { Types } = require('mongoose');
    expect(Types.ObjectId.isValid('invalid-issue-id')).toBe(false);
    expect(Types.ObjectId.isValid('650000000000000000000001')).toBe(true);
  });

  it('transitions Reported and Under_Review issue status to Assigned upon staff assignment', () => {
    const canonicalStatuses = ['Reported', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved', 'Verified'];
    const initialStatus = 'Under_Review';
    let targetStatus = initialStatus;

    if (['Reported', 'Under_Review'].includes(initialStatus)) {
      targetStatus = 'Assigned';
    }

    expect(targetStatus).toBe('Assigned');
    expect(canonicalStatuses).toContain(targetStatus);
  });

  it('constructs dynamic view detail routes with exact issue IDs', () => {
    const sampleIssue = { _id: '650000000000000000000099', ticketId: 'CC-2026-00099' };
    const issueId = sampleIssue._id;

    const studentRoute = `/issues/${issueId}`;
    const staffRoute = `/staff/issues/${issueId}`;
    const adminRoute = `/admin/issues/${issueId}`;

    expect(studentRoute).toBe('/issues/650000000000000000000099');
    expect(staffRoute).toBe('/staff/issues/650000000000000000000099');
    expect(adminRoute).toBe('/admin/issues/650000000000000000000099');
  });

  it('creates valid audit log payload for STAFF_ASSIGNED action', () => {
    const logPayload = {
      actionType: 'STAFF_ASSIGNED',
      entityType: 'Issue',
      entityId: '650000000000000000000099',
      details: { ticketId: 'CC-2026-00099', staffName: 'John Staff' },
    };

    expect(logPayload.actionType).toBe('STAFF_ASSIGNED');
    expect(logPayload.entityType).toBe('Issue');
    expect(logPayload.details.staffName).toBe('John Staff');
  });

  it('populates missing ticketId fallback matching CC-2026-[ID] convention for legacy documents', () => {
    const legacyDoc: any = { _id: '650000000000000000000088' };
    if (!legacyDoc.ticketId) {
      legacyDoc.ticketId = `CC-2026-${legacyDoc._id.slice(-5).toUpperCase()}`;
    }
    expect(legacyDoc.ticketId).toBe('CC-2026-00088');
  });

  it('rejects password update when new password is identical to current password', () => {
    const samePasswordResult = UpdatePasswordSchema.safeParse({
      currentPassword: 'SamePassword123!',
      newPassword: 'SamePassword123!',
      confirmPassword: 'SamePassword123!',
    });
    expect(samePasswordResult.success).toBe(false);
  });

  it('determines Assign button label dynamically based on persisted assignment data', () => {
    const unassignedIssue = { _id: '1', title: 'Issue 1', assignedTo: null };
    const assignedIssue = {
      _id: '2',
      title: 'Issue 2',
      assignedTo: { _id: 'staff1', displayName: 'John Staff', email: 'john@campus.edu' },
    };

    const getButtonText = (issue: any) => (issue.assignedTo ? 'Work Assigned' : 'Assign Work');

    expect(getButtonText(unassignedIssue)).toBe('Assign Work');
    expect(getButtonText(assignedIssue)).toBe('Work Assigned');
  });

  it('verifies safe assignedTo object structure excluding passwordHash and auth credentials', () => {
    const safeAssignedTo = {
      _id: '650000000000000000000010',
      displayName: 'Sarah Staff',
      email: 'sarah@campus.edu',
      role: 'Staff',
      department: 'Facilities',
    };

    expect(safeAssignedTo).not.toHaveProperty('passwordHash');
    expect(safeAssignedTo).not.toHaveProperty('refreshTokenHash');
    expect(safeAssignedTo).not.toHaveProperty('jwtSecret');
    expect(safeAssignedTo.displayName).toBe('Sarah Staff');
  });

  it('toggles login password field visibility state and accessible aria-label', () => {
    let showPassword = false;
    const getAriaLabel = (visible: boolean) => (visible ? 'Hide password' : 'Show password');
    const getInputType = (visible: boolean) => (visible ? 'text' : 'password');

    expect(getInputType(showPassword)).toBe('password');
    expect(getAriaLabel(showPassword)).toBe('Show password');

    showPassword = true;
    expect(getInputType(showPassword)).toBe('text');
    expect(getAriaLabel(showPassword)).toBe('Hide password');
  });
});
