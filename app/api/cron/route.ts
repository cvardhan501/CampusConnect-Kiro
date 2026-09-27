import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connection';
import { Issue } from '@/server/models/Issue';
import { AuditLog } from '@/server/models/AuditLog';
import { Notification } from '@/server/models/Notification';
import { NotificationService } from '@/server/services/notification.service';
import { LostFoundService } from '@/server/services/lostfound.service';
import { IssueService } from '@/server/services/issue.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
      }
    }

    await connectToDatabase();

    // ----------------------------------------------------------------
    // 1. Auto-verify Resolved issues past 7-day Verification Window
    //    Req 4.7 — system transition; requires audit log + notification (Req 4.8, 4.9)
    // ----------------------------------------------------------------
    const expiredResolved = await Issue.find({
      status: 'Resolved',
      verificationWindowExpiresAt: { $lte: new Date() },
    }).select('_id title reporter');

    let autoVerifiedCount = 0;
    for (const issue of expiredResolved) {
      issue.status = 'Verified' as any;
      await (issue as any).save();

      // Audit record with 'system' as acting user (Req 4.8)
      await AuditLog.create({
        actingUserId: null, // null = system
        actionType: 'ISSUE_AUTO_VERIFIED',
        entityType: 'Issue',
        entityId: issue._id,
        details: { reason: '7-day verification window expired', triggeredBy: 'cron' },
        timestamp: new Date(),
      });

      // Notify submitter (Req 4.9)
      void NotificationService.create({
        userId: issue.reporter.toString(),
        type: 'IssueStatusChange',
        title: 'Issue Automatically Verified',
        message: `Your issue "${issue.title}" has been automatically verified after the 7-day window.`,
        link: `/issues/${issue._id}`,
        sendEmail: true,
      });

      autoVerifiedCount++;
    }

    // ----------------------------------------------------------------
    // 2. Auto-archive Lost & Found items active for 90 days
    // ----------------------------------------------------------------
    const archivedCount = await LostFoundService.archiveStaleItems();

    // ----------------------------------------------------------------
    // 3. Send 72-hour stale issue reminders to Admins
    // ----------------------------------------------------------------
    const staleReminderCount = await IssueService.checkStaleIssues();

    // ----------------------------------------------------------------
    // 4. Purge in-app notifications older than 90 days
    // ----------------------------------------------------------------
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const purgedNotifications = await Notification.deleteMany({ createdAt: { $lte: ninetyDaysAgo } });

    return NextResponse.json({
      message: 'Cron scheduled operations executed successfully',
      autoVerifiedIssues: autoVerifiedCount,
      archivedLostFoundItems: archivedCount,
      staleIssueRemindersSent: staleReminderCount,
      purgedNotificationsCount: purgedNotifications.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Cron execution failed' }, { status: 500 });
  }
}
