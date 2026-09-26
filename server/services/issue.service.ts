import { connectToDatabase } from '../db/connection';
import { Issue, IIssue, IssueStatus, IssuePriority, IAttachment } from '../models/Issue';
import { NotificationService } from './notification.service';
import { AuditLog } from '../models/AuditLog';
import { User } from '../models/User';
import { AIService } from './ai.service';

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
        await issue.save();
        await AIService.findPotentialDuplicateIssues(issue._id.toString());
      } catch (err) {
        console.error('Async AI triage failed:', err);
      }
    })();

    // Critical Priority Notification
    if (input.priority === 'Critical') {
      void (async () => {
        try {
          const admins = await User.find({ role: 'Administrator', status: 'Active' });
          for (const admin of admins) {
            await NotificationService.create({
              userId: admin._id.toString(),
              type: 'CriticalIssueCreated',
              title: 'Critical Safety Issue Reported!',
              message: `CRITICAL: "${issue.title}" at ${issue.location}`,
              link: `/issues/${issue._id}`,
              sendEmail: true,
            });
          }
        } catch (err) {
          console.error('Critical notification error:', err);
        }
      })();
    }

    return issue;
  }

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

    // Validate Status Transitions per Requirement 4.1
    const allowedTransitions: Record<string, string[]> = {
      Reported: ['Under_Review', 'Assigned', 'In_Progress', 'Closed'],
      Under_Review: ['Assigned', 'In_Progress', 'Closed'],
      Assigned: ['In_Progress', 'Closed'],
      In_Progress: ['Resolved', 'Closed'],
      Resolved: ['Verified', 'Reported', 'Closed'],
      Verified: [],
      Closed: ['Reported'],
      Closed_Duplicate: [],
    };

    const validNextStatuses = allowedTransitions[currentStatus] || [];
    if (!validNextStatuses.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    // Submitter verification rule: Only submitting student can reopen or verify Resolved issue
    if (currentStatus === 'Resolved') {
      if (issue.reporter.toString() !== actingUserId && actingUserRole !== 'Administrator') {
        throw new Error('Only the submitting student or an Administrator can verify or reopen a resolved issue');
      }
    }

    // Require Resolution Note for Resolved status
    if (newStatus === 'Resolved') {
      if (!resolutionNote || resolutionNote.trim().length < 20 || resolutionNote.trim().length > 1000) {
        throw new Error('Transitioning to Resolved requires a resolution note of 20-1000 characters');
      }
      issue.resolutionNote = resolutionNote.trim();
      if (resolutionPhotos && resolutionPhotos.length > 0) {
        if (resolutionPhotos.length > 3) throw new Error('Maximum 3 resolution photos permitted');
        issue.resolutionPhotos = resolutionPhotos;
      }

      // Set 7-day Verification Window
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

    // Notify Submitter
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

  static async assignIssue(issueId: string, staffUserId: string, actingUserId: string): Promise<IIssue> {
    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    const staffUser = await User.findById(staffUserId);
    if (!staffUser || (staffUser.role !== 'Staff' && staffUser.role !== 'Administrator')) {
      throw new Error('Assigned user must be a Staff member or Administrator');
    }

    issue.assignedTo = staffUser._id;
    if (issue.status === 'Reported' || issue.status === 'Under_Review') {
      issue.status = 'Assigned';
    }
    await issue.save();

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
    issue.aiTriageStatus = 'Completed';
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

    // Mark secondary issue as Closed_Duplicate
    const oldStatus = secondary.status;
    secondary.status = 'Closed_Duplicate';
    secondary.resolutionNote = `Merged into primary issue #${primary._id}`;
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

    return { primaryIssue: primary, secondaryIssue: secondary };
  }
}
