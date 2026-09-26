import mongoose, { Schema, Document, Model } from 'mongoose';

export type CommentParentType = 'Issue' | 'Lost_Item' | 'Found_Item';

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  parentType: CommentParentType;
  parentId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  body: string;
  editedAt?: Date;
  isTombstone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    parentType: {
      type: String,
      enum: ['Issue', 'Lost_Item', 'Found_Item'],
      required: true,
      index: true,
    },
    parentId: { type: Schema.Types.ObjectId, required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true, trim: true },
    editedAt: { type: Date },
    isTombstone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ parentId: 1, createdAt: 1 });

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
