import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, hasRolePermission } from '@/server/utils/rbac';
import { IssueService } from '@/server/services/issue.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasRolePermission(payload.role, 'Staff')) {
    return NextResponse.json({ error: 'Forbidden: Only Staff or Administrators can assign issues' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { staffUserId } = body;

    if (!staffUserId) {
      return NextResponse.json({ error: 'staffUserId is required' }, { status: 400 });
    }

    const issue = await IssueService.assignIssue(params.id, staffUserId, payload.sub);
    return NextResponse.json({ message: 'Issue assigned successfully', issue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Assignment failed' }, { status: 400 });
  }
}
