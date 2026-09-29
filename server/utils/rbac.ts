import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, JWTPayload } from './jwt';
import { verifySessionVersion } from './sessionCache';
import { UserRole } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { connectToDatabase } from '../db/connection';

const ROLE_RANK: Record<UserRole, number> = {
  Student: 1,
  Staff: 2,
  Administrator: 3,
};

export async function authenticateRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token =
    req.cookies.get('accessToken')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  const isValidSession = await verifySessionVersion(payload.sub, payload.sessionVersion);
  if (!isValidSession) return null;

  return payload;
}

export function hasRolePermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return (ROLE_RANK[userRole] || 0) >= (ROLE_RANK[requiredRole] || 0);
}

export async function logRBACViolation(
  userId: string | undefined,
  action: string,
  targetResource: string
) {
  try {
    await connectToDatabase();
    await ActivityLog.create({
      actingUserId: userId || undefined,
      actionType: 'RBAC_VIOLATION_ATTEMPT',
      entityType: 'API_ENDPOINT',
      details: { attemptedAction: action, targetResource },
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Failed to log RBAC violation:', err);
  }
}

export function requireAuth<T = any>(
  handler: (req: NextRequest, payload: JWTPayload, context: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    const payload = await authenticateRequest(req);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    return handler(req, payload, context);
  };
}

export function requireRole<T = any>(
  minRole: UserRole,
  handler: (req: NextRequest, payload: JWTPayload, context: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    const payload = await authenticateRequest(req);

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    if (!hasRolePermission(payload.role, minRole)) {
      await logRBACViolation(payload.sub, req.method, req.nextUrl.pathname);
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    return handler(req, payload, context);
  };
}
