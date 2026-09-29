import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { connectToDatabase } from '@/server/db/connection';
import { Announcement } from '@/server/models/Announcement';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectToDatabase();
  const announcements = await Announcement.find()
    .sort({ createdAt: -1 })
    .populate('author', 'displayName role');

  return NextResponse.json({ announcements });
}

export async function POST(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload || (payload.role !== 'Administrator' && payload.role !== 'Staff')) {
    return NextResponse.json({ error: 'Unauthorized: Staff or Admin only' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, content, category, priority } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await connectToDatabase();
    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      priority: priority || 'Normal',
      author: payload.sub,
    });

    return NextResponse.json({ message: 'Announcement posted', announcement }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to post announcement' }, { status: 400 });
  }
}
