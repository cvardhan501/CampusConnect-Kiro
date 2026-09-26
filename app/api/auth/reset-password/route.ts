import { NextRequest, NextResponse } from 'next/server';
import { ResetPasswordSchema } from '@/server/validators/auth.validator';
import { AuthService } from '@/server/services/auth.service';
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
    const validated = ResetPasswordSchema.parse(body);

    await AuthService.confirmPasswordReset(validated.token, validated.newPassword);

    return NextResponse.json({
      message: 'Password reset successful. You may now log in with your new password.',
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation Error', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Invalid or expired password reset token' },
      { status: 400 }
    );
  }
}
