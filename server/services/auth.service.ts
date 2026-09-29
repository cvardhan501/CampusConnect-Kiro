import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { connectToDatabase } from '../db/connection';
import { User, IUser } from '../models/User';
import { signAccessToken, signRefreshToken, hashRefreshToken } from '../utils/jwt';
import { RegisterInput } from '../validators/auth.validator';
import { ActivityLog } from '../models/ActivityLog';

const BCRYPT_ROUNDS = 12;

export class AuthService {
  static async register(input: RegisterInput): Promise<IUser> {
    await connectToDatabase();

    const normalizedEmail = input.email.toLowerCase().trim();
    const normalizedCampusId = input.campusId.trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { campusId: normalizedCampusId }],
    });

    if (existingUser) {
      throw new Error('An account with this email address or Campus ID already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      displayName: input.displayName.trim(),
      campusId: normalizedCampusId,
      role: input.role || 'Student',
      department: input.department?.trim(),
      phoneNumber: input.phoneNumber?.trim(),
      contactPhone: input.phoneNumber?.trim(),
      status: 'Active',
      sessionVersion: 1,
      failedLoginAttempts: 0,
    });

    await ActivityLog.create({
      actingUserId: user._id,
      actingUserName: user.displayName,
      actingUserRole: user.role,
      actionType: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role },
      timestamp: new Date(),
    });

    return user;
  }

  static async login(
    identifier: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    await connectToDatabase();

    const normalized = identifier.toLowerCase().trim();
    const rawIdentifier = identifier.trim();

    const user = await User.findOne({
      $or: [{ email: normalized }, { campusId: rawIdentifier }],
    });

    if (!user) {
      throw new Error('Invalid email/campus ID or password');
    }

    if (user.status === 'Deactivated') {
      throw new Error('Account has been deactivated. Please contact an Administrator.');
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const waitMins = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      throw new Error(`Account locked due to failed attempts. Try again in ${waitMins} minutes.`);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30-min lockout
      }
      await user.save();
      throw new Error('Invalid email/campus ID or password');
    }

    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;

    const jti = crypto.randomUUID();
    const accessToken = await signAccessToken({
      sub: user._id.toString(),
      role: user.role,
      sessionVersion: user.sessionVersion,
    });

    const refreshToken = await signRefreshToken({
      sub: user._id.toString(),
      jti,
    });

    user.refreshTokenHash = await hashRefreshToken(refreshToken);
    await user.save();

    return { user, accessToken, refreshToken };
  }
}
