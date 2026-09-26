import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { Issue } from '@/server/models/Issue';
import { connectToDatabase } from '@/server/db/connection';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  const issue = await Issue.findById(params.id)
    .populate('reporter', 'displayName email role campusId')
    .populate('assignedTo', 'displayName email role department')
    .populate('potentialDuplicates.issueId', 'title status location');

  if (!issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }

  return NextResponse.json({ issue });
}
