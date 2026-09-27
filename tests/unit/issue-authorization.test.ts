import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IssueService } from '../../server/services/issue.service';
import { Issue } from '../../server/models/Issue';
import { User } from '../../server/models/User';
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

describe('Issue Status Transition Authorization Tests (updateStatus)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Student attempting a Staff/Admin workflow transition (Reported -> Under_Review) is rejected with 403', async () => {
    const mockIssue = {
      _id: 'issue101',
      status: 'Reported',
      reporter: 'student1',
      category: 'Facilities',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);

    await expect(
      IssueService.updateStatus('issue101', 'student1', 'Student', 'Under_Review')
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining("Role 'Student' is not permitted"),
    });
  });

  it('2. Staff attempting Admin-only assignment transition (Under_Review -> Assigned) is rejected with 403', async () => {
    const mockIssue = {
      _id: 'issue102',
      status: 'Under_Review',
      category: 'Facilities',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);
    vi.mocked(User.findById).mockResolvedValue({
      _id: 'staff1',
      role: 'Staff',
      department: 'Facilities',
    } as any);

    await expect(
      IssueService.updateStatus('issue102', 'staff1', 'Staff', 'Assigned')
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining("Role 'Staff' is not permitted"),
    });
  });

  it('3. Authorized Staff operational transition (Reported -> Under_Review) succeeds when department matches', async () => {
    const mockIssue = {
      _id: 'issue103',
      title: 'Leaking pipe',
      status: 'Reported',
      category: 'Facilities',
      department: 'Facilities',
      reporter: 'student1',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);
    vi.mocked(User.findById).mockResolvedValue({
      _id: 'staff1',
      role: 'Staff',
      department: 'Facilities',
    } as any);

    const updated = await IssueService.updateStatus(
      'issue103',
      'staff1',
      'Staff',
      'Under_Review'
    );

    expect(updated.status).toBe('Under_Review');
    expect(mockIssue.save).toHaveBeenCalled();
    expect(AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        actingUserId: 'staff1',
        actionType: 'ISSUE_STATUS_CHANGED',
        details: { fromStatus: 'Reported', toStatus: 'Under_Review' },
      })
    );
  });

  it('4. Staff operating on an issue outside their department and not assigned to them is rejected with 403', async () => {
    const mockIssue = {
      _id: 'issue104',
      status: 'Reported',
      category: 'IT Services',
      department: 'IT Services',
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
      IssueService.updateStatus('issue104', 'staff1', 'Staff', 'Under_Review')
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('Staff can only update issues within their assigned department'),
    });
  });

  it('5. Administrator performing Under_Review -> Assigned is allowed', async () => {
    const mockIssue = {
      _id: 'issue105',
      title: 'Broken chair',
      status: 'Under_Review',
      reporter: 'student1',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);

    const updated = await IssueService.updateStatus(
      'issue105',
      'admin1',
      'Administrator',
      'Assigned'
    );

    expect(updated.status).toBe('Assigned');
    expect(mockIssue.save).toHaveBeenCalled();
  });

  it('6. Invalid lifecycle transition (Reported -> Resolved) is rejected with 422', async () => {
    const mockIssue = {
      _id: 'issue106',
      status: 'Reported',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);

    await expect(
      IssueService.updateStatus(
        'issue106',
        'admin1',
        'Administrator',
        'Resolved',
        'This is a valid length resolution note for testing 20 chars'
      )
    ).rejects.toMatchObject({
      statusCode: 422,
      message: expect.stringContaining('Invalid status transition from Reported to Resolved'),
    });
  });

  it('7. Student attempting Resolved -> Reported after 7-day verification window expires is rejected with 422', async () => {
    const expiredDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
    const mockIssue = {
      _id: 'issue107',
      status: 'Resolved',
      reporter: 'student1',
      verificationWindowExpiresAt: expiredDate,
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);

    await expect(
      IssueService.updateStatus('issue107', 'student1', 'Student', 'Reported')
    ).rejects.toMatchObject({
      statusCode: 422,
      message: expect.stringContaining('The 7-day verification window has expired'),
    });
  });

  it('8. Original student submitter reopening within 7-day window (Resolved -> Reported) succeeds', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day in future
    const mockIssue = {
      _id: 'issue108',
      title: 'Broken desk',
      status: 'Resolved',
      reporter: 'student1',
      verificationWindowExpiresAt: futureDate,
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);

    const updated = await IssueService.updateStatus(
      'issue108',
      'student1',
      'Student',
      'Reported'
    );

    expect(updated.status).toBe('Reported');
    expect(mockIssue.save).toHaveBeenCalled();
  });

  it('9. Non-submitter student attempting Resolved -> Verified is rejected with 403', async () => {
    const mockIssue = {
      _id: 'issue109',
      status: 'Resolved',
      reporter: 'student1',
      save: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(Issue.findById).mockResolvedValue(mockIssue as any);

    await expect(
      IssueService.updateStatus('issue109', 'student2_attacker', 'Student', 'Verified')
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('Only the original submitter can verify or reopen'),
    });
  });
});
