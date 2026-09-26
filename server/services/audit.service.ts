import { connectToDatabase } from '../db/connection';
import { AuditLog } from '../models/AuditLog';

export interface AuditQueryFilters {
  userId?: string;
  actionType?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class AuditService {
  static async queryLogs(filters: AuditQueryFilters) {
    await connectToDatabase();

    const query: any = {};
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 50); // 50 per page requirement
    const skip = (page - 1) * limit;

    if (filters.userId) query.actingUserId = filters.userId;
    if (filters.actionType) query.actionType = filters.actionType;
    if (filters.entityType) query.entityType = filters.entityType;

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actingUserId', 'displayName email role'),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
