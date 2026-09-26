import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/services/auth.service';
import { setAuthCookies, clearAuthCookies } from '@/server/utils/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      clearAuthCookies();
      return NextResponse.json({ error: 'Refresh token missing' }, { status: 401 });
    }

    const { user, accessToken, refreshToken: newRefreshToken } = await AuthService.refresh(refreshToken);

    setAuthCookies(accessToken, newRefreshToken);

    return NextResponse.json({
      message: 'Token refreshed successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (err: any) {
    clearAuthCookies();
    return NextResponse.json(
      { error: err.message || 'Invalid refresh token' },
      { status: 401 }
    );
  }
}
