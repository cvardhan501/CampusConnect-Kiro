import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema } from '@/server/validators/auth.validator';
import { AuthService } from '@/server/services/auth.service';
import { setAuthCookies } from '@/server/utils/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
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

    return NextResponse.json(
      { error: err.message || 'Invalid email/campus ID or password' },
      { status: 401 }
    );
  }
}
