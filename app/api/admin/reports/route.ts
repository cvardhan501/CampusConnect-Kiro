import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { Issue } from '@/server/models/Issue';
import { LostFoundItem } from '@/server/models/LostFound';
import { connectToDatabase } from '@/server/db/connection';

export const dynamic = 'force-dynamic';

export const GET = requireRole('Administrator', async (req: NextRequest) => {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'issues';
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const assignedStaff = searchParams.get('assignedStaff');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (type === 'lost-found') {
    const queryObj: any = {};
    if (category && category !== 'All') queryObj.category = category;
    if (status && status !== 'All') queryObj.status = status;
    if (startDate || endDate) {
      queryObj.createdAt = {};
      if (startDate) queryObj.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        queryObj.createdAt.$lte = end;
      }
    }

    const totalCount = await LostFoundItem.countDocuments(queryObj);
    if (totalCount > 10000) {
      return NextResponse.json(
        { error: 'Report generation rejected: Record count exceeds maximum allowed limit of 10,000 records' },
        { status: 400 }
      );
    }

    const items = await LostFoundItem.find(queryObj).sort({ createdAt: -1 }).populate('reportedBy', 'displayName email campusId');

    const headers = ['ID', 'Type', 'Title', 'Category', 'Location', 'Status', 'Reporter', 'Item Date', 'Created At'];
    const rows = items.map((i: any) => [
      i._id.toString(),
      i.type,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      i.category,
      `"${(i.location || '').replace(/"/g, '""')}"`,
      i.status,
      `"${i.reportedBy?.displayName || 'User'}"`,
      new Date(i.itemDate).toISOString(),
      new Date(i.createdAt).toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="campusconnect_lostfound_report.csv"',
      },
    });
  }

  // Default: Issues Export
  const queryObj: any = {};
  if (category && category !== 'All') queryObj.category = category;
  if (status && status !== 'All') queryObj.status = status;
  if (assignedStaff) queryObj.assignedTo = assignedStaff;
  if (startDate || endDate) {
    queryObj.createdAt = {};
    if (startDate) queryObj.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryObj.createdAt.$lte = end;
    }
  }

  const totalCount = await Issue.countDocuments(queryObj);
  if (totalCount > 10000) {
    return NextResponse.json(
      { error: 'Report generation rejected: Record count exceeds maximum allowed limit of 10,000 records' },
      { status: 400 }
    );
  }

  const issues = await Issue.find(queryObj).sort({ createdAt: -1 }).populate('reporter', 'displayName email campusId').populate('assignedTo', 'displayName email');

  const headers = ['Issue ID', 'Title', 'Category', 'Location', 'Priority', 'Status', 'Reporter', 'Assigned Staff', 'Created At'];
  const rows = issues.map((i: any) => [
    i._id.toString(),
    `"${(i.title || '').replace(/"/g, '""')}"`,
    i.category,
    `"${(i.location || '').replace(/"/g, '""')}"`,
    i.priority,
    i.status,
    `"${i.reporter?.displayName || 'User'}"`,
    `"${i.assignedTo?.displayName || 'Unassigned'}"`,
    new Date(i.createdAt).toISOString(),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="campusconnect_issues_report.csv"',
    },
  });
});
