import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema } from '@/server/validators/auth.validator';
import { AuthService } from '@/server/services/auth.service';
import { setAuthCookies } from '@/server/utils/jwt';
import { checkAuthIpRateLimit, createRateLimitResponse } from '@/server/utils/rateLimiter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const rateCheck = checkAuthIpRateLimit(ip);
    if (!rateCheck.allowed && rateCheck.retryAfterSeconds) {
      return createRateLimitResponse(rateCheck.retryAfterSeconds);
    }

    const body = await req.json();
    const validated = LoginSchema.parse(body);

    const { user, accessToken, refreshToken } = await AuthService.login(
      validated.identifier,
      validated.password
    );

    setAuthCookies(accessToken, refreshToken);

    const safeUser = {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      campusId: user.campusId,
      role: user.role,
      status: user.status,
      department: user.department,
      phoneNumber: user.phoneNumber,
    };

    return NextResponse.json({
      message: 'Login successful',
      user: safeUser,
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation Error', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }

    const statusCode = err.message?.includes('locked') ? 429 : 401;
    return NextResponse.json(
      { error: err.message || 'Invalid email/campus ID or password' },
      { status: statusCode }
    );
  }
}
