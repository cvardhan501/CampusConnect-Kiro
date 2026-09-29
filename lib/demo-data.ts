export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  studentId?: string;
  department?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface DemoIssue {
  id: string;
  issueNumber: string;
  title: string;
  description: string;
  category: string;
  building: string;
  room: string;
  status: 'Reported' | 'Under_Review' | 'Assigned' | 'In_Progress' | 'Resolved' | 'Verified';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  iconType: 'ac' | 'chair' | 'wifi' | 'water' | 'electrical' | 'general';
  resolutionNotes?: string;
}

export interface DemoLostFoundItem {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'Lost' | 'Found';
  location: string;
  date: string;
  status: 'Searching' | 'Possible Match' | 'Under Review' | 'Claimed' | 'Returned';
  reportedBy: string;
  imageUrl?: string;
}

export interface DemoClaim {
  id: string;
  itemId: string;
  itemName: string;
  claimedBy: string;
  claimedByEmail: string;
  proofDescription: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'issue' | 'claim' | 'system';
  link?: string;
}

export interface DemoAuditLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress: string;
}

// Types only — real data is queried exclusively from MongoDB APIs
export const DEMO_USERS: Record<string, DemoUser> = {};
export const DEMO_ISSUES: DemoIssue[] = [];
export const DEMO_LOST_FOUND_ITEMS: DemoLostFoundItem[] = [];
export const DEMO_CLAIMS: DemoClaim[] = [];
export const DEMO_NOTIFICATIONS: DemoNotification[] = [];
export const DEMO_ADMIN_STATS = {
  totalUsers: 0,
  totalUsersTrend: '0%',
  resolvedIssues: 0,
  resolvedIssuesTrend: '0%',
  lostItems: 0,
  lostItemsTrend: '0%',
  returnedItems: 0,
  returnedItemsTrend: '0%',
  categoryBreakdown: [],
  recentActivity: [],
};
export const DEMO_ADMIN_USERS: DemoUser[] = [];
export const DEMO_AUDIT_LOGS: DemoAuditLog[] = [];

