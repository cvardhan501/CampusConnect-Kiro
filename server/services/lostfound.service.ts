import { connectToDatabase } from '../db/connection';
import { LostFoundItem, ILostFoundItem, ItemType, ItemStatus } from '../models/LostFound';
import { IAttachment } from '../models/Issue';
import { AuditLog } from '../models/AuditLog';
import { AIService } from './ai.service';

export interface CreateLostFoundInput {
  type: ItemType;
  title: string;
  description: string;
  category: string;
  location: string;
  itemDate: Date;
  imageUrl?: string;
  attachments?: IAttachment[];
  reportedBy: string;
}

export class LostFoundService {
  static async createItem(input: CreateLostFoundInput): Promise<ILostFoundItem> {
    await connectToDatabase();

    if (new Date(input.itemDate) > new Date()) {
      throw new Error('Item date cannot be in the future');
    }

    const item = await LostFoundItem.create({
      type: input.type,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      location: input.location.trim(),
      itemDate: input.itemDate,
      imageUrl: input.imageUrl,
      attachments: input.attachments || [],
      status: 'Active',
      reportedBy: input.reportedBy,
    });

    await AuditLog.create({
      actingUserId: input.reportedBy,
      actionType: `${input.type.toUpperCase()}_ITEM_POSTED`,
      entityType: 'LostFoundItem',
      entityId: item._id,
      details: { title: item.title, category: item.category },
      timestamp: new Date(),
    });

    // Run AI Match Search asynchronously
    void (async () => {
      try {
        const matches = await AIService.findLostFoundMatches(item._id.toString());
        item.potentialMatches = matches as any;
        await item.save();
      } catch (err) {
        console.error('AI match error:', err);
      }
    })();

    return item;
  }

  static async getById(id: string): Promise<ILostFoundItem | null> {
    await connectToDatabase();
    return LostFoundItem.findById(id).populate('reportedBy', 'displayName email campusId');
  }

  static async archiveStaleItems(): Promise<number> {
    await connectToDatabase();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const result = await LostFoundItem.updateMany(
      { status: 'Active', createdAt: { $lte: ninetyDaysAgo } },
      { status: 'Archived' }
    );

    return result.modifiedCount;
  }
}
