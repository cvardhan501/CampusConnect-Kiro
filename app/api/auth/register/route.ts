import { NextRequest, NextResponse } from 'next/server';
import { RegisterSchema } from '@/server/validators/auth.validator';
import { AuthService } from '@/server/services/auth.service';
import { setAuthCookies } from '@/server/utils/jwt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    const user = await AuthService.register(validated);

    // Automatically log in newly registered active users
    if (user.status === 'Active') {
      const { accessToken, refreshToken } = await AuthService.login(user.email, validated.password);
      setAuthCookies(accessToken, refreshToken);
    }

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

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation Error', details: err.errors.map((e: any) => e.message) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || 'Failed to register user' },
      { status: 400 }
    );
  }
}
