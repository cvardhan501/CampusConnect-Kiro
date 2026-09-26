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
    const { ownershipEvidence } = body;

    if (!ownershipEvidence || ownershipEvidence.trim().length < 30 || ownershipEvidence.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Ownership evidence must be between 30 and 1000 characters' },
        { status: 400 }
      );
    }

    const claim = await ClaimService.submitClaim(params.id, payload.sub, ownershipEvidence);
    return NextResponse.json({ message: 'Claim submitted successfully', claim }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to submit claim' }, { status: 400 });
  }
}
