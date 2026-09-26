import { connectToDatabase } from '../db/connection';
import { User } from '../models/User';

interface CacheEntry {
  sessionVersion: number;
  cachedAt: number;
}

const SESSION_CACHE_TTL_MS = 5_000; // 5 seconds - satisfies 5-second invalidation in Req 2.7
const cache = new Map<string, CacheEntry>();

export async function verifySessionVersion(
  userId: string,
  tokenSessionVersion: number
): Promise<boolean> {
  const now = Date.now();
  const entry = cache.get(userId);

  let dbVersion: number;

  if (entry && now - entry.cachedAt < SESSION_CACHE_TTL_MS) {
    dbVersion = entry.sessionVersion;
  } else {
    await connectToDatabase();
    const user = await User.findById(userId).select('sessionVersion').lean();
    if (!user) return false;
    dbVersion = user.sessionVersion;
    cache.set(userId, { sessionVersion: dbVersion, cachedAt: now });
  }

  if (tokenSessionVersion !== dbVersion) {
    cache.delete(userId);
    return false;
  }
  return true;
}

export function invalidateSessionCache(userId: string) {
  cache.delete(userId);
}
