import { NextRequest, NextResponse } from 'next/server';
import { ForgotPasswordSchema } from '@/server/validators/auth.validator';
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
    const validated = ForgotPasswordSchema.parse(body);

    await AuthService.requestPasswordReset(validated.email);

    return NextResponse.json({
      message: 'If an account exists with that email address, password reset instructions have been sent.',
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation Error', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'If an account exists with that email address, password reset instructions have been sent.',
    });
  }
}
