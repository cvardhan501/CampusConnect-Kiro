import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { UserService } from '@/server/services/user.service';

export const dynamic = 'force-dynamic';

export const PATCH = requireRole('Administrator', async (req: NextRequest, payload, context: { params: { id: string } }) => {
  try {
    const body = await req.json();
    const { role } = body;
    if (!role) {
      return NextResponse.json({ error: 'role is required' }, { status: 400 });
    }
    const user = await UserService.updateUserRole(payload.sub, context.params.id, role);
    return NextResponse.json({ message: 'User role updated successfully', user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update user role' }, { status: 400 });
  }
});
