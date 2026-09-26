import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { NotificationService } from '@/server/services/notification.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notification = await NotificationService.markAsRead(params.id, payload.sub);
  return NextResponse.json({ message: 'Notification marked as read', notification });
}
