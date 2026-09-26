import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { connectToDatabase } from '../db/connection';
import { User, IUser, UserRole } from '../models/User';
import { signAccessToken, signRefreshToken, hashRefreshToken, compareRefreshToken } from '../utils/jwt';
import { invalidateSessionCache } from '../utils/sessionCache';
import { AuditLog } from '../models/AuditLog';
import { EmailService } from './email.service';
import { RegisterInput } from '../validators/auth.validator';

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

    // Locked CampusConnect Rule: All roles (Student, Staff, Administrator) register as 'Active' directly.
    // Administrator registration does NOT create PendingApproval and requires no secondary approval.
    const status = 'Active';

    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      displayName: input.displayName.trim(),
      campusId: normalizedCampusId,
      role: input.role,
      department: input.department?.trim(),
      phoneNumber: input.phoneNumber?.trim(),
      status,
      sessionVersion: 1,
      failedLoginAttempts: 0,
    });

    await AuditLog.create({
      actingUserId: user._id,
      actionType: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user._id,
      details: { email: user.email, role: user.role, status: user.status },
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

    // Requirement 1.5: Generic failure message that does not distinguish account existence
    if (!user) {
      throw new Error('Invalid email/campus ID or password');
    }

    if (user.status === 'Deactivated') {
      throw new Error('Account has been deactivated. Please contact an Administrator.');
    }

    // Account Lockout check (Requirement 1.6: 5 failed attempts -> 30 min lock)
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const waitMins = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      throw new Error(`Account locked due to consecutive failed login attempts. Try again in ${waitMins} minutes.`);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30-minute lockout
        // Send lockout notification email asynchronously via Resend
        EmailService.sendLockoutNotificationEmail(user.email).catch((err) =>
          console.error('Failed to send lockout email:', err)
        );
      }
      await user.save();
      throw new Error('Invalid email/campus ID or password');
    }

    // Successful login: reset failed attempts & lockout state
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

    // Hash refresh token with SHA-256 pre-digest + bcrypt cost 12 before database storage
    user.refreshTokenHash = await hashRefreshToken(refreshToken);
    await user.save();

    return { user, accessToken, refreshToken };
  }

  static async refresh(
    rawRefreshToken: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    await connectToDatabase();

    const { verifyRefreshToken } = await import('../utils/jwt');
    const verified = await verifyRefreshToken(rawRefreshToken);

    if (!verified || !verified.sub) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await User.findById(verified.sub);
    if (!user || !user.refreshTokenHash || user.status !== 'Active') {
      throw new Error('Invalid session or user account inactive');
    }

    const isValidRefresh = await compareRefreshToken(rawRefreshToken, user.refreshTokenHash);
    if (!isValidRefresh) {
      user.refreshTokenHash = undefined;
      await user.save();
      throw new Error('Refresh token reuse or invalid token detected');
    }

    // Rotate refresh token
    const newJti = crypto.randomUUID();
    const newAccessToken = await signAccessToken({
      sub: user._id.toString(),
      role: user.role,
      sessionVersion: user.sessionVersion,
    });

    const newRefreshToken = await signRefreshToken({
      sub: user._id.toString(),
      jti: newJti,
    });

    user.refreshTokenHash = await hashRefreshToken(newRefreshToken);
    await user.save();

    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async logout(userId: string): Promise<void> {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
    invalidateSessionCache(userId);
  }

  static async requestPasswordReset(email: string): Promise<string> {
    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Generic response to prevent account enumeration
    if (!user) {
      return 'If the email exists, a password reset token has been generated.';
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    user.resetTokenHash = resetTokenHash;
    user.resetTokenExpiresAt = resetTokenExpiresAt;
    await user.save();

    // Send reset email via Resend
    await EmailService.sendPasswordResetEmail(user.email, rawToken);

    return rawToken;
  }

  static async confirmPasswordReset(token: string, newPassword: string): Promise<boolean> {
    await connectToDatabase();

    const resetTokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await User.findOne({
      resetTokenHash,
      resetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired password reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.passwordHash = passwordHash;
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    user.sessionVersion += 1; // Invalidate all active sessions
    await user.save();

    invalidateSessionCache(user._id.toString());

    await AuditLog.create({
      actingUserId: user._id,
      actionType: 'PASSWORD_RESET',
      entityType: 'User',
      entityId: user._id,
      timestamp: new Date(),
    });

    return true;
  }
}
