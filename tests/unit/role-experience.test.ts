import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IssueService } from '../../server/services/issue.service';
import { ClaimService } from '../../server/services/claim.service';
import { hasRolePermission } from '../../server/utils/rbac';
import { Issue } from '../../server/models/Issue';
import { User } from '../../server/models/User';
import { Claim } from '../../server/models/Claim';
import { AuditLog } from '../../server/models/AuditLog';
import { NotificationService } from '../../server/services/notification.service';

vi.mock('../../server/db/connection', () => ({
  connectToDatabase: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../server/models/Issue', () => ({
  Issue: {
    findById: vi.fn(),
  },
}));

vi.mock('../../server/models/User', () => ({
  User: {
    findById: vi.fn(),
  },
}));

vi.mock('../../server/models/Claim', () => ({
  Claim: {
    findById: vi.fn(),
    find: vi.fn().mockResolvedValue([]),
    updateMany: vi.fn().mockResolvedValue({ acknowledged: true }),
  },
}));

vi.mock('../../server/models/AuditLog', () => ({
  AuditLog: {
    create: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../../server/services/notification.service', () => ({
  NotificationService: {
    create: vi.fn().mockResolvedValue(true),
  },
}));

describe('Role-Based CampusConnect Experience Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Student role permissions are scoped (cannot perform staff/admin transitions)', async () => {
    const mockIssue = {
      _id: 'i1',
      status: 'Reported',
      reporter: 'student1',
      category: 'Facilities',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);

    await expect(
      IssueService.updateStatus('i1', 'student1', 'Student', 'Under_Review')
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('2. Student cannot assign issues (assignIssue throws 403)', async () => {
    await expect(
      IssueService.assignIssue('i1', 'staff1', 'student1', 'Student')
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('3. Student can verify/reopen their own resolved issue within the allowed window', async () => {
    const activeWindow = new Date(Date.now() + 86400000);
    const mockIssue = {
      _id: 'i2',
      status: 'Resolved',
      reporter: 'student1',
      verificationWindowExpiresAt: activeWindow,
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);

    const reopened = await IssueService.updateStatus('i2', 'student1', 'Student', 'Reported');
    expect(reopened.status).toBe('Reported');

    // Reset status back to Resolved for testing verify transition
    mockIssue.status = 'Resolved';
    const verified = await IssueService.updateStatus('i2', 'student1', 'Student', 'Verified');
    expect(verified.status).toBe('Verified');
  });

  it('4. Staff can access and update authorized department issues', async () => {
    const mockIssue = {
      _id: 'i3',
      title: 'Plumbing leak',
      status: 'Reported',
      department: 'Facilities',
      category: 'Facilities',
      reporter: 'student1',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);
    vi.mocked(User.findById).mockResolvedValue({
      _id: 'staff1',
      role: 'Staff',
      department: 'Facilities',
    } as any);

    const updated = await IssueService.updateStatus('i3', 'staff1', 'Staff', 'Under_Review');
    expect(updated.status).toBe('Under_Review');
  });

  it('5. Staff cannot access or update out-of-scope department issues', async () => {
    const mockIssue = {
      _id: 'i4',
      status: 'Reported',
      department: 'IT Services',
      category: 'IT Services',
      assignedTo: null,
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);
    vi.mocked(User.findById).mockResolvedValue({
      _id: 'staff1',
      role: 'Staff',
      department: 'Facilities',
    } as any);

    await expect(
      IssueService.updateStatus('i4', 'staff1', 'Staff', 'Under_Review')
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('Staff can only update issues within their assigned department'),
    });
  });

  it('6. Staff cannot perform Under_Review -> Assigned (Admin-only operation)', async () => {
    const mockIssue = {
      _id: 'i5',
      status: 'Under_Review',
      department: 'Facilities',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);
    vi.mocked(User.findById).mockResolvedValue({
      _id: 'staff1',
      role: 'Staff',
      department: 'Facilities',
    } as any);

    await expect(
      IssueService.updateStatus('i5', 'staff1', 'Staff', 'Assigned')
    ).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('7. Administrator can assign issues and perform Under_Review -> Assigned', async () => {
    const mockIssue = {
      _id: 'i6',
      status: 'Under_Review',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);
    vi.mocked(User.findById).mockResolvedValue({
      _id: 'staff1',
      role: 'Staff',
    } as any);

    const assigned = await IssueService.assignIssue('i6', 'staff1', 'admin1', 'Administrator');
    expect(assigned.assignedTo?.toString()).toBe('staff1');
    expect(assigned.status).toBe('Assigned');
  });

  it('8. Administrator-only routes/helpers enforce RBAC hierarchy', () => {
    expect(hasRolePermission('Administrator', 'Administrator')).toBe(true);
    expect(hasRolePermission('Staff', 'Administrator')).toBe(false);
    expect(hasRolePermission('Student', 'Administrator')).toBe(false);
  });

  it('9. Lost & Found claim approvals are restricted to poster, Staff, or Administrator', async () => {
    const mockClaim = {
      _id: 'c1',
      foundItemId: {
        _id: 'item1',
        title: 'Water Bottle',
        reportedBy: 'user_poster',
        status: 'Active',
        save: vi.fn().mockResolvedValue(true),
      },
      claimantId: 'claimant1',
      status: 'Pending',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Claim.findById).mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockClaim),
    } as any);

    // Random student attacker rejected with 403
    await expect(
      ClaimService.approveClaim('c1', 'random_student', 'Student')
    ).rejects.toMatchObject({
      statusCode: 403,
    });

    // Poster or Staff/Admin allowed
    const approvedByStaff = await ClaimService.approveClaim('c1', 'staff1', 'Staff');
    expect(approvedByStaff.status).toBe('Approved');
  });
});
