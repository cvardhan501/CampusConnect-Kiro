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

// Current Logged in Demo Users for UI switcher
export const DEMO_USERS: Record<string, DemoUser> = {
  student: {
    id: 'usr_stu_1',
    name: 'Vishnu',
    email: 'vishnu@campus.edu',
    role: 'student',
    studentId: 'STU2025884',
    department: 'Computer Science',
    phone: '+1 (555) 234-5678',
  },
  staff: {
    id: 'usr_stf_1',
    name: 'Robert Taylor',
    email: 'robert.taylor@campus.edu',
    role: 'staff',
    department: 'Facilities & Maintenance',
    phone: '+1 (555) 876-5432',
  },
  admin: {
    id: 'usr_adm_1',
    name: 'Dr. Sarah Connor',
    email: 'admin.connor@campus.edu',
    role: 'admin',
    department: 'Campus Administration',
    phone: '+1 (555) 999-0000',
  },
};

export const DEMO_ISSUES: DemoIssue[] = [
  {
    id: 'iss-1',
    issueNumber: '#1024',
    title: 'AC not cooling',
    description: 'The air conditioner unit in Room 204 is blowing warm air and making a loud buzzing sound.',
    category: 'AC / Ventilation',
    building: 'Block C',
    room: 'Room 204',
    status: 'In_Progress',
    priority: 'High',
    reportedBy: 'Vishnu',
    assignedTo: 'Robert Taylor',
    createdAt: 'Apr 24, 2025',
    updatedAt: 'Apr 24, 2025',
    iconType: 'ac',
  },
  {
    id: 'iss-2',
    issueNumber: '#1023',
    title: 'Broken chair',
    description: 'One leg of the study desk chair in the central library main reading hall is completely snapped.',
    category: 'Furniture',
    building: 'Library',
    room: 'Main Hall',
    status: 'Assigned',
    priority: 'Medium',
    reportedBy: 'Vishnu',
    assignedTo: 'Dave Miller',
    createdAt: 'Apr 22, 2025',
    updatedAt: 'Apr 22, 2025',
    iconType: 'chair',
  },
  {
    id: 'iss-3',
    issueNumber: '#1022',
    title: 'Wi-Fi not working',
    description: 'No internet connection on Campus-Guest Wi-Fi network across the entire 2nd floor.',
    category: 'Wi-Fi / Network',
    building: 'Block A',
    room: 'Floor 2',
    status: 'Reported',
    priority: 'Low',
    reportedBy: 'Vishnu',
    createdAt: 'Apr 18, 2025',
    updatedAt: 'Apr 18, 2025',
    iconType: 'wifi',
  },
  {
    id: 'iss-4',
    issueNumber: '#1021',
    title: 'Water leakage',
    description: 'Continuous dripping from the main washroom sink pipe creating a puddle on the floor.',
    category: 'Plumbing',
    building: 'Block B',
    room: 'Washroom 1',
    status: 'Resolved',
    priority: 'High',
    reportedBy: 'Vishnu',
    assignedTo: 'Robert Taylor',
    createdAt: 'Apr 16, 2025',
    updatedAt: 'Apr 17, 2025',
    iconType: 'water',
    resolutionNotes: 'Replaced rubber washer seal and tightened joint pipe.',
  },
  {
    id: 'iss-5',
    issueNumber: '#1020',
    title: 'Flickering hallway lights',
    description: 'Fluorescent lights in the east corridor ceiling are flickering rapidly.',
    category: 'Electrical',
    building: 'Science Building',
    room: 'East Corridor',
    status: 'Verified',
    priority: 'Low',
    reportedBy: 'Anita Roy',
    createdAt: 'Apr 10, 2025',
    updatedAt: 'Apr 12, 2025',
    iconType: 'electrical',
    resolutionNotes: 'Bulb ballast replaced.',
  },
];

export const DEMO_LOST_FOUND_ITEMS: DemoLostFoundItem[] = [
  {
    id: 'lf-1',
    name: 'Black laptop bag',
    description: 'Targus black nylon laptop sleeve containing notebooks and a blue pen drive.',
    category: 'Bags & Accessories',
    type: 'Lost',
    location: 'Block B',
    date: 'Apr 22, 2025',
    status: 'Searching',
    reportedBy: 'Vishnu',
  },
  {
    id: 'lf-2',
    name: 'Wallet',
    description: 'Brown leather tri-fold wallet with student ID inside.',
    category: 'Personal Belongings',
    type: 'Lost',
    location: 'Library',
    date: 'Apr 20, 2025',
    status: 'Possible Match',
    reportedBy: 'Marcus Chen',
  },
  {
    id: 'lf-3',
    name: 'Earbuds',
    description: 'White Apple AirPods Pro case with small scratch on top lid.',
    category: 'Electronics',
    type: 'Lost',
    location: 'Block C',
    date: 'Apr 18, 2025',
    status: 'Searching',
    reportedBy: 'Sophia Patel',
  },
  {
    id: 'lf-4',
    name: 'ID Card',
    description: 'Campus Student Identity card for Vishnu (ID: STU2025884).',
    category: 'Cards & Documents',
    type: 'Found',
    location: 'Cafeteria',
    date: 'Apr 17, 2025',
    status: 'Under Review',
    reportedBy: 'Staff Security',
  },
  {
    id: 'lf-5',
    name: 'Scientific Calculator',
    description: 'Casio fx-991EX ClassWiz scientific calculator found on desk #4.',
    category: 'Electronics',
    type: 'Found',
    location: 'Block A - Room 102',
    date: 'Apr 15, 2025',
    status: 'Claimed',
    reportedBy: 'Robert Taylor',
  },
];

