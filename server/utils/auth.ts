import { NextRequest } from 'next/server';
import { verifyAccessToken, JWTPayload } from './jwt';
import { verifySessionVersion } from './sessionCache';

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get('accessToken')?.value;
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload || !payload.sub) return null;

  const isValidSession = await verifySessionVersion(payload.sub, payload.sessionVersion);
  if (!isValidSession) return null;

  return payload;
}
