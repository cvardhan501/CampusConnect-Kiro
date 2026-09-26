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
  const claims = await Claim.find({ claimantId: payload.sub })
    .populate('foundItemId', 'title location type imageUrl status')
    .sort({ createdAt: -1 });

  return NextResponse.json({ claims });
}
