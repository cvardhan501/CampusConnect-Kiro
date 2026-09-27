import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { ClaimService } from '@/server/services/claim.service';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { rejectionReason } = body;

    if (!rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const claim = await ClaimService.rejectClaim(params.id, payload.sub, rejectionReason, payload.role);
    return NextResponse.json({ message: 'Claim rejected', claim });
  } catch (err: any) {
    const status = err.statusCode || 400;
    return NextResponse.json({ error: err.message || 'Failed to reject claim' }, { status });
  }
}
