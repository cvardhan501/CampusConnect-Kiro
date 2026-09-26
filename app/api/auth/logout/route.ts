import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/server/services/auth.service';
import { verifyAccessToken, clearAuthCookies } from '@/server/utils/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;

    if (token) {
      const payload = await verifyAccessToken(token);
      if (payload?.sub) {
        await AuthService.logout(payload.sub);
      }
    }

    clearAuthCookies();

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    clearAuthCookies();
    return NextResponse.json({ message: 'Logged out' });
  }
}
