import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { Claim } from '@/server/models/Claim';
import { connectToDatabase } from '@/server/db/connection';

export async function GET(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  let query: any = {};
  if (payload.role === 'Student') {
    query.claimantId = payload.sub;
  }

  const claims = await Claim.find(query)
    .populate('claimantId', 'displayName email campusId department')
    .populate('foundItemId', 'title location type imageUrl status')
    .sort({ createdAt: -1 });

  return NextResponse.json({ claims });
}
