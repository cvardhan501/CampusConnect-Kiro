import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { LostFoundService } from '@/server/services/lostfound.service';
import { SearchService } from '@/server/services/search.service';

export async function GET(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || undefined;
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const cursor = searchParams.get('cursor') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 25;

  const data = await SearchService.searchLostFound({
    query: search,
    category,
    status,
    cursor,
    limit,
  });

  let results = data.results;
  if (type) {
    results = results.filter((i) => i.type === type);
  }

  return NextResponse.json({ items: results, nextCursor: data.nextCursor });
}

export async function POST(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, title, description, category, location, itemDate, imageUrl, attachments } = body;

    if (!type || !title || !description || !category || !location || !itemDate) {
      return NextResponse.json({ error: 'Missing required item fields' }, { status: 400 });
    }

    const item = await LostFoundService.createItem({
      type,
      title,
      description,
      category,
      location,
      itemDate: new Date(itemDate),
      imageUrl,
      attachments,
      reportedBy: payload.sub,
    });

    return NextResponse.json({ message: 'Item posted successfully', item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to post item' }, { status: 400 });
  }
}
