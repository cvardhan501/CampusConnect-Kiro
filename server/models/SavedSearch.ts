import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedSearch extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  category?: string;
  keywords?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedSearchSchema = new Schema<ISavedSearch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    keywords: { type: String, trim: true },
    location: { type: String, trim: true },
  },
  { timestamps: true }
);

export const SavedSearch: Model<ISavedSearch> =
  mongoose.models.SavedSearch || mongoose.model<ISavedSearch>('SavedSearch', SavedSearchSchema);
