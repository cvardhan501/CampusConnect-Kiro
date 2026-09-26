import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { SearchService } from '@/server/services/search.service';

export async function GET(req: NextRequest) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || searchParams.get('search') || '';
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;

  try {
    const [issuesData, lostFoundData] = await Promise.all([
      SearchService.searchIssues({ query: q, category, status, limit: 15 }),
      SearchService.searchLostFound({ query: q, category, status, limit: 15 }),
    ]);

    return NextResponse.json({
      issues: issuesData.results,
      lostFound: lostFoundData.results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Search failed' }, { status: 400 });
  }
}
