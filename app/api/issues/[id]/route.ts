import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { IssueService } from '@/server/services/issue.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const issue = await IssueService.getIssueById(params.id);
  if (!issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }

  const rawRole = (payload.role || '').toString().toLowerCase();
  if (rawRole === 'student' && issue.reporter._id.toString() !== payload.sub) {
    return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
  }

  if (rawRole === 'staff') {
    const assignedId = issue.assignedTo?._id?.toString() || issue.assignedTo?.toString();
    const isAssignedToMe = assignedId === payload.sub;

    if (!isAssignedToMe) {
      const { User } = await import('@/server/models/User');
      const staffUser = await User.findById(payload.sub);
      const isSameDepartment =
        staffUser?.department &&
        issue.department &&
        staffUser.department.toLowerCase() === issue.department.toLowerCase();

      if (!isSameDepartment && assignedId) {
        return NextResponse.json({ error: 'Forbidden: Request not assigned to you' }, { status: 403 });
      }
    }
  }

  return NextResponse.json({ issue });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, note, resolutionNote, resolutionPhotos } = body;

    const issue = await IssueService.getIssueById(params.id);
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    const updatedIssue = await IssueService.updateStatus(
      params.id,
      status,
      { id: payload.sub, displayName: (payload as any).displayName || payload.role, role: payload.role },
      note,
      resolutionNote,
      resolutionPhotos
    );

    return NextResponse.json({ message: 'Issue updated successfully', issue: updatedIssue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update issue' }, { status: 400 });
  }
}
