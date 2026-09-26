import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { AuditService } from '@/server/services/audit.service';

export const GET = requireRole('Administrator', async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || undefined;
  const actionType = searchParams.get('actionType') || undefined;
  const entityType = searchParams.get('entityType') || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;

  const data = await AuditService.queryLogs({
    userId,
    actionType,
    entityType,
    startDate,
    endDate,
    page,
  });

  return NextResponse.json(data);
});
