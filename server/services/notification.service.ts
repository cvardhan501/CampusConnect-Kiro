import { Resend } from 'resend';
import { connectToDatabase } from '../db/connection';
import { Notification, INotification } from '../models/Notification';
import { User } from '../models/User';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'notifications@campusconnect.local';

export type NotificationType =
  | 'IssueStatusChange'
  | 'ClaimDecision'
  | 'StaffAssignment'
  | 'CriticalIssueCreated'
  | 'CommentAdded'
  | 'SystemAlert'
  | 'General';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  sendEmail?: boolean;
}

export class NotificationService {
  static async create(input: CreateNotificationInput): Promise<INotification> {
    await connectToDatabase();

    // 1. Create In-App Notification (Always enabled, mandatory)
    const notification = await Notification.create({
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
      isRead: false,
    });

    // 2. Email Notification (Non-blocking async side effect)
    if (input.sendEmail) {
      void this.sendEmailNotification(input.userId, input.type, input.title, input.message);
    }

    return notification;
  }

  private static async sendEmailNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string
  ) {
    try {
      await connectToDatabase();
      const user = await User.findById(userId);
      if (!user || !user.email) return;

      // Check user email preferences
      const prefs = user.emailPreferences || {
        issueStatusChange: true,
        claimDecision: true,
        staffAssignment: true,
        criticalIssueCreated: true,
      };

      if (type === 'IssueStatusChange' && !prefs.issueStatusChange) return;
      if (type === 'ClaimDecision' && !prefs.claimDecision) return;
      if (type === 'StaffAssignment' && !prefs.staffAssignment) return;
      if (type === 'CriticalIssueCreated' && !prefs.criticalIssueCreated) return;

      if (!resend) {
        console.log(`[Email Service Simulation] To: ${user.email} | Subject: ${title} | Message: ${message}`);
        return;
      }

      await resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: `[CampusConnect] ${title}`,
        html: `<div style="font-family: sans-serif; padding: 20px;">
          <h2>${title}</h2>
          <p>${message}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">CampusConnect Notification System</p>
        </div>`,
      });
    } catch (err) {
      console.error('Failed to send email notification:', err);
    }
  }

  static async getUserNotifications(userId: string) {
    await connectToDatabase();
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
  }

  static async markAsRead(notificationId: string, userId: string) {
    await connectToDatabase();
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string) {
    await connectToDatabase();
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return true;
  }
}
