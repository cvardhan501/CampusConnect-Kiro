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

    // Notify submitter + all prior commenters (Req 7.3)
    void (async () => {
      try {
        const notified = new Set<string>();
        notified.add(authorId); // never notify the author of their own comment

        if (parentType === 'Issue') {
          const issue = await Issue.findById(parentId);
          if (!issue) return;

          // 1. Notify issue reporter
          if (!notified.has(issue.reporter.toString())) {
            notified.add(issue.reporter.toString());
            await NotificationService.create({
              userId: issue.reporter.toString(),
              type: 'CommentAdded',
              title: 'New Comment on Your Issue',
              message: `A new comment was posted on "${issue.title}".`,
              link: `/issues/${issue._id}`,
            });
          }

          // 2. Notify all prior non-tombstone commenters
          const priorComments = await Comment.find({
            parentId: issue._id,
            isTombstone: false,
            _id: { $ne: comment._id },
          }).distinct('authorId');

          for (const prior of priorComments) {
            const uid = prior.toString();
            if (!notified.has(uid)) {
              notified.add(uid);
              await NotificationService.create({
                userId: uid,
                type: 'CommentAdded',
                title: 'New Comment on an Issue You Commented On',
                message: `A new comment was posted on "${issue.title}".`,
                link: `/issues/${issue._id}`,
              });
            }
          }
        } else {
          const item = await LostFoundItem.findById(parentId);
          if (!item) return;

          if (!notified.has(item.reportedBy.toString())) {
            notified.add(item.reportedBy.toString());
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

  static async deleteComment(
    commentId: string,
    actingUserId: string,
    actingUserRole: string
  ): Promise<IComment> {
    await connectToDatabase();

    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');

    if (comment.authorId.toString() !== actingUserId && actingUserRole !== 'Administrator') {
      throw new Error('Only the author or an Administrator can delete this comment');
    }

    // Tombstone replacement (Req 7.7)
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

  static async getCommentsForParent(parentId: string, parentType?: CommentParentType) {
    await connectToDatabase();
    const filter: Record<string, any> = { parentId };
    if (parentType) filter.parentType = parentType;
    return Comment.find(filter)
      .populate('authorId', 'displayName role')
      .sort({ createdAt: 1 });
  }
}
