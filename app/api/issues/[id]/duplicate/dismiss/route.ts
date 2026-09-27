import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, hasRolePermission, logRBACViolation } from '@/server/utils/rbac';
import { IssueService } from '@/server/services/issue.service';

/**
 * POST /api/issues/:id/duplicate/dismiss
 * Body: { duplicateIssueId: string }
 * Administrator only — dismisses a potential duplicate link without merging. (Req 13.4)
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasRolePermission(payload.role, 'Administrator')) {
    await logRBACViolation(payload.sub, 'POST duplicate/dismiss', `Issue ${params.id}`);
    return NextResponse.json({ error: 'Forbidden: Only Administrators can dismiss duplicate links' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { duplicateIssueId } = body;

    if (!duplicateIssueId || typeof duplicateIssueId !== 'string') {
      return NextResponse.json({ error: 'duplicateIssueId is required' }, { status: 400 });
    }

    const issue = await IssueService.dismissDuplicate(params.id, duplicateIssueId, payload.sub);
    return NextResponse.json({ message: 'Duplicate link dismissed', issue });
  } catch (err: any) {
    const code: number = err.statusCode ?? 400;
    return NextResponse.json({ error: err.message || 'Dismiss failed' }, { status: code });
  }
}
