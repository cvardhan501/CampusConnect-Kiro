import mongoose, { Schema, Document, Model } from 'mongoose';

export type ItemType = 'Lost' | 'Found';
export type ItemStatus = 'Open' | 'Claimed' | 'Resolved';

export interface ILostFound extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  type: ItemType;
  location: string;
  date: Date;
  reporter: mongoose.Types.ObjectId;
  contactInfo: string;
  status: ItemStatus;
  imageUrl?: string;
  attachments?: any[];
  createdAt: Date;
  updatedAt: Date;
}

const LostFoundSchema = new Schema<ILostFound>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Lost', 'Found'], required: true, index: true },
    location: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contactInfo: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Open', 'Claimed', 'Resolved'], default: 'Open', index: true },
    imageUrl: { type: String },
    attachments: [
      {
        url: { type: String },
        thumbnailUrl: { type: String },
        publicId: { type: String },
        fileType: { type: String },
        fileSize: { type: Number },
        fileName: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const LostFoundItem: Model<ILostFound> =
  mongoose.models.LostFoundItem || mongoose.model<ILostFound>('LostFoundItem', LostFoundSchema);
