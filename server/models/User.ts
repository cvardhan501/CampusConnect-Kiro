import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'Student' | 'Staff' | 'Administrator';
export type UserStatus = 'Active' | 'PendingApproval' | 'Deactivated';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  displayName: string;
  campusId: string;
  role: UserRole;
  department?: string;
  phoneNumber?: string;
  contactPhone?: string;
  status: UserStatus;
  sessionVersion: number;
  refreshTokenHash?: string;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
  emailPreferences: {
    issueStatusChange: boolean;
    claimDecision: boolean;
    staffAssignment: boolean;
    criticalIssueCreated: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    campusId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['Student', 'Staff', 'Administrator'],
      default: 'Student',
      required: true,
    },
    department: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'PendingApproval', 'Deactivated'],
      default: 'Active',
      required: true,
    },
    sessionVersion: {
      type: Number,
      default: 1,
      required: true,
    },
    refreshTokenHash: {
      type: String,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockoutUntil: {
      type: Date,
    },
    resetTokenHash: {
      type: String,
    },
    resetTokenExpiresAt: {
      type: Date,
    },
    emailPreferences: {
      issueStatusChange: { type: Boolean, default: true },
      claimDecision: { type: Boolean, default: true },
      staffAssignment: { type: Boolean, default: true },
      criticalIssueCreated: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ role: 1, status: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
