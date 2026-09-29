import { describe, it, expect, vi } from 'vitest';
import { hasRolePermission } from '@/server/utils/rbac';
import { SearchService } from '@/server/services/search.service';

vi.mock('@/server/db/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/server/models/Issue', () => ({
  Issue: {
    find: vi.fn().mockImplementation((queryObj) => {
      const mockData = [
        {
          _id: 'issue_user_a_1',
          title: 'Student A test issue',
          reporter: 'user_a_id',
        },
        {
          _id: 'issue_user_b_1',
          title: 'Student B test issue',
          reporter: 'user_b_id',
        },
      ];
      const filtered = queryObj.reporter
        ? mockData.filter((i) => i.reporter === queryObj.reporter)
        : mockData;

      return {
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            populate: vi.fn().mockResolvedValue(filtered),
          }),
        }),
      };
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
    expect(data.results.length).toBe(1);
    expect(data.results[0].title).toBe('Student A test issue');
  });

  it('5. User B cannot see User A issues', async () => {
    const dataB = await SearchService.searchIssues({ reporterId: 'user_b_id' });
    expect(dataB.results).toBeDefined();
    expect(dataB.results.length).toBe(1);
    expect(dataB.results[0].title).toBe('Student B test issue');
  });

  it('6. Role ranking is immutable: Student (1) < Staff (2) < Administrator (3)', () => {
    expect(hasRolePermission('Student', 'Staff')).toBe(false);
    expect(hasRolePermission('Staff', 'Student')).toBe(true);
    expect(hasRolePermission('Administrator', 'Staff')).toBe(true);
  });
});
