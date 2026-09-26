import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { LostFoundService } from '@/server/services/lostfound.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const item = await LostFoundService.getById(params.id);
  if (!item) {
    return NextResponse.json({ error: 'Lost & Found item not found' }, { status: 404 });
  }

  return NextResponse.json({ item });
}
