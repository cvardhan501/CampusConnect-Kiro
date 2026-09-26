import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/server/utils/rbac';
import { UserService } from '@/server/services/user.service';

export const dynamic = 'force-dynamic';

export const GET = requireAuth(async (req: NextRequest, payload) => {
  try {
    const user = await UserService.getById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch user' }, { status: 500 });
  }
});

export const PATCH = requireAuth(async (req: NextRequest, payload) => {
  try {
    const body = await req.json();
    const { displayName, department, contactPhone } = body;
    const user = await UserService.updateProfile(payload.sub, { displayName, department, contactPhone });
    return NextResponse.json({ message: 'Profile updated successfully', user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update profile' }, { status: 400 });
  }
});
