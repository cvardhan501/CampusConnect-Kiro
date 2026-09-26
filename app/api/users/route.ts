import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { UserService } from '@/server/services/user.service';

export const dynamic = 'force-dynamic';

export const GET = requireRole('Administrator', async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const role = (searchParams.get('role') as any) || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const search = searchParams.get('search') || undefined;

    const users = await UserService.listUsers({ role, status, search });
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to list users' }, { status: 500 });
  }
});
