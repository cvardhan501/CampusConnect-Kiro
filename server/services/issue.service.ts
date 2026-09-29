import { connectToDatabase } from '../db/connection';
import { Issue, IIssue, IssueStatus, IssuePriority, IAttachment } from '../models/Issue';
import { NotificationService } from './notification.service';
import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';
import { AIService } from './ai.service';

// ---------------------------------------------------------------------------
// XSS sanitization (reused from comment.service pattern)
// ---------------------------------------------------------------------------
function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface CreateIssueInput {
  title: string;
  description: string;
  category: string;
  location: string;
  priority: IssuePriority;
  reporterId: string;
  attachments?: IAttachment[];
}

export class IssueService {
  static async createIssue(input: CreateIssueInput): Promise<IIssue> {
    await connectToDatabase();

    const issue = await Issue.create({
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      location: input.location.trim(),
      priority: input.priority,
      status: 'Reported',
      reporter: input.reporterId,
      attachments: input.attachments || [],
      aiTriageStatus: 'Pending',
    });

    // Audit Log
    await AuditLog.create({
      actingUserId: input.reporterId,
      actionType: 'ISSUE_CREATED',
      entityType: 'Issue',
      entityId: issue._id,
      details: { priority: issue.priority, category: issue.category },
      timestamp: new Date(),
    });

    // Non-blocking async side-effects: AI Triage & Notifications
    void (async () => {
      try {
        const triage = await AIService.triageIssue(
          issue.title,
          issue.description,
          issue.category,
          issue.location
        );
        issue.aiSuggestedCategory = triage.suggestedCategory;
        issue.aiSuggestedPriority = triage.suggestedPriority;
        issue.aiTriageStatus = 'Completed';
        await issue.save();

        await AuditLog.create({
          actingUserId: null,
          actionType: 'AI_TRIAGE_COMPLETED',
          entityType: 'Issue',
          entityId: issue._id,
          details: {
            suggestedCategory: triage.suggestedCategory,
            suggestedPriority: triage.suggestedPriority,
          },
          timestamp: new Date(),
        });

        await AIService.findPotentialDuplicateIssues(issue._id.toString());
      } catch (err) {
        console.error('Async AI triage failed:', err);
        // Mark triage as failed — required by Req 14.2
        try {
          await Issue.findByIdAndUpdate(issue._id, { aiTriageStatus: 'Failed' });
          await AuditLog.create({
            actingUserId: null,
            actionType: 'AI_TRIAGE_FAILED',
            entityType: 'Issue',
            entityId: issue._id,
            details: { error: (err as Error).message },
            timestamp: new Date(),
          });
        } catch {
          /* silent — triage status update is best-effort */
        }
      }
    })();

    // Critical Priority Notification — notify Admins + department Staff (Req 3.7/3.8)
    if (input.priority === 'Critical') {
      void (async () => {
        try {
          // Find Staff assigned to the same department first
          const deptStaff = input.category
            ? await User.find({ role: 'Staff', status: 'Active', department: input.category })
            : [];

          const recipientIds: string[] = [];

          if (deptStaff.length > 0) {
            for (const staff of deptStaff) {
              recipientIds.push(staff._id.toString());
              await NotificationService.create({
                userId: staff._id.toString(),
                type: 'CriticalIssueCreated',
                title: 'Critical Safety Issue Reported!',
                message: `CRITICAL: "${issue.title}" at ${issue.location}`,
                link: `/issues/${issue._id}`,
                sendEmail: true,
              });
            }
          }

          // Always notify all Admins too (Req 3.8 says notify admins if no staff;
          // practical choice: always notify admins for Critical regardless)
          const admins = await User.find({ role: 'Administrator', status: 'Active' });
          for (const admin of admins) {
            if (!recipientIds.includes(admin._id.toString())) {
              await NotificationService.create({
                userId: admin._id.toString(),
                type: 'CriticalIssueCreated',
                title: 'Critical Safety Issue Reported!',
                message: `CRITICAL: "${issue.title}" at ${issue.location}`,
                link: `/issues/${issue._id}`,
                sendEmail: true,
              });
            }
          }
        } catch (err) {
          console.error('Critical notification error:', err);
        }
      })();
    }

    return issue;
  }

