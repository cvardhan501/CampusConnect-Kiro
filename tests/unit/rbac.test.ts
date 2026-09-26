import { describe, it, expect } from 'vitest';
import { hasRolePermission } from '@/server/utils/rbac';

describe('Phase 2 - Role-Based Access Control (RBAC) Unit Tests', () => {
  it('should enforce hierarchy: Administrator > Staff > Student', () => {
    expect(hasRolePermission('Administrator', 'Student')).toBe(true);
    expect(hasRolePermission('Administrator', 'Staff')).toBe(true);
    expect(hasRolePermission('Administrator', 'Administrator')).toBe(true);

    expect(hasRolePermission('Staff', 'Student')).toBe(true);
    expect(hasRolePermission('Staff', 'Staff')).toBe(true);
    expect(hasRolePermission('Staff', 'Administrator')).toBe(false);

    expect(hasRolePermission('Student', 'Student')).toBe(true);
    expect(hasRolePermission('Student', 'Staff')).toBe(false);
    expect(hasRolePermission('Student', 'Administrator')).toBe(false);
  });
});
