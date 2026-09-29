import { describe, it, expect, vi } from 'vitest';
import { hasRolePermission } from '@/server/utils/rbac';
import { SearchService } from '@/server/services/search.service';
import { IssueService } from '@/server/services/issue.service';
import { Issue } from '@/server/models/Issue';
import { User } from '@/server/models/User';
import { AuditLog } from '@/server/models/AuditLog';

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
          assignedTo: 'staff_1_id',
          status: 'Reported',
        },
        {
          _id: 'issue_user_b_1',
          title: 'Student B test issue',
          reporter: 'user_b_id',
          assignedTo: 'staff_2_id',
          status: 'In_Progress',
        },
      ];

      let filtered = mockData;
      if (queryObj.reporter) {
        filtered = filtered.filter((i) => i.reporter === queryObj.reporter);
      }
      if (queryObj.assignedTo) {
        filtered = filtered.filter((i) => i.assignedTo === queryObj.assignedTo);
      }

      return {
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            populate: vi.fn().mockReturnValue({
              populate: vi.fn().mockResolvedValue(filtered),
            }),
          }),
        }),
      };
    }),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/server/models/User', () => ({
  User: {
    findById: vi.fn(),
  },
}));

vi.mock('@/server/models/AuditLog', () => ({
  AuditLog: {
    create: vi.fn().mockResolvedValue(true),
  },
}));

describe('CampusConnect Workflow & RBAC Enforcement Tests', () => {
  it('1. Student cannot pass Administrator role checks', () => {
    expect(hasRolePermission('Student', 'Administrator')).toBe(false);
  });

  it('2. Staff cannot pass Administrator role checks', () => {
    expect(hasRolePermission('Staff', 'Administrator')).toBe(false);
  });

  it('3. Administrator passes Administrator role checks', () => {
    expect(hasRolePermission('Administrator', 'Administrator')).toBe(true);
  });

  it('4. Student issue queries filter strictly by reporterId (Data Isolation)', async () => {
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

  it('6. Staff issue queries filter strictly by assignedTo (Staff Data Isolation)', async () => {
    const staff1Data = await SearchService.searchIssues({ assignedTo: 'staff_1_id' });
    expect(staff1Data.results.length).toBe(1);
    expect(staff1Data.results[0].title).toBe('Student A test issue');

    const staff2Data = await SearchService.searchIssues({ assignedTo: 'staff_2_id' });
    expect(staff2Data.results.length).toBe(1);
    expect(staff2Data.results[0].title).toBe('Student B test issue');
  });

  it('7. Staff cannot see another Staff member assigned issues when filtering by assignedTo', async () => {
    const staff1Data = await SearchService.searchIssues({ assignedTo: 'staff_1_id' });
    expect(staff1Data.results.some((i: any) => i.assignedTo === 'staff_2_id')).toBe(false);
  });

  it('8. Student attempting to assign staff receives 403', async () => {
    await expect(
      IssueService.assignIssue('issue1', 'staff1', 'student1', 'Student')
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('Only Administrators can assign issues'),
    });
  });

  it('9. Staff attempting to assign staff receives 403', async () => {
    await expect(
      IssueService.assignIssue('issue1', 'staff2', 'staff1', 'Staff')
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('Only Administrators can assign issues'),
    });
  });

  it('10. Staff attempting to update an issue not assigned to them and outside department receives 403', async () => {
    const mockIssue = {
      _id: 'issue_staff_other',
      status: 'Assigned',
      assignedTo: 'staff_2_id',
      department: 'IT Services',
      category: 'IT Services',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);
    vi.mocked(User.findById).mockResolvedValue({
      _id: 'staff_1_id',
      role: 'Staff',
      department: 'Facilities',
    } as any);

    await expect(
      IssueService.updateStatus('issue_staff_other', 'staff_1_id', 'Staff', 'In_Progress')
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('Staff can only update issues within their assigned department'),
    });
  });
});

