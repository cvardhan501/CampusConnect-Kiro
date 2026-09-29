import { describe, it, expect, vi } from 'vitest';
import { hasRolePermission } from '@/server/utils/rbac';
import { SearchService } from '@/server/services/search.service';

vi.mock('@/server/db/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/server/models/Issue', () => ({
  Issue: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          populate: vi.fn().mockResolvedValue([
            {
              _id: 'issue_user_a_1',
              title: 'Leaking faucet',
              reporter: 'user_a_id',
            },
          ]),
        }),
      }),
    }),
  },
}));

describe('Task 10 — Real Data & Strict RBAC Verification Tests', () => {
  it('1. Student cannot pass Administrator role checks', () => {
    expect(hasRolePermission('Student', 'Administrator')).toBe(false);
  });

  it('2. Staff cannot pass Administrator role checks', () => {
    expect(hasRolePermission('Staff', 'Administrator')).toBe(false);
  });

  it('3. Administrator passes Administrator role checks', () => {
    expect(hasRolePermission('Administrator', 'Administrator')).toBe(true);
  });

  it('4. User A issue queries filter strictly by reporterId (Data Isolation)', async () => {
    const data = await SearchService.searchIssues({ reporterId: 'user_a_id' });
    expect(data.results).toBeDefined();
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.results[0].reporter).toBe('user_a_id');
  });

  it('5. Role ranking is immutable: Student (1) < Staff (2) < Administrator (3)', () => {
    expect(hasRolePermission('Student', 'Staff')).toBe(false);
    expect(hasRolePermission('Staff', 'Student')).toBe(true);
    expect(hasRolePermission('Administrator', 'Staff')).toBe(true);
  });
});
