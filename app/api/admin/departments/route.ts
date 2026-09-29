import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { connectToDatabase } from '@/server/db/connection';
import { Department } from '@/server/models/Department';
import { Issue } from '@/server/models/Issue';

export const dynamic = 'force-dynamic';

export const GET = requireRole('Administrator', async () => {
  await connectToDatabase();
  let departments = await Department.find().sort({ name: 1 });

  if (departments.length === 0) {
    // Seed standard campus departments if empty
    departments = await Department.create([
      { name: 'Facilities', headName: 'Rohan Kumar', status: 'Active' },
      { name: 'IT Support', headName: 'Sneha Iyer', status: 'Active' },
      { name: 'Maintenance', headName: 'Vipin Rao', status: 'Active' },
      { name: 'Electrical', headName: 'Arjun Mehta', status: 'Active' },
      { name: 'Plumbing', headName: 'Deepak Singh', status: 'Active' },
      { name: 'Security', headName: 'Karthik Reddy', status: 'Active' },
    ]);
  }

  // Calculate real active request count per department
  const activeIssues = await Issue.find({ status: { $in: ['Reported', 'Under_Review', 'Assigned', 'In_Progress'] } });
  const counts: Record<string, number> = {};
  for (const issue of activeIssues) {
    const dept = issue.department || issue.category;
    if (dept) {
      counts[dept] = (counts[dept] || 0) + 1;
    }
  }

  const deptWithCounts = departments.map((d) => ({
    ...d.toObject(),
    id: d._id.toString(),
    activeRequests: counts[d.name] || 0,
  }));

  return NextResponse.json({ departments: deptWithCounts });
});
