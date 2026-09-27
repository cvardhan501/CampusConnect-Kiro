import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, hasRolePermission, logRBACViolation } from '@/server/utils/rbac';
import { IssueService } from '@/server/services/issue.service';

/**
 * POST /api/issues/:id/duplicate/merge
 * Body: { secondaryIssueId: string }
 * Administrator only — merges secondary into primary (id), transfers comments/attachments,
 * transitions secondary to Verified. (Req 13.5)
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasRolePermission(payload.role, 'Administrator')) {
    await logRBACViolation(payload.sub, 'POST duplicate/merge', `Issue ${params.id}`);
    return NextResponse.json({ error: 'Forbidden: Only Administrators can merge duplicate issues' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { secondaryIssueId } = body;

    if (!secondaryIssueId || typeof secondaryIssueId !== 'string') {
      return NextResponse.json({ error: 'secondaryIssueId is required' }, { status: 400 });
    }

    const result = await IssueService.mergeDuplicateIssues(
      params.id,       // primary
      secondaryIssueId,
      payload.sub
    );

    return NextResponse.json({
      message: 'Duplicate issue merged successfully',
      primaryIssue: result.primaryIssue,
      secondaryIssue: result.secondaryIssue,
    });
  } catch (err: any) {
    const code: number = err.statusCode ?? 400;
    return NextResponse.json({ error: err.message || 'Merge failed' }, { status: code });
  }
}
