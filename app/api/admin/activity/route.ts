import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { connectToDatabase } from '@/server/db/connection';
import { ActivityLog } from '@/server/models/ActivityLog';

export const dynamic = 'force-dynamic';

export const GET = requireRole('Administrator', async (req: NextRequest) => {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(limit);

  return NextResponse.json({ logs });
});
