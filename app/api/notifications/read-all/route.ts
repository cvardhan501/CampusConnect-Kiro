import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { NotificationService } from '@/server/services/notification.service';

export async function POST(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await NotificationService.markAllAsRead(payload.sub);
  return NextResponse.json({ message: 'All notifications marked as read' });
}
