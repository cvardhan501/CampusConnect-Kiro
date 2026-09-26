import { connectToDatabase } from '../db/connection';
import { User, IUser, UserRole, UserStatus } from '../models/User';
import { invalidateSessionCache } from '../utils/sessionCache';
import { AuditLog } from '../models/AuditLog';

export class UserService {
  static async getById(userId: string): Promise<IUser | null> {
    await connectToDatabase();
    return User.findById(userId).select('-passwordHash -resetTokenHash');
  }

  static async listUsers(filters: { role?: UserRole; status?: UserStatus; search?: string }) {
    await connectToDatabase();
    const query: any = {};

    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      query.$or = [
        { displayName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { campusId: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return User.find(query).select('-passwordHash -resetTokenHash').sort({ createdAt: -1 });
  }

  static async updateProfile(userId: string, data: { displayName?: string; department?: string; contactPhone?: string }): Promise<IUser> {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (data.displayName) user.displayName = data.displayName;
    if (data.department !== undefined) user.department = data.department;
    if (data.contactPhone !== undefined) user.contactPhone = data.contactPhone;

    await user.save();
    return user;
  }

  static async updateUserRole(adminUserId: string, targetUserId: string, newRole: UserRole): Promise<IUser> {
    await connectToDatabase();

    const user = await User.findById(targetUserId);
    if (!user) throw new Error('User not found');

    const oldRole = user.role;
    user.role = newRole;
    user.sessionVersion += 1; // Increment sessionVersion to invalidate active JWT tokens within 5 seconds
    await user.save();

    invalidateSessionCache(user._id.toString());

    await AuditLog.create({
      actingUserId: adminUserId,
      actionType: 'USER_ROLE_CHANGED',
      entityType: 'User',
      entityId: user._id,
      details: { oldRole, newRole, newSessionVersion: user.sessionVersion },
      timestamp: new Date(),
    });

    return user;
  }

  static async updateUserStatus(adminUserId: string, targetUserId: string, newStatus: UserStatus): Promise<IUser> {
    await connectToDatabase();

    const user = await User.findById(targetUserId);
    if (!user) throw new Error('User not found');

    const oldStatus = user.status;
    user.status = newStatus;
    if (newStatus === 'Deactivated') {
      user.sessionVersion += 1;
      invalidateSessionCache(user._id.toString());
    }
    await user.save();

    await AuditLog.create({
      actingUserId: adminUserId,
      actionType: 'USER_STATUS_CHANGED',
      entityType: 'User',
      entityId: user._id,
      details: { oldStatus, newStatus },
      timestamp: new Date(),
    });

    return user;
  }

  static async deleteUser(adminUserId: string, targetUserId: string): Promise<void> {
    await connectToDatabase();

    const user = await User.findById(targetUserId);
    if (!user) throw new Error('User not found');

    const originalEmail = user.email;
    const originalCampusId = user.campusId;

    // Pseudonymize direct identifiers
    user.displayName = 'Pseudonymized User';
    user.email = `deleted-${user._id.toString()}@pseudonymized.local`;
    user.campusId = `DEL-${user._id.toString().substring(0, 8)}`;
    user.department = undefined;
    user.contactPhone = undefined;
    user.status = 'Deactivated';
    user.sessionVersion += 1;
    user.passwordHash = '$2b$12$PseudonymizedAccountNoLoginPermittedHere123456789012345';
    user.resetTokenHash = undefined;

    await user.save();
    invalidateSessionCache(user._id.toString());

    await AuditLog.create({
      actingUserId: adminUserId,
      actionType: 'USER_DELETED',
      entityType: 'User',
      entityId: user._id,
      details: { pseudonymized: true, originalEmail, originalCampusId },
      timestamp: new Date(),
    });
  }
}
