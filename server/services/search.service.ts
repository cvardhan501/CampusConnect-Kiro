import { connectToDatabase } from '../db/connection';
import { Issue } from '../models/Issue';
import { LostFoundItem } from '../models/LostFound';

export interface SearchFilterInput {
  query?: string;
  category?: string;
  status?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
}

export class SearchService {
  static async searchIssues(filters: SearchFilterInput) {
    await connectToDatabase();

    if (filters.query && filters.query.length > 500) {
      throw new Error('Search query cannot exceed 500 characters');
    }

    const queryObj: any = {};
    const limit = Math.min(filters.limit || 25, 25);

    if (filters.query && filters.query.trim()) {
      queryObj.$or = [
        { title: { $regex: filters.query.trim(), $options: 'i' } },
        { description: { $regex: filters.query.trim(), $options: 'i' } },
      ];
    }

    if (filters.category && filters.category !== 'All') {
      queryObj.category = filters.category;
    }

    if (filters.status && filters.status !== 'All') {
      queryObj.status = filters.status;
    }

    if (filters.location && filters.location.trim()) {
      queryObj.location = { $regex: filters.location.trim(), $options: 'i' };
    }

    if (filters.startDate || filters.endDate) {
      queryObj.createdAt = {};
      if (filters.startDate) queryObj.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        queryObj.createdAt.$lte = end;
      }
    }

    if (filters.cursor) {
      queryObj._id = { $lt: filters.cursor };
    }

    const items = await Issue.find(queryObj)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('reporter', 'displayName email role');

    const hasNext = items.length > limit;
    const results = hasNext ? items.slice(0, limit) : items;
    const nextCursor = hasNext ? results[results.length - 1]._id.toString() : null;

    return {
      results,
      nextCursor,
      count: results.length,
    };
  }

  static async searchLostFound(filters: SearchFilterInput) {
    await connectToDatabase();

    if (filters.query && filters.query.length > 500) {
      throw new Error('Search query cannot exceed 500 characters');
    }

    const queryObj: any = {};
    const limit = Math.min(filters.limit || 25, 25);

    if (filters.query && filters.query.trim()) {
      queryObj.$or = [
        { title: { $regex: filters.query.trim(), $options: 'i' } },
        { description: { $regex: filters.query.trim(), $options: 'i' } },
      ];
    }

    if (filters.category && filters.category !== 'All') {
      queryObj.category = filters.category;
    }

    if (filters.status && filters.status !== 'All') {
      queryObj.status = filters.status;
    }

    if (filters.location && filters.location.trim()) {
      queryObj.location = { $regex: filters.location.trim(), $options: 'i' };
    }

    if (filters.cursor) {
      queryObj._id = { $lt: filters.cursor };
    }

    const items = await LostFoundItem.find(queryObj)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('reportedBy', 'displayName email role');

    const hasNext = items.length > limit;
    const results = hasNext ? items.slice(0, limit) : items;
    const nextCursor = hasNext ? results[results.length - 1]._id.toString() : null;

    return {
      results,
      nextCursor,
      count: results.length,
    };
  }
}
