import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { IssueService } from '@/server/services/issue.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;
  const priority = searchParams.get('priority') || undefined;

  let reporterId: string | undefined = undefined;
  let assignedTo: string | undefined = undefined;

  const rawRole = (payload.role || '').toString().toLowerCase();
  if (rawRole === 'student') {
    reporterId = payload.sub;
  } else if (rawRole === 'staff') {
    assignedTo = payload.sub;
  }

  const issues = await IssueService.listIssues({
    reporterId,
    assignedTo,
    role: payload.role,
    search,
    category,
    status,
    priority,
  });

  return NextResponse.json({ issues });
}

export async function POST(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, category, location, priority, attachments } = body;

    if (!title || !description || !category || !location || !priority) {
      return NextResponse.json({ error: 'Missing required issue fields' }, { status: 400 });
    }

    if (title.length < 5 || title.length > 120) {
      return NextResponse.json({ error: 'Title must be between 5 and 120 characters' }, { status: 400 });
    }

    if (description.length < 20 || description.length > 2000) {
      return NextResponse.json({ error: 'Description must be between 20 and 2000 characters' }, { status: 400 });
    }

    const issue = await IssueService.createIssue({
      title,
      description,
      category,
      location,
      priority,
      attachments,
      reporterId: payload.sub,
    });

    return NextResponse.json({ message: 'Issue created successfully', issue }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create issue' }, { status: 400 });
  }
}
