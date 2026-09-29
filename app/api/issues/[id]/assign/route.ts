import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { IssueService } from '@/server/services/issue.service';

export const dynamic = 'force-dynamic';

export const PATCH = requireRole('Administrator', async (req: NextRequest, payload, { params }: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const { staffId, note } = body;

    if (!staffId) {
      return NextResponse.json({ error: 'staffId is required' }, { status: 400 });
    }

    const issue = await IssueService.assignStaff(
      params.id,
      staffId,
      { id: payload.sub, displayName: 'Administrator', role: payload.role },
      note
    );

    return NextResponse.json({ message: 'Staff assigned successfully', issue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to assign staff' }, { status: 400 });
  }
});
