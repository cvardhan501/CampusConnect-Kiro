import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { connectToDatabase } from '@/server/db/connection';
import { LostFoundItem } from '@/server/models/LostFound';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || undefined;
  const status = searchParams.get('status') || undefined;

  const query: any = {};
  if (type && type !== 'All') query.type = type;
  if (status && status !== 'All') query.status = status;

  const items = await LostFoundItem.find(query)
    .sort({ createdAt: -1 })
    .populate('reporter', 'displayName email role');

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, category, type, location, contactInfo, imageUrl, attachments } = body;

    if (!title || !description || !category || !type || !location || !contactInfo) {
      return NextResponse.json({ error: 'Missing required item fields' }, { status: 400 });
    }

    await connectToDatabase();
    const item = await LostFoundItem.create({
      title: title.trim(),
      description: description.trim(),
      category,
      type,
      location: location.trim(),
      contactInfo: contactInfo.trim(),
      reporter: payload.sub,
      imageUrl: attachments && attachments.length > 0 ? attachments[0].url : imageUrl,
      attachments: attachments || [],
      status: 'Open',
    });

    return NextResponse.json({ message: 'Item created successfully', item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create item' }, { status: 400 });
  }
}
