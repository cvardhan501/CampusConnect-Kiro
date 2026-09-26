import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { UserService } from '@/server/services/user.service';

export const GET = requireRole('Administrator', async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const role = (searchParams.get('role') as any) || undefined;
  const status = (searchParams.get('status') as any) || undefined;
  const search = searchParams.get('search') || undefined;

  const users = await UserService.listUsers({ role, status, search });
  return NextResponse.json({ users });
});

export const PATCH = requireRole('Administrator', async (req: NextRequest, payload) => {
  try {
    const body = await req.json();
    const { userId, role, status } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    let user;
    if (role) {
      user = await UserService.updateUserRole(payload.sub, userId, role);
    }
    if (status) {
      user = await UserService.updateUserStatus(payload.sub, userId, status);
    }

    return NextResponse.json({ message: 'User updated successfully', user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 400 });
  }
});
