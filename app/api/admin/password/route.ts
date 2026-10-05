import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { UpdatePasswordSchema } from '@/server/validators/auth.validator';
import { AuthService } from '@/server/services/auth.service';
import { setAuthCookies } from '@/server/utils/jwt';

export const dynamic = 'force-dynamic';

export const POST = requireRole('Administrator', async (req: NextRequest, payload) => {
  try {
    const body = await req.json();

    const parseResult = UpdatePasswordSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || 'Validation error';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { accessToken, refreshToken } = await AuthService.updatePassword(
      payload.sub,
      parseResult.data
    );

    setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update password' },
      { status: 400 }
    );
  }
});
