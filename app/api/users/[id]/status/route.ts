import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { UserService } from '@/server/services/user.service';

export const dynamic = 'force-dynamic';

export const PATCH = requireRole('Administrator', async (req: NextRequest, payload, context: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const { status } = body;
    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 });
    }
    const user = await UserService.updateUserStatus(payload.sub, context.params.id, status);
    return NextResponse.json({ message: 'User status updated successfully', user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user status' }, { status: 400 });
  }
});
