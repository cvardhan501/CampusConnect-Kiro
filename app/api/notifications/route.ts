import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { NotificationService } from '@/server/services/notification.service';

export async function GET(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await NotificationService.getUserNotifications(payload.sub);
  return NextResponse.json({ notifications });
}