export const DEMO_CLAIMS: DemoClaim[] = [
  {
    id: 'clm-1',
    itemId: 'lf-4',
    itemName: 'ID Card (Found @ Cafeteria)',
    claimedBy: 'Vishnu',
    claimedByEmail: 'vishnu@campus.edu',
    proofDescription: 'My name "Vishnu" is printed on the card and student ID matches STU2025884.',
    status: 'Pending',
    createdAt: 'Apr 17, 2025',
  },
  {
    id: 'clm-2',
    itemId: 'lf-5',
    itemName: 'Scientific Calculator',
    claimedBy: 'David Kim',
    claimedByEmail: 'david.kim@campus.edu',
    proofDescription: 'Small silver sticker with initials DK on the back battery door.',
    status: 'Approved',
    createdAt: 'Apr 16, 2025',
  },
];

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: 'notif-1',
    title: 'Issue Resolved',
    message: 'Your issue #1023 (Broken chair) has been resolved by maintenance staff.',
    timestamp: '2 hours ago',
    read: false,
    type: 'issue',
    link: '/issues/iss-2',
  },
  {
    id: 'notif-2',
    title: 'Claim Match Found',
    message: 'A found item matching your description "ID Card" was reported in Cafeteria.',
    timestamp: '5 hours ago',
    read: false,
    type: 'claim',
    link: '/lost-found/lf-4',
  },
  {
    id: 'notif-3',
    title: 'System Update',
    message: 'Scheduled campus Wi-Fi network maintenance on Saturday, 10 PM.',
    timestamp: '1 day ago',
    read: true,
    type: 'system',
  },
];

export const DEMO_ADMIN_STATS = {
  totalUsers: 248,
  totalUsersTrend: '+12%',
  resolvedIssues: 186,
  resolvedIssuesTrend: '+8%',
  lostItems: 42,
  lostItemsTrend: '+5%',
  returnedItems: 37,
  returnedItemsTrend: '+6%',
  categoryBreakdown: [
    { category: 'AC / Ventilation', percentage: 22, color: '#2563eb' },
    { category: 'Electrical', percentage: 16, color: '#9333ea' },
    { category: 'Plumbing', percentage: 14, color: '#ec4899' },
    { category: 'Furniture', percentage: 12, color: '#f97316' },
    { category: 'Wi-Fi / Network', percentage: 10, color: '#eab308' },
    { category: 'Others', percentage: 24, color: '#10b981' },
  ],
  recentActivity: [
    {
      id: 'act-1',
      title: 'New issue reported',
      details: 'Block A • Wi-Fi Issue',
      timestamp: '2h ago',
      type: 'issue_new',
    },
    {
      id: 'act-2',
      title: 'Item claimed',
      details: 'Black laptop bag',
      timestamp: '4h ago',
      type: 'item_claimed',
    },
    {
      id: 'act-3',
      title: 'Issue resolved',
      details: 'Broken chair • Library',
      timestamp: '6h ago',
      type: 'issue_resolved',
    },
  ],
};

export const DEMO_ADMIN_USERS: DemoUser[] = [
  { id: 'u1', name: 'Vishnu', email: 'vishnu@campus.edu', role: 'student', studentId: 'STU2025884', department: 'Computer Science' },
  { id: 'u2', name: 'Robert Taylor', email: 'robert.taylor@campus.edu', role: 'staff', department: 'Facilities Management' },
  { id: 'u3', name: 'Dr. Sarah Connor', email: 'admin.connor@campus.edu', role: 'admin', department: 'Campus Administration' },
  { id: 'u4', name: 'Sophia Patel', email: 'sophia.p@campus.edu', role: 'student', studentId: 'STU2025885', department: 'Electrical Engineering' },
  { id: 'u5', name: 'Dave Miller', email: 'dave.m@campus.edu', role: 'staff', department: 'IT Support Services' },
];

export const DEMO_AUDIT_LOGS: DemoAuditLog[] = [
  {
    id: 'log-101',
    actor: 'admin.connor@campus.edu',
    role: 'Administrator',
    action: 'USER_ROLE_UPDATE',
    target: 'robert.taylor@campus.edu -> Staff',
    timestamp: '2025-04-24 14:32:05',
    ipAddress: '192.168.1.45',
  },
  {
    id: 'log-102',
    actor: 'robert.taylor@campus.edu',
    role: 'Staff',
    action: 'ISSUE_STATUS_UPDATE',
    target: 'Issue #1024 -> In Progress',
    timestamp: '2025-04-24 11:15:20',
    ipAddress: '192.168.1.88',
  },
  {
    id: 'log-103',
    actor: 'vishnu@campus.edu',
    role: 'Student',
    action: 'ISSUE_SUBMIT',
    target: 'Issue #1024 (AC not cooling)',
    timestamp: '2025-04-24 09:10:00',
    ipAddress: '192.168.2.112',
  },
];
