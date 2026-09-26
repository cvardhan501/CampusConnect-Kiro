import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  actingUserId?: mongoose.Types.ObjectId;
  actionType: string;
  entityType: string;
  entityId?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actingUserId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    actionType: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ timestamp: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
