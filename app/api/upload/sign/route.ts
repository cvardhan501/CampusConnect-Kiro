import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { MediaService } from '@/server/services/media.service';

export async function POST(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const context = body.context || 'IssueAttachment';

    const uploadParams = MediaService.generateSignature(context);
    return NextResponse.json(uploadParams);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signature generation failed' }, { status: 400 });
  }
}
