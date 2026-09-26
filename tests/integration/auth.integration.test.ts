import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AuthService } from '@/server/services/auth.service';
import { User } from '@/server/models/User';
import { connectToDatabase } from '@/server/db/connection';

let mongoServer: MongoMemoryServer;

describe('Phase 1 — Auth Integration Tests (MongoDB Memory Server)', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    await connectToDatabase();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register Student, Staff, and Administrator accounts directly into Active status (no PendingApproval)', async () => {
    const student = await AuthService.register({
      email: 'student.active@campusconnect.local',
      password: 'password12345',
      displayName: 'Test Student',
      campusId: 'STU-ACT-01',
      role: 'Student',
    });
    expect(student.status).toBe('Active');

    const staff = await AuthService.register({
      email: 'staff.active@campusconnect.local',
      password: 'password12345',
      displayName: 'Test Staff',
      campusId: 'STF-ACT-01',
      role: 'Staff',
    });
    expect(staff.status).toBe('Active');

    const admin = await AuthService.register({
      email: 'admin.active@campusconnect.local',
      password: 'password12345',
      displayName: 'Test Admin',
      campusId: 'ADM-ACT-01',
      role: 'Administrator',
    });
    expect(admin.status).toBe('Active');
  });

  it('should prevent registration with duplicate email or campusId', async () => {
    await AuthService.register({
      email: 'duplicate@campusconnect.local',
      password: 'password12345',
      displayName: 'First User',
      campusId: 'STU-DUPE-1',
      role: 'Student',
    });

    await expect(
      AuthService.register({
        email: 'duplicate@campusconnect.local',
        password: 'password12345',
        displayName: 'Second User',
        campusId: 'STU-DUPE-2',
        role: 'Student',
      })
    ).rejects.toThrow();

    await expect(
      AuthService.register({
        email: 'other@campusconnect.local',
        password: 'password12345',
        displayName: 'Third User',
        campusId: 'STU-DUPE-1',
        role: 'Student',
      })
    ).rejects.toThrow();
  });

  it('should allow login with either email or campusId and issue valid tokens', async () => {
    await AuthService.register({
      email: 'login.test@campusconnect.local',
      password: 'password12345',
      displayName: 'Login Test',
      campusId: 'STU-LOGIN-88',
      role: 'Student',
    });

    // Login via Email
    const loginEmail = await AuthService.login('login.test@campusconnect.local', 'password12345');
    expect(loginEmail.accessToken).toBeDefined();
    expect(loginEmail.refreshToken).toBeDefined();
    expect(loginEmail.user.email).toBe('login.test@campusconnect.local');

    // Login via Campus ID
    const loginCampusId = await AuthService.login('STU-LOGIN-88', 'password12345');
    expect(loginCampusId.accessToken).toBeDefined();
    expect(loginCampusId.refreshToken).toBeDefined();
  });

  it('should enforce account lockout after 5 consecutive failed login attempts', async () => {
    await AuthService.register({
      email: 'lockout.test@campusconnect.local',
      password: 'password12345',
      displayName: 'Lockout Test',
      campusId: 'STU-LOCK-01',
      role: 'Student',
    });

    // 4 failed attempts
    for (let i = 0; i < 4; i++) {
      await expect(AuthService.login('lockout.test@campusconnect.local', 'wrong_password')).rejects.toThrow(
        'Invalid email/campus ID or password'
      );
    }

    // 5th failed attempt triggers 30-min lockout
    await expect(AuthService.login('lockout.test@campusconnect.local', 'wrong_password')).rejects.toThrow();

    const user = await User.findOne({ email: 'lockout.test@campusconnect.local' });
    expect(user?.failedLoginAttempts).toBe(5);
    expect(user?.lockoutUntil).toBeDefined();
    expect(user?.lockoutUntil!.getTime()).toBeGreaterThan(Date.now());

    // Subsequent login attempt even with correct password is blocked during lockout
    await expect(AuthService.login('lockout.test@campusconnect.local', 'password12345')).rejects.toThrow(
      /Account locked/
    );
  });

  it('should rotate refresh token and verify session version on refresh', async () => {
    await AuthService.register({
      email: 'refresh.test@campusconnect.local',
      password: 'password12345',
      displayName: 'Refresh Test',
      campusId: 'STU-REF-01',
      role: 'Student',
    });

    const initialLogin = await AuthService.login('refresh.test@campusconnect.local', 'password12345');
    const refreshRes = await AuthService.refresh(initialLogin.refreshToken);

    expect(refreshRes.accessToken).toBeDefined();
    expect(refreshRes.refreshToken).toBeDefined();
    expect(refreshRes.refreshToken).not.toBe(initialLogin.refreshToken);

    // Reuse of old refresh token should be rejected
    await expect(AuthService.refresh(initialLogin.refreshToken)).rejects.toThrow();
  });

  it('should perform password reset flow and invalidate existing session version', async () => {
    await AuthService.register({
      email: 'reset.test@campusconnect.local',
      password: 'oldPassword12345',
      displayName: 'Reset Test',
      campusId: 'STU-RST-01',
      role: 'Student',
    });

    const rawToken = await AuthService.requestPasswordReset('reset.test@campusconnect.local');
    expect(typeof rawToken).toBe('string');
    expect(rawToken.length).toBe(64);

    const userBefore = await User.findOne({ email: 'reset.test@campusconnect.local' });
    const initialSessionVersion = userBefore!.sessionVersion;

    const resetSuccess = await AuthService.confirmPasswordReset(rawToken, 'newPassword12345');
    expect(resetSuccess).toBe(true);

    const userAfter = await User.findOne({ email: 'reset.test@campusconnect.local' });
    expect(userAfter!.sessionVersion).toBe(initialSessionVersion + 1);
    expect(userAfter!.resetTokenHash).toBeUndefined();

    // Login with new password should succeed
    const loginRes = await AuthService.login('reset.test@campusconnect.local', 'newPassword12345');
    expect(loginRes.accessToken).toBeDefined();

    // Reusing the reset token should fail
    await expect(AuthService.confirmPasswordReset(rawToken, 'anotherPassword123')).rejects.toThrow(
      'Invalid or expired password reset token'
    );
  });
});
