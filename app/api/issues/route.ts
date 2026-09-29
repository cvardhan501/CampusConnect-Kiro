import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, logRBACViolation } from '@/server/utils/rbac';
import { IssueService } from '@/server/services/issue.service';
import { SearchService } from '@/server/services/search.service';
import { checkUserRateLimit } from '@/server/utils/rateLimiter';

export async function GET(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;
  const location = searchParams.get('location') || undefined;
  let reporterId = searchParams.get('reporterId') || undefined;
  const assignedTo = searchParams.get('assignedTo') || undefined;
  const cursor = searchParams.get('cursor') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 25;

  // Strict Data Isolation Rule: Student accounts can ONLY query issues they reported
  if (payload.role === 'Student') {
    reporterId = payload.sub;
  }

  const data = await SearchService.searchIssues({
    query: search,
    category,
    status,
    location,
    reporterId,
    assignedTo,
    cursor,
    limit,
  });

  return NextResponse.json({ issues: data.results, nextCursor: data.nextCursor });
}

export async function POST(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { allowed, retryAfter } = checkUserRateLimit(payload.sub);
  if (!allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${retryAfter || 60} seconds.` },
      { status: 429, headers: { 'Retry-After': (retryAfter || 60).toString() } }
    );
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
