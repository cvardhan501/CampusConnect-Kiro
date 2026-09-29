import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'Student' | 'Staff' | 'Administrator';

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
  status: 'Active' | 'Deactivated';
  sessionVersion: number;
  refreshTokenHash?: string;
  resetTokenHash?: string;
  resetTokenExpiry?: Date;
  failedLoginAttempts?: number;
  lockoutUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    campusId: { type: String, required: true, unique: true, trim: true, index: true },
    role: { type: String, enum: ['Student', 'Staff', 'Administrator'], required: true },
    department: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    status: { type: String, enum: ['Active', 'Deactivated'], default: 'Active', required: true },
    sessionVersion: { type: Number, default: 1, required: true },
    refreshTokenHash: { type: String },
    resetTokenHash: { type: String },
    resetTokenExpiry: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
