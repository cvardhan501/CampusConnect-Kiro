import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, hasRolePermission, logRBACViolation } from '@/server/utils/rbac';
import { IssueService } from '@/server/services/issue.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Administrator-only — staff cannot assign issues (design spec + security steering)
  if (!hasRolePermission(payload.role, 'Administrator')) {
    await logRBACViolation(payload.sub, 'PATCH assign', `Issue ${params.id}`);
    return NextResponse.json({ error: 'Forbidden: Only Administrators can assign issues' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { staffUserId } = body;

    if (!staffUserId) {
      return NextResponse.json({ error: 'staffUserId is required' }, { status: 400 });
    }

    const issue = await IssueService.assignIssue(params.id, staffUserId, payload.sub, payload.role);
    return NextResponse.json({ message: 'Issue assigned successfully', issue });
  } catch (err: any) {
    const code: number = err.statusCode ?? 400;
    return NextResponse.json({ error: err.message || 'Assignment failed' }, { status: code });
  }
}