  // ---------------------------------------------------------------------------
  // Role-aware transition permission map (Req 4.1 + Security steering)
  // ---------------------------------------------------------------------------
  private static readonly ROLE_ALLOWED_TRANSITIONS: Record<string, Record<string, string[]>> = {
    // Students may only confirm/reopen their own resolved issues
    Student: {
      Resolved: ['Verified', 'Reported'],
    },
    // Staff can drive operational transitions (assignment is Admin-only)
    Staff: {
      Reported: ['Under_Review'],
      Under_Review: ['In_Progress'],
      Assigned: ['In_Progress'],
      In_Progress: ['Resolved'],
    },
    // Admins can perform all workflow transitions, including assignment (Under_Review -> Assigned)
    Administrator: {
      Reported: ['Under_Review'],
      Under_Review: ['Assigned', 'In_Progress'],
      Assigned: ['In_Progress'],
      In_Progress: ['Resolved'],
      Resolved: ['Verified', 'Reported'],
    },
  };

  static async updateStatus(
    issueId: string,
    actingUserId: string,
    actingUserRole: string,
    newStatus: IssueStatus,
    resolutionNote?: string,
    resolutionPhotos?: IAttachment[]
  ): Promise<IIssue> {
    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    const currentStatus = issue.status;

    // Full allowed-transitions map (used for basic validity check regardless of role)
    const allAllowedTransitions: Record<string, string[]> = {
      Reported: ['Under_Review'],
      Under_Review: ['Assigned', 'In_Progress'],
      Assigned: ['In_Progress'],
      In_Progress: ['Resolved'],
      Resolved: ['Verified', 'Reported'],
      Verified: [],
    };

    const validNextStatuses = allAllowedTransitions[currentStatus] || [];
    if (!validNextStatuses.includes(newStatus)) {
      // 422 for invalid lifecycle transition (per conventions steering)
      const err = new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
      (err as any).statusCode = 422;
      throw err;
    }

    // Role-level permission check
    const roleTransitions = IssueService.ROLE_ALLOWED_TRANSITIONS[actingUserRole] || {};
    const roleAllowed = roleTransitions[currentStatus] || [];

    if (!roleAllowed.includes(newStatus)) {
      const err = new Error(
        `Role '${actingUserRole}' is not permitted to transition issues from ${currentStatus} to ${newStatus}`
      );
      (err as any).statusCode = 403;
      throw err;
    }

    // Staff department & assignment boundary enforcement (Req 2.3)
    if (actingUserRole === 'Staff') {
      const staffUser = await User.findById(actingUserId);
      const isAssignedToStaff = issue.assignedTo && issue.assignedTo.toString() === actingUserId;
      const issueDept = issue.department || issue.category;
      if (!isAssignedToStaff && staffUser?.department && issueDept && issueDept !== staffUser.department) {
        const err = new Error('Staff can only update issues within their assigned department or assigned to them');
        (err as any).statusCode = 403;
        throw err;
      }
    }

    // Submitter-only restriction for Resolved → * transitions
    if (currentStatus === 'Resolved' && actingUserRole === 'Student') {
      if (issue.reporter.toString() !== actingUserId) {
        const err = new Error('Only the original submitter can verify or reopen their resolved issue');
        (err as any).statusCode = 403;
        throw err;
      }

      // Enforce 7-day verification window for Student reopen (Req 4.6)
      if (newStatus === 'Reported') {
        if (issue.verificationWindowExpiresAt && issue.verificationWindowExpiresAt <= new Date()) {
          const err = new Error(
            'The 7-day verification window has expired. The issue will be auto-verified.'
          );
          (err as any).statusCode = 422;
          throw err;
        }
      }
    }

    // Resolution Note required + XSS-sanitized (Req 4.2, 4.3)
    if (newStatus === 'Resolved') {
      if (!resolutionNote || resolutionNote.trim().length < 20 || resolutionNote.trim().length > 1000) {
        const err = new Error('Transitioning to Resolved requires a resolution note of 20–1000 characters');
        (err as any).statusCode = 400;
        throw err;
      }
      issue.resolutionNote = sanitizeText(resolutionNote.trim());

      if (resolutionPhotos && resolutionPhotos.length > 0) {
        if (resolutionPhotos.length > 3) {
          const err = new Error('Maximum 3 resolution photos permitted');
          (err as any).statusCode = 400;
          throw err;
        }
        issue.resolutionPhotos = resolutionPhotos;
      }

      // Set 7-day Verification Window (Req 4.4)
      issue.verificationWindowExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    issue.status = newStatus;
    await issue.save();

    // Audit Log
    await AuditLog.create({
      actingUserId,
      actionType: 'ISSUE_STATUS_CHANGED',
      entityType: 'Issue',
      entityId: issue._id,
      details: { fromStatus: currentStatus, toStatus: newStatus },
      timestamp: new Date(),
    });

    // Notify Submitter (email for Resolved + Verified)
    void NotificationService.create({
      userId: issue.reporter.toString(),
      type: 'IssueStatusChange',
      title: `Issue Status Updated: ${newStatus}`,
      message: `Your issue "${issue.title}" has been updated to ${newStatus}.`,
      link: `/issues/${issue._id}`,
      sendEmail: ['Resolved', 'Verified'].includes(newStatus),
    });

    return issue;
  }

  // ---------------------------------------------------------------------------
  // Assign issue — Administrator-only (Req design spec + security steering)
  // ---------------------------------------------------------------------------
  static async assignIssue(
    issueId: string,
    staffUserId: string,
    actingUserId: string,
    actingUserRole: string
  ): Promise<IIssue> {
    await connectToDatabase();

    if (actingUserRole !== 'Administrator') {
      const err = new Error('Only Administrators can assign issues');
      (err as any).statusCode = 403;
      throw err;
    }

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    const staffUser = await User.findById(staffUserId);
    if (!staffUser || (staffUser.role !== 'Staff' && staffUser.role !== 'Administrator')) {
      throw new Error('Assigned user must be a Staff member or Administrator');
    }

    const previousAssignee = issue.assignedTo?.toString();
    issue.assignedTo = staffUser._id;
    if (issue.status === 'Reported' || issue.status === 'Under_Review') {
      issue.status = 'Assigned';
    }
    await issue.save();

    // Audit Log (previously missing — Req 15.1)
    await AuditLog.create({
      actingUserId,
      actionType: 'ISSUE_ASSIGNED',
      entityType: 'Issue',
      entityId: issue._id,
      details: {
        assignedTo: staffUser._id,
        assignedToName: staffUser.displayName,
        previousAssignee: previousAssignee || null,
        newStatus: issue.status,
      },
      timestamp: new Date(),
    });

    // Notify Staff Member
    void NotificationService.create({
      userId: staffUser._id.toString(),
      type: 'StaffAssignment',
      title: 'New Issue Assigned to You',
      message: `You have been assigned to issue "${issue.title}" at ${issue.location}.`,
      link: `/issues/${issue._id}`,
      sendEmail: true,
    });

    return issue;
  }

  static async bulkUpdateStatus(
    issueIds: string[],
    actingUserId: string,
    actingUserRole: string,
    newStatus: IssueStatus,
    resolutionNote?: string
  ): Promise<{ updatedCount: number; errors: Array<{ issueId: string; error: string }> }> {
    await connectToDatabase();

    if (issueIds.length > 50) {
      throw new Error('Bulk status update limit is 50 issues per request');
    }

    let updatedCount = 0;
    const errors: Array<{ issueId: string; error: string }> = [];

    for (const issueId of issueIds) {
      try {
        await this.updateStatus(issueId, actingUserId, actingUserRole, newStatus, resolutionNote);
        updatedCount++;
      } catch (err: any) {
        errors.push({ issueId, error: err.message || 'Failed to update issue' });
      }
    }

    return { updatedCount, errors };
  }

  static async checkStaleIssues(): Promise<number> {
    await connectToDatabase();

    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const staleIssues = await Issue.find({
      status: 'Reported',
      createdAt: { $lte: seventyTwoHoursAgo },
      staleReminderSent: { $ne: true },
    });

    if (staleIssues.length === 0) return 0;

    const admins = await User.find({ role: 'Administrator', status: 'Active' });

    for (const issue of staleIssues) {
      for (const admin of admins) {
        await NotificationService.create({
          userId: admin._id.toString(),
          type: 'SystemAlert',
          title: 'Stale Issue Reminder',
          message: `Issue "${issue.title}" has been in Reported status for more than 72 hours.`,
          link: `/issues/${issue._id}`,
          sendEmail: false,
        });
      }
      issue.staleReminderSent = true;
      await issue.save();
    }

    return staleIssues.length;
  }

  static async overrideAITriage(
    issueId: string,
    adminUserId: string,
    newCategory?: string,
    newPriority?: IssuePriority
  ): Promise<IIssue> {
    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    const originalCategory = issue.category;
    const originalPriority = issue.priority;

    if (newCategory) issue.category = newCategory;
    if (newPriority) issue.priority = newPriority;
    issue.aiTriageStatus = 'Overridden';
    await issue.save();

    await AuditLog.create({
      actingUserId: adminUserId,
      actionType: 'AI_TRIAGE_OVERRIDDEN',
      entityType: 'Issue',
      entityId: issue._id,
      details: {
        originalCategory,
        newCategory: issue.category,
        originalPriority,
        newPriority: issue.priority,
      },
      timestamp: new Date(),
    });

    return issue;
  }

  static async mergeDuplicateIssues(
    primaryIssueId: string,
    secondaryIssueId: string,
    adminUserId: string
  ): Promise<{ primaryIssue: IIssue; secondaryIssue: IIssue }> {
    await connectToDatabase();

    const primary = await Issue.findById(primaryIssueId);
    const secondary = await Issue.findById(secondaryIssueId);

    if (!primary || !secondary) throw new Error('Primary or secondary issue not found');
    if (primary._id.toString() === secondary._id.toString()) {
      throw new Error('Cannot merge an issue into itself');
    }

    // Transfer attachments
    if (secondary.attachments && secondary.attachments.length > 0) {
      primary.attachments = [...(primary.attachments || []), ...secondary.attachments];
      await primary.save();
    }

    // Transfer comments from secondary to primary
    const { Comment } = await import('../models/Comment');
    await Comment.updateMany({ parentId: secondary._id }, { parentId: primary._id });

    // Mark secondary issue as Verified per Requirement 13.5
    const oldStatus = secondary.status;
    secondary.status = 'Verified';
    secondary.resolutionNote = sanitizeText(`Merged into primary issue #${primary._id}`);
    await secondary.save();

    // Audit Log
    await AuditLog.create({
      actingUserId: adminUserId,
      actionType: 'DUPLICATE_ISSUE_MERGED',
      entityType: 'Issue',
      entityId: primary._id,
      details: {
        primaryIssueId: primary._id,
        secondaryIssueId: secondary._id,
        secondaryOldStatus: oldStatus,
      },
      timestamp: new Date(),
    });

    // Notify reporter of secondary issue
    void NotificationService.create({
      userId: secondary.reporter.toString(),
      type: 'IssueStatusChange',
      title: 'Your Issue Was Merged',
      message: `Your issue "${secondary.title}" was identified as a duplicate and merged into issue #${primary._id}.`,
      link: `/issues/${primary._id}`,
    });

    return { primaryIssue: primary, secondaryIssue: secondary };
  }

  static async dismissDuplicate(
    issueId: string,
    duplicateIssueId: string,
    adminUserId: string
  ): Promise<IIssue> {
    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    const match = issue.potentialDuplicates.find(
      (d) => d.issueId.toString() === duplicateIssueId
    );
    if (!match) throw new Error('Potential duplicate link not found');

    match.dismissed = true;
    await issue.save();

    await AuditLog.create({
      actingUserId: adminUserId,
      actionType: 'DUPLICATE_DISMISSED',
      entityType: 'Issue',
      entityId: issue._id,
      details: { dismissedDuplicateId: duplicateIssueId },
      timestamp: new Date(),
    });

    return issue;
  }
}
