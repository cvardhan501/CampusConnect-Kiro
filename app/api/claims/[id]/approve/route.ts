import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { ClaimService } from '@/server/services/claim.service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const claim = await ClaimService.approveClaim(params.id, payload.sub);
    return NextResponse.json({ message: 'Claim approved successfully', claim });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to approve claim' }, { status: 400 });
  }
}
