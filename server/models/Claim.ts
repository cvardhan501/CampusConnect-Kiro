import mongoose, { Schema, Document, Model } from 'mongoose';

export type ClaimStatus = 'Pending' | 'Approved' | 'Rejected' | 'Archived';

export interface IClaim extends Document {
  _id: mongoose.Types.ObjectId;
  foundItemId: mongoose.Types.ObjectId;
  claimantId: mongoose.Types.ObjectId;
  ownershipEvidence: string;
  status: ClaimStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaim>(
  {
    foundItemId: { type: Schema.Types.ObjectId, ref: 'LostFoundItem', required: true, index: true },
    claimantId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownershipEvidence: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Archived'],
      default: 'Pending',
      required: true,
      index: true,
    },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);

ClaimSchema.index({ foundItemId: 1, claimantId: 1, status: 1 });

export const Claim: Model<IClaim> =
  mongoose.models.Claim || mongoose.model<IClaim>('Claim', ClaimSchema);
