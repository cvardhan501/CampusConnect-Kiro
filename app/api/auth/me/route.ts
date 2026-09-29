import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/server/utils/jwt';
import { verifySessionVersion } from '@/server/utils/sessionCache';
import { connectToDatabase } from '@/server/db/connection';
import { User } from '@/server/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const isValidSession = await verifySessionVersion(payload.sub, payload.sessionVersion);
    if (!isValidSession) {
      return NextResponse.json({ error: 'Session invalidated' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(payload.sub).select('-passwordHash -refreshTokenHash -resetTokenHash');

    if (!user || user.status !== 'Active') {
      return NextResponse.json({ error: 'User account inactive or not found' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        campusId: user.campusId,
        role: user.role,
        status: user.status,
        department: user.department || 'Not provided',
        phoneNumber: user.phoneNumber || user.contactPhone || 'Not provided',
        contactPhone: user.contactPhone || user.phoneNumber || 'Not provided',
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
