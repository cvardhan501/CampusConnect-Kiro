import mongoose from 'mongoose';
import { connectToDatabase } from '../db/connection';
import { Issue, IssueStatus } from '../models/Issue';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { Claim } from '../models/Claim';

/**
 * Tool A: get_system_health
 * Returns database connectivity, application status, uptime, and timestamp without exposing secrets.
 */
export async function getSystemHealth() {
  try {
    let dbStatus = 'disconnected';
    let dbStateCode = 0;

    try {
      await connectToDatabase();
      dbStateCode = mongoose.connection.readyState;
      switch (dbStateCode) {
        case 1:
          dbStatus = 'connected';
          break;
        case 2:
          dbStatus = 'connecting';
          break;
        case 3:
          dbStatus = 'disconnecting';
          break;
        default:
          dbStatus = 'disconnected';
      }
    } catch {
      dbStatus = 'connection_failed';
    }

    return {
      status: 'online',
      mcpServer: 'campusconnect-ops',
      database: {
        status: dbStatus,
        readyState: dbStateCode,
      },
      environment: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown health check error';
    return { status: 'error', error: errMessage, timestamp: new Date().toISOString() };
  }
}

/**
 * Tool B: get_issue_metrics
 * Returns aggregate metrics for issues using the 6 canonical backend statuses:
 * Reported, Under_Review, Assigned, In_Progress, Resolved, Verified
 */
export async function getIssueMetrics(params: { department?: string } = {}) {
  try {
    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (params.department) {
      query.department = params.department;
    }

    const canonicalStatuses: IssueStatus[] = [
      'Reported',
      'Under_Review',
      'Assigned',
      'In_Progress',
      'Resolved',
      'Verified',
    ];

    const totalIssues = await Issue.countDocuments(query);

    // Count by canonical status
    const statusCounts: Record<string, number> = {};
    for (const status of canonicalStatuses) {
      statusCounts[status] = await Issue.countDocuments({ ...query, status });
    }

    // Aggregation by category
    const categoryAgg = await Issue.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const categoryBreakdown: Record<string, number> = {};
    for (const item of categoryAgg) {
      categoryBreakdown[item._id || 'Uncategorized'] = item.count;
    }

    // Aggregation by priority
    const priorityAgg = await Issue.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const priorityBreakdown: Record<string, number> = {};
    for (const item of priorityAgg) {
      priorityBreakdown[item._id || 'Unknown'] = item.count;
    }

    return {
      totalIssues,
      statusBreakdown: statusCounts,
      categoryBreakdown,
      priorityBreakdown,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error fetching issue metrics';
    return { error: errMessage, timestamp: new Date().toISOString() };
  }
}

/**
 * Tool C: get_stale_issues
 * Returns issues stuck in Reported status >72 hours requiring attention.
 */
export async function getStaleIssues(params: { thresholdHours?: number } = {}) {
  try {
    await connectToDatabase();

    const thresholdHours = params.thresholdHours || 72;
    const thresholdDate = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

    const staleIssues = await Issue.find({
      status: 'Reported',
      createdAt: { $lt: thresholdDate },
    })
      .sort({ createdAt: 1 })
      .select('_id title category location priority status createdAt staleReminderSent department')
      .lean();

    const formattedIssues = staleIssues.map((issue) => ({
      issueId: issue._id.toString(),
      title: issue.title,
      category: issue.category,
      location: issue.location,
      priority: issue.priority,
      status: issue.status,
      department: issue.department || 'Unassigned',
      hoursInReported: Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60)),
      staleReminderSent: Boolean(issue.staleReminderSent),
      createdAt: issue.createdAt,
    }));

    return {
      thresholdHours,
      staleCount: formattedIssues.length,
      staleIssues: formattedIssues,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error fetching stale issues';
    return { error: errMessage, timestamp: new Date().toISOString() };
  }
}

/**
 * Tool D: get_staff_workload
 * Returns assigned workload metrics for Staff and Administrator accounts.
 * Explicitly scrubs passwords, refresh tokens, and secrets.
 */
export async function getStaffWorkload(params: { department?: string } = {}) {
  try {
    await connectToDatabase();

    const staffQuery: Record<string, unknown> = {
      role: { $in: ['Staff', 'Administrator'] },
    };
    if (params.department) {
      staffQuery.department = params.department;
    }

    const staffUsers = await User.find(staffQuery)
      .select('_id displayName email role department')
      .lean();

    const workloadList = await Promise.all(
      staffUsers.map(async (staff) => {
        const assignedCount = await Issue.countDocuments({
          assignedTo: staff._id,
          status: 'Assigned',
        });
        const inProgressCount = await Issue.countDocuments({
          assignedTo: staff._id,
          status: 'In_Progress',
        });
        const resolvedCount = await Issue.countDocuments({
          assignedTo: staff._id,
          status: 'Resolved',
        });

        return {
          staffId: staff._id.toString(),
          name: staff.displayName,
          role: staff.role,
          department: staff.department || 'General',
          activeAssignedCount: assignedCount,
          inProgressCount: inProgressCount,
          totalOpenWorkload: assignedCount + inProgressCount,
          resolvedCount: resolvedCount,
        };
      })
    );

    return {
      staffCount: workloadList.length,
      staffWorkloads: workloadList,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error fetching staff workload';
    return { error: errMessage, timestamp: new Date().toISOString() };
  }
}

/**
 * Tool E: inspect_audit_logs
 * Returns recent audit logs with explicit field selection.
 */
export async function inspectAuditLogs(params: {
  limit?: number;
  actionType?: string;
  entityType?: string;
} = {}) {
  try {
    await connectToDatabase();

    const limit = Math.min(params.limit || 20, 100);
    const query: Record<string, unknown> = {};

    if (params.actionType) {
      query.actionType = params.actionType;
    }
    if (params.entityType) {
      query.entityType = params.entityType;
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('actingUserId', 'displayName email role')
      .select('_id actingUserId actionType entityType entityId details timestamp')
      .lean();

    const formattedLogs = logs.map((log) => ({
      logId: log._id.toString(),
      actionType: log.actionType,
      entityType: log.entityType,
      entityId: log.entityId ? log.entityId.toString() : null,
      actor: typeof log.actingUserId === 'object' && log.actingUserId !== null
        ? {
            id: (log.actingUserId as { _id?: unknown })._id?.toString(),
            name: (log.actingUserId as { displayName?: string }).displayName,
            email: (log.actingUserId as { email?: string }).email,
          }
        : null,
      details: log.details || null,
      timestamp: log.timestamp,
    }));

    return {
      logCount: formattedLogs.length,
      logs: formattedLogs,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error inspecting audit logs';
    return { error: errMessage, timestamp: new Date().toISOString() };
  }
}

/**
 * Tool F: get_pending_claims
 * Returns Lost & Found items currently in Pending status awaiting verification.
 */
export async function getPendingClaims(params: { limit?: number } = {}) {
  try {
    await connectToDatabase();

    const limit = Math.min(params.limit || 20, 100);

    const pendingClaims = await Claim.find({ status: 'Pending' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('foundItemId', 'name location category')
      .populate('claimantId', 'displayName email')
      .select('_id foundItemId claimantId ownershipEvidence status createdAt')
      .lean();

    const formattedClaims = pendingClaims.map((claim) => ({
      claimId: claim._id.toString(),
      item: typeof claim.foundItemId === 'object' && claim.foundItemId !== null
        ? {
            id: (claim.foundItemId as { _id?: unknown })._id?.toString(),
            title: (claim.foundItemId as { name?: string }).name,
            category: (claim.foundItemId as { category?: string }).category,
          }
        : null,
      claimant: typeof claim.claimantId === 'object' && claim.claimantId !== null
        ? {
            id: (claim.claimantId as { _id?: unknown })._id?.toString(),
            name: (claim.claimantId as { displayName?: string }).displayName,
            email: (claim.claimantId as { email?: string }).email,
          }
        : null,
      proofDescription: claim.ownershipEvidence,
      status: claim.status,
      createdAt: claim.createdAt,
    }));

    return {
      pendingCount: formattedClaims.length,
      claims: formattedClaims,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Error fetching pending claims';
    return { error: errMessage, timestamp: new Date().toISOString() };
  }
}
