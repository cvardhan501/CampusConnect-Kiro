import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/server/utils/rbac';
import { connectToDatabase } from '@/server/db/connection';
import { User } from '@/server/models/User';
import { Issue } from '@/server/models/Issue';
import { AuthService } from '@/server/services/auth.service';

export const dynamic = 'force-dynamic';

export const GET = requireRole('Administrator', async (req: NextRequest) => {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role') || undefined;

  const query: any = {};
  if (role) {
    query.role = role;
  }

  const users = await User.find(query).select('-passwordHash -refreshTokenHash').sort({ createdAt: -1 });

  // Compute active task counts for staff
  const staffTaskCounts: Record<string, number> = {};
  const activeIssues = await Issue.find({
    status: { $in: ['Reported', 'Under_Review', 'Assigned', 'In_Progress'] },
    assignedTo: { $exists: true, $ne: null },
  });

  for (const issue of activeIssues) {
    const sId = issue.assignedTo?.toString();
    if (sId) {
      staffTaskCounts[sId] = (staffTaskCounts[sId] || 0) + 1;
    }
  }

  const usersWithCounts = users.map((u) => ({
    ...u.toObject(),
    id: u._id.toString(),
    activeTasks: staffTaskCounts[u._id.toString()] || 0,
  }));

  return NextResponse.json({ users: usersWithCounts });
});

export const POST = requireRole('Administrator', async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { email, password, displayName, campusId, role, department, phoneNumber } = body;

    const user = await AuthService.register({
      email,
      password,
      displayName,
      campusId,
      role: role || 'Staff',
      department,
      phoneNumber,
    });

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create user' }, { status: 400 });
  }
});
