import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connection';
import { Issue } from '@/server/models/Issue';
import { Notification } from '@/server/models/Notification';
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

    // 1. Auto-verify Resolved issues past 7-day Verification Window
    const verifiedResult = await Issue.updateMany(
      { status: 'Resolved', verificationWindowExpiresAt: { $lte: new Date() } },
      { status: 'Verified' }
    );

    // 2. Auto-archive Lost & Found items active for 90 days
    const archivedCount = await LostFoundService.archiveStaleItems();

    // 3. Send 72-hour stale issue reminders to Admins
    const staleReminderCount = await IssueService.checkStaleIssues();

    // 4. Purge in-app notifications older than 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const purgedNotifications = await Notification.deleteMany({ createdAt: { $lte: ninetyDaysAgo } });

    return NextResponse.json({
      message: 'Cron scheduled operations executed successfully',
      autoVerifiedIssues: verifiedResult.modifiedCount,
      archivedLostFoundItems: archivedCount,
      staleIssueRemindersSent: staleReminderCount,
      purgedNotificationsCount: purgedNotifications.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Cron execution failed' }, { status: 500 });
  }
}
