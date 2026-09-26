import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { UserService } from '@/server/services/user.service';

export const dynamic = 'force-dynamic';

export const GET = requireRole('Administrator', async (req: NextRequest, payload, context: { params: { id: string } }) => {
  try {
    const user = await UserService.getById(context.params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch user' }, { status: 500 });
  }
});

export const DELETE = requireRole('Administrator', async (req: NextRequest, payload, context: { params: { id: string } }) => {
  try {
    await UserService.deleteUser(payload.sub, context.params.id);
    return NextResponse.json({ message: 'User deleted and pseudonymized successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete user' }, { status: 400 });
  }
});
