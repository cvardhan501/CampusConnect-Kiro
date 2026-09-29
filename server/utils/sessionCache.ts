import { connectToDatabase } from '../db/connection';
import { User } from '../models/User';

export async function verifySessionVersion(userId: string, tokenSessionVersion?: number): Promise<boolean> {
  if (tokenSessionVersion === undefined) return false;
  try {
    await connectToDatabase();
    const user = await User.findById(userId).select('sessionVersion status');
    if (!user || user.status !== 'Active') return false;
    return user.sessionVersion === tokenSessionVersion;
  } catch {
    return false;
  }
}

export async function invalidateSessionCache(userId: string): Promise<void> {
  try {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { $inc: { sessionVersion: 1 } });
  } catch (err) {
    console.error('Failed to invalidate session cache:', err);
  }
}
