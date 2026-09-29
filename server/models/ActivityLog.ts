import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  actingUserId?: mongoose.Types.ObjectId;
  actingUserName?: string;
  actingUserRole?: string;
  actionType: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId | string;
  details?: Record<string, any>;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    actingUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    actingUserName: { type: String },
    actingUserRole: { type: String },
    actionType: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.Mixed },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
