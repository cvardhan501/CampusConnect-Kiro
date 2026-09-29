import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies, verifyAccessToken } from '@/server/utils/jwt';
import { invalidateSessionCache } from '@/server/utils/sessionCache';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;
    if (token) {
      const payload = await verifyAccessToken(token);
      if (payload && payload.sub) {
        await invalidateSessionCache(payload.sub);
      }
    }
  } catch {
    // silent fallback
  }

  clearAuthCookies();
  return NextResponse.json({ message: 'Logged out successfully' });
}
