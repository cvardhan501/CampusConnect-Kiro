import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { IssueService } from '@/server/services/issue.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, resolutionNote, resolutionPhotos } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const issue = await IssueService.updateStatus(
      params.id,
      payload.sub,
      payload.role,
      status,
      resolutionNote,
      resolutionPhotos
    );

    return NextResponse.json({ message: 'Issue status updated successfully', issue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Status transition failed' }, { status: 400 });
  }
}
