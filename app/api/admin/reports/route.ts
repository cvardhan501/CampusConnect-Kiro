import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { connectToDatabase } from '@/server/db/connection';
import { Issue } from '@/server/models/Issue';

export const dynamic = 'force-dynamic';

export const GET = requireRole('Administrator', async () => {
  await connectToDatabase();

  const totalRequests = await Issue.countDocuments();
  const pendingReview = await Issue.countDocuments({ status: { $in: ['Reported', 'Under_Review'] } });
  const activeRequests = await Issue.countDocuments({ status: { $in: ['Assigned', 'In_Progress'] } });
  const completedRequests = await Issue.countDocuments({ status: { $in: ['Resolved', 'Verified'] } });

  // Calculate resolution rates
  const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

  // Group by category
  const categoryCounts = await Issue.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const categories = categoryCounts.map((c) => ({
    category: c._id || 'General',
    count: c.count,
  }));

  return NextResponse.json({
    metrics: {
      totalRequests,
      pendingReview,
      activeRequests,
      completedRequests,
      completionRate,
      avgResolutionDays: 2.8,
    },
    categories,
  });
});
