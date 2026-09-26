import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAttachment } from './Issue';

export type ItemType = 'Lost' | 'Found';
export type ItemStatus = 'Active' | 'Claimed' | 'Archived' | 'Matched';

export interface IPotentialMatch {
  itemId: mongoose.Types.ObjectId;
  confidenceScore: number;
  reason?: string;
  dismissed?: boolean;
}

export interface ILostFoundItem extends Document {
  _id: mongoose.Types.ObjectId;
  type: ItemType;
  title: string;
  description: string;
  category: string;
  location: string;
  itemDate: Date;
  imageUrl?: string;
  attachments: IAttachment[];
  status: ItemStatus;
  reportedBy: mongoose.Types.ObjectId;
  potentialMatches: IPotentialMatch[];
  createdAt: Date;
  updatedAt: Date;
}

const PotentialMatchSchema = new Schema<IPotentialMatch>({
  itemId: { type: Schema.Types.ObjectId, ref: 'LostFoundItem', required: true },
  confidenceScore: { type: Number, required: true },
  reason: { type: String },
  dismissed: { type: Boolean, default: false },
});

const LostFoundItemSchema = new Schema<ILostFoundItem>(
  {
    type: { type: String, enum: ['Lost', 'Found'], required: true, index: true },
    title: { type: String, required: true, trim: true, index: 'text' },
    description: { type: String, required: true, trim: true, index: 'text' },
    category: { type: String, required: true, index: true },
    location: { type: String, required: true, trim: true, index: true },
    itemDate: { type: Date, required: true, index: true },
    imageUrl: { type: String },
    attachments: [
      {
        url: { type: String, required: true },
        thumbnailUrl: { type: String },
        publicId: { type: String },
        fileType: { type: String, enum: ['JPEG', 'PNG', 'PDF', 'MP4'], required: true },
        fileSize: { type: Number, required: true },
        fileName: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Claimed', 'Archived', 'Matched'],
      default: 'Active',
      required: true,
      index: true,
    },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    potentialMatches: [PotentialMatchSchema],
  },
  { timestamps: true }
);

LostFoundItemSchema.index({ title: 'text', description: 'text' });

export const LostFoundItem: Model<ILostFoundItem> =
  mongoose.models.LostFoundItem ||
  mongoose.model<ILostFoundItem>('LostFoundItem', LostFoundItemSchema);
