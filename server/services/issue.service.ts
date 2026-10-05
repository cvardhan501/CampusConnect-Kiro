import mongoose from 'mongoose';
import { connectToDatabase } from '../db/connection';
import { Issue, IIssue, IssuePriority, IssueStatus, IAttachment } from '../models/Issue';
import { ActivityLog } from '../models/ActivityLog';
import { User } from '../models/User';

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

    const reporterUser = await User.findById(input.reporterId);
    const reporterName = reporterUser ? reporterUser.displayName : 'Student';

    const count = await Issue.countDocuments();
    const ticketId = `CC-2026-${(10001 + count).toString()}`;

    const issue = await Issue.create({
      ticketId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category.trim(),
      location: input.location.trim(),
      priority: input.priority || 'Medium',
      status: 'Reported',
      reporter: input.reporterId,
      attachments: input.attachments || [],
      timeline: [
        {
          authorName: reporterName,
          authorRole: 'Student',
          note: `Reported issue at ${input.location}.`,
          timestamp: new Date(),
        },
      ],
    });

    await ActivityLog.create({
      actingUserId: input.reporterId,
      actingUserName: reporterName,
      actingUserRole: 'Student',
      actionType: 'NEW_ISSUE_REPORTED',
      entityType: 'Issue',
      entityId: issue._id,
      details: { ticketId: issue.ticketId, title: issue.title, category: issue.category },
      timestamp: new Date(),
    });

    return issue;
  }

  static async listIssues(filters: {
    reporterId?: string;
    assignedTo?: string;
    role?: string;
    search?: string;
    category?: string;
    status?: string;
    priority?: string;
    limit?: number;
  }) {
    await connectToDatabase();

    const queryObj: any = {};

    if (filters.reporterId) {
      queryObj.reporter = filters.reporterId;
    }

    if (filters.assignedTo) {
      queryObj.assignedTo = filters.assignedTo;
    }

    if (filters.category && filters.category !== 'All') {
      queryObj.category = filters.category;
    }

    if (filters.status && filters.status !== 'All') {
      const normStatus = filters.status.toLowerCase();
      if (normStatus === 'pending' || normStatus === 'verification') {
        queryObj.status = { $in: ['Reported', 'Under_Review', 'Assigned'] };
      } else if (normStatus === 'active' || normStatus === 'in progress' || normStatus === 'in_progress') {
        queryObj.status = 'In_Progress';
      } else if (normStatus === 'completed' || normStatus === 'resolved' || normStatus === 'verified') {
        queryObj.status = { $in: ['Resolved', 'Verified'] };
      } else {
        queryObj.status = filters.status;
      }
    }

    if (filters.priority && filters.priority !== 'All') {
      queryObj.priority = filters.priority;
    }

    if (filters.search && filters.search.trim()) {
      const s = filters.search.trim();
      queryObj.$or = [
        { title: { $regex: s, $options: 'i' } },
        { ticketId: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } },
        { category: { $regex: s, $options: 'i' } },
      ];
    }

    const issues = await Issue.find(queryObj)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .populate('reporter', 'displayName email role campusId department')
      .populate('assignedTo', 'displayName email role department');

    return issues;
  }

  static async getIssueById(id: string) {
    await connectToDatabase();
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Issue.findById(id)
      .populate('reporter', 'displayName email role campusId department contactPhone phoneNumber')
      .populate('assignedTo', 'displayName email role department contactPhone phoneNumber');
  }

  static async assignStaff(issueId: string, staffId: string, actingUser: any, note?: string) {
    await connectToDatabase();

    if (!staffId || !mongoose.Types.ObjectId.isValid(staffId)) {
      throw new Error('Invalid staff member selected');
    }

    const staffUser = await User.findById(staffId);
    if (!staffUser || (staffUser.role !== 'Staff' && staffUser.role !== 'Administrator')) {
      throw new Error('Selected user is not an eligible staff member');
    }

    if (!issueId || !mongoose.Types.ObjectId.isValid(issueId)) {
      throw new Error('Invalid issue ID');
    }

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    if (!issue.ticketId) {
      issue.ticketId = `CC-2026-${issue._id.toString().slice(-5).toUpperCase()}`;
    }

    issue.assignedTo = staffUser._id;
    issue.department = staffUser.department || issue.category;
    if (['Reported', 'Under_Review'].includes(issue.status)) {
      issue.status = 'Assigned';
    }

    issue.timeline.push({
      authorName: actingUser.displayName || 'Administrator',
      authorRole: actingUser.role || 'Administrator',
      note: note
        ? `Assigned to ${staffUser.displayName} (${staffUser.department || 'Staff'}): ${note}`
        : `Assigned request to ${staffUser.displayName}.`,
      timestamp: new Date(),
    });

    await issue.save();

    await ActivityLog.create({
      actingUserId: actingUser.id || actingUser._id,
      actingUserName: actingUser.displayName,
      actingUserRole: actingUser.role,
      actionType: 'STAFF_ASSIGNED',
      entityType: 'Issue',
      entityId: issue._id,
      details: { ticketId: issue.ticketId, staffName: staffUser.displayName },
      timestamp: new Date(),
    });

    return await IssueService.getIssueById(issue._id.toString());
  }

  static async updateStatus(
    issueId: string,
    newStatus: IssueStatus,
    actingUser: any,
    note?: string,
    resolutionNote?: string,
    resolutionPhotos?: IAttachment[]
  ) {
    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    if (!issue.ticketId) {
      issue.ticketId = `CC-2026-${issue._id.toString().slice(-5).toUpperCase()}`;
    }

    const prevStatus = issue.status;
    issue.status = newStatus;
    if (resolutionNote) {
      issue.resolutionNote = resolutionNote;
    }
    if (resolutionPhotos && resolutionPhotos.length > 0) {
      issue.resolutionPhotos = resolutionPhotos;
    }

    issue.timeline.push({
      authorName: actingUser.displayName || 'Staff',
      authorRole: actingUser.role || 'Staff',
      note: note || resolutionNote || `Status updated from ${prevStatus} to ${newStatus}.`,
      timestamp: new Date(),
    });

    await issue.save();

    await ActivityLog.create({
      actingUserId: actingUser.id || actingUser._id,
      actingUserName: actingUser.displayName,
      actingUserRole: actingUser.role,
      actionType: 'STATUS_CHANGED',
      entityType: 'Issue',
      entityId: issue._id,
      details: { ticketId: issue.ticketId, from: prevStatus, to: newStatus },
      timestamp: new Date(),
    });

    return issue;
  }
}
