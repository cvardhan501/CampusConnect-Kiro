import mongoose, { Schema, Document, Model } from 'mongoose';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus =
  | 'Reported'
  | 'Under_Review'
  | 'Assigned'
  | 'In_Progress'
  | 'Resolved'
  | 'Verified';

export interface IAttachment {
  url: string;
  thumbnailUrl?: string;
  publicId?: string;
  fileType?: string;
  fileSize?: number;
  fileName?: string;
}

export interface ITimelineNote {
  authorName: string;
  authorRole: string;
  note: string;
  timestamp: Date;
}

export interface IIssue extends Document {
  _id: mongoose.Types.ObjectId;
  ticketId: string;
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
  timeline: ITimelineNote[];
  resolutionNote?: string;
  resolutionPhotos?: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  url: { type: String, required: true },
  thumbnailUrl: { type: String },
  publicId: { type: String },
  fileType: { type: String },
  fileSize: { type: Number },
  fileName: { type: String },
});

const TimelineNoteSchema = new Schema<ITimelineNote>({
  authorName: { type: String, required: true },
  authorRole: { type: String, required: true },
  note: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const IssueSchema = new Schema<IIssue>(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: {
      type: String,
      enum: ['Reported', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved', 'Verified'],
      default: 'Reported',
      index: true,
    },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    department: { type: String, trim: true },
    attachments: [AttachmentSchema],
    timeline: [TimelineNoteSchema],
    resolutionNote: { type: String, trim: true },
    resolutionPhotos: [AttachmentSchema],
  },
  { timestamps: true }
);

export const Issue: Model<IIssue> = mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);
