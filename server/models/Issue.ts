import mongoose, { Schema, Document, Model } from 'mongoose';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus =
  | 'Reported'
  | 'Under_Review'
  | 'Assigned'
  | 'In_Progress'
  | 'Resolved'
  | 'Verified'
  | 'Closed'
  | 'Closed_Duplicate';

export interface IAttachment {
  url: string;
  thumbnailUrl?: string;
  publicId?: string;
  fileType: 'JPEG' | 'PNG' | 'PDF' | 'MP4';
  fileSize: number;
  fileName: string;
}

export interface IPotentialDuplicate {
  issueId: mongoose.Types.ObjectId;
  similarityScore: number;
  reason?: string;
  dismissed?: boolean;
}

export interface IIssue extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: IssuePriority;
  status: IssueStatus;
  reporter: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  department?: string;
  attachments: IAttachment[];
  resolutionNote?: string;
  resolutionPhotos?: IAttachment[];
  verificationWindowExpiresAt?: Date;
  staleReminderSent?: boolean;
  aiTriageStatus: 'Pending' | 'Completed' | 'Failed' | 'Overridden';
  aiSuggestedCategory?: string;
  aiSuggestedPriority?: IssuePriority;
  potentialDuplicates: IPotentialDuplicate[];
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  publicId: { type: String },
  fileType: { type: String, enum: ['JPEG', 'PNG', 'PDF', 'MP4'], required: true },
  fileSize: { type: Number, required: true },
  fileName: { type: String, required: true },
});

const PotentialDuplicateSchema = new Schema<IPotentialDuplicate>({
  issueId: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
  similarityScore: { type: Number, required: true },
  reason: { type: String },
  dismissed: { type: Boolean, default: false },
});

const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true, trim: true, index: 'text' },
    description: { type: String, required: true, trim: true, index: 'text' },
    category: { type: String, required: true, index: true },
    location: { type: String, required: true, trim: true, index: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'Reported',
        'Under_Review',
        'Assigned',
        'In_Progress',
        'Resolved',
        'Verified',
        'Closed',
        'Closed_Duplicate',
      ],
      default: 'Reported',
      required: true,
      index: true,
    },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    department: { type: String, index: true },
    attachments: [AttachmentSchema],
    resolutionNote: { type: String },
    resolutionPhotos: [AttachmentSchema],
    verificationWindowExpiresAt: { type: Date, index: true },
    staleReminderSent: { type: Boolean, default: false },
    aiTriageStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Overridden'],
      default: 'Pending',
    },
    aiSuggestedCategory: { type: String },
    aiSuggestedPriority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
    potentialDuplicates: [PotentialDuplicateSchema],
  },
  { timestamps: true }
);

IssueSchema.index({ title: 'text', description: 'text' });

export const Issue: Model<IIssue> =
  mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);
