# CampusConnect Implementation Patterns

This reference document summarizes recommended code patterns for API routes, server services, Mongoose models, UI components, authentication, notifications, media upload, and AI integration.

---

## 1. Next.js App Router API Route Pattern (`app/api/`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/server/utils/auth';
import { hasRole } from '@/server/utils/rbac';
import { IssueService } from '@/server/services/issue.service';

export async function POST(req: NextRequest) {
  try {
    // 1. Server-side Authentication
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Server-side Authorization
    if (!hasRole(user, ['Student', 'Staff', 'Administrator'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Payload Parsing & Input Validation
    const body = await req.json();
    if (!body.title || !body.category || !body.location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 4. Service Layer Execution
    const newIssue = await IssueService.createIssue({
      ...body,
      reporterId: user._id.toString(),
    });

    return NextResponse.json({ success: true, data: newIssue }, { status: 201 });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
```

---

## 2. Server Domain Service Pattern (`server/services/`)

```typescript
import { connectToDatabase } from '../db/connection';
import { Issue, IIssue } from '../models/Issue';
import { AuditLog } from '../models/AuditLog';

export class FeatureService {
  static async executeOperation(issueId: string, actingUserId: string): Promise<IIssue> {
    await connectToDatabase();

    const issue = await Issue.findById(issueId);
    if (!issue) throw new Error('Issue not found');

    // Perform state transition or mutation
    issue.status = 'In_Progress';
    await issue.save();

    // Audit Log recording
    await AuditLog.create({
      actingUserId,
      actionType: 'ISSUE_STATUS_UPDATE',
      entityType: 'Issue',
      entityId: issue._id,
      details: { newStatus: 'In_Progress' },
      timestamp: new Date(),
    });

    return issue;
  }
}
```

---

## 3. Mongoose Model Pattern (`server/models/`)

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

export type IssueStatus = 'Reported' | 'Under_Review' | 'Assigned' | 'In_Progress' | 'Resolved' | 'Verified';

export interface IIssue extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  status: IssueStatus;
  createdAt: Date;
}

const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true, trim: true, index: 'text' },
    category: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['Reported', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved', 'Verified'],
      default: 'Reported',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Issue: Model<IIssue> = mongoose.models.Issue || mongoose.model<IIssue>('Issue', IssueSchema);
```

---

## 4. UI Component Presentation Pattern (`components/ui/`)

```tsx
import React from 'react';

export interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let label = status;
  let styleClass = 'bg-blue-50 text-blue-600 border-blue-200';

  const normalized = status.toLowerCase().replace(/[\s_]+/g, '');

  switch (normalized) {
    case 'open':
    case 'reported':
      label = 'Open'; // UI Presentation Mapping only
      styleClass = 'bg-red-50 text-red-600 border-red-200';
      break;
    case 'underreview':
      label = 'Under Review';
      styleClass = 'bg-amber-50 text-amber-600 border-amber-200';
      break;
    case 'assigned':
      label = 'Assigned';
      styleClass = 'bg-orange-50 text-orange-600 border-orange-200';
      break;
    case 'inprogress':
      label = 'In Progress';
      styleClass = 'bg-blue-50 text-blue-600 border-blue-200';
      break;
    case 'resolved':
      label = 'Resolved';
      styleClass = 'bg-emerald-50 text-emerald-600 border-emerald-200';
      break;
    case 'verified':
      label = 'Verified';
      styleClass = 'bg-teal-50 text-teal-700 border-teal-200';
      break;
    default:
      label = status;
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${styleClass}`}>
      {label}
    </span>
  );
};
```

---

## 5. Gemini AI Integration Pattern (`server/services/ai.service.ts`)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
  static async suggestTriage(title: string, description: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful advisory fallback when API key is unconfigured
      return { suggestedCategory: 'General', suggestedPriority: 'Medium', aiTriageStatus: 'Failed' };
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze issue: Title: ${title}, Desc: ${description}`;

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI Timeout')), 5000)),
      ]);

      // Parse JSON output safely...
      return { suggestedCategory: 'AC / Ventilation', suggestedPriority: 'High', aiTriageStatus: 'Completed' };
    } catch (err) {
      return { suggestedCategory: 'General', suggestedPriority: 'Medium', aiTriageStatus: 'Failed' };
    }
  }
}
```
