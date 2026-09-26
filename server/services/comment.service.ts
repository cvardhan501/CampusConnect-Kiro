import { connectToDatabase } from '../db/connection';
import { Comment, IComment, CommentParentType } from '../models/Comment';
import { Issue } from '../models/Issue';
import { LostFoundItem } from '../models/LostFound';
import { NotificationService } from './notification.service';
import { AuditLog } from '../models/AuditLog';

function sanitizeText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class CommentService {
  static async createComment(
    parentType: CommentParentType,
    parentId: string,
    authorId: string,
    body: string
  ): Promise<IComment> {
    await connectToDatabase();

    const sanitizedBody = sanitizeText(body.trim());

    if (sanitizedBody.length < 1 || sanitizedBody.length > 1000) {
      throw new Error('Comment body must be between 1 and 1000 characters');
    }

    // Verify parent status
    if (parentType === 'Issue') {
      const issue = await Issue.findById(parentId);
      if (!issue) throw new Error('Parent issue not found');
      if (issue.status === 'Verified') {
        throw new Error('Comments cannot be added to verified issues');
      }
    } else {
      const item = await LostFoundItem.findById(parentId);
      if (!item) throw new Error('Parent Lost & Found item not found');
      if (item.status === 'Archived') {
        throw new Error('Comments cannot be added to archived Lost & Found items');
      }
    }

    const comment = await Comment.create({
      parentType,
      parentId,
      authorId,
      body: sanitizedBody,
      isTombstone: false,
    });

    // Notify Submitter / Item Poster
    void (async () => {
      try {
        if (parentType === 'Issue') {
          const issue = await Issue.findById(parentId);
          if (issue && issue.reporter.toString() !== authorId) {
            await NotificationService.create({
              userId: issue.reporter.toString(),
              type: 'CommentAdded',
              title: 'New Comment on Your Issue',
              message: `A new comment was posted on "${issue.title}".`,
              link: `/issues/${issue._id}`,
            });
          }
        } else {
          const item = await LostFoundItem.findById(parentId);
          if (item && item.reportedBy.toString() !== authorId) {
            await NotificationService.create({
              userId: item.reportedBy.toString(),
              type: 'CommentAdded',
              title: 'New Comment on Your Item',
              message: `A new comment was posted on "${item.title}".`,
              link: `/lost-found/${item._id}`,
            });
          }
        }
      } catch (err) {
        console.error('Comment notification error:', err);
      }
    })();

    return comment;
  }

  static async editComment(commentId: string, authorId: string, newBody: string): Promise<IComment> {
    await connectToDatabase();

    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');

    if (comment.authorId.toString() !== authorId) {
      throw new Error('Only the author can edit this comment');
    }

    // 15-minute edit window constraint (Req 7.5 & 7.6)
    const fifteenMinsMs = 15 * 60 * 1000;
    if (Date.now() - new Date(comment.createdAt).getTime() > fifteenMinsMs) {
      throw new Error('Comment edit window (15 minutes) has expired');
    }

    const sanitizedBody = sanitizeText(newBody.trim());
    if (sanitizedBody.length < 1 || sanitizedBody.length > 1000) {
      throw new Error('Comment body must be between 1 and 1000 characters');
    }

    comment.body = sanitizedBody;
    comment.editedAt = new Date();
    await comment.save();

    return comment;
  }

  static async deleteComment(commentId: string, actingUserId: string, actingUserRole: string): Promise<IComment> {
    await connectToDatabase();

    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');

    if (comment.authorId.toString() !== actingUserId && actingUserRole !== 'Administrator') {
      throw new Error('Only the author or an Administrator can delete this comment');
    }

    // Tombstone replacement
    comment.body = '[This comment has been deleted.]';
    comment.isTombstone = true;
    await comment.save();

    await AuditLog.create({
      actingUserId,
      actionType: 'COMMENT_DELETED',
      entityType: 'Comment',
      entityId: comment._id,
      timestamp: new Date(),
    });

    return comment;
  }

  static async getCommentsForParent(parentId: string) {
    await connectToDatabase();
    return Comment.find({ parentId }).populate('authorId', 'displayName role').sort({ createdAt: 1 });
  }
}
