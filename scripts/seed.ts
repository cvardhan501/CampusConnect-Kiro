import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../server/models/User';
import { Issue } from '../server/models/Issue';
import { LostFoundItem } from '../server/models/LostFound';
import { Claim } from '../server/models/Claim';
import { Comment } from '../server/models/Comment';
import { Notification } from '../server/models/Notification';
import { AuditLog } from '../server/models/AuditLog';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cvardhan501:g80sV0H16lmdz09L@campusconnect.q0vvh.mongodb.net/campusconnect?retryWrites=true&w=majority';

async function seed() {
  console.log('🌱 Starting CampusConnect Demo Data Seeding...');
  await mongoose.connect(MONGODB_URI);

  const passwordHash = await bcrypt.hash('Demo@12345', 12);

  // 1. Create Demo Users (Idempotent upsert)
  const student = await User.findOneAndUpdate(
    { email: 'student.demo@campusconnect.local' },
    {
      email: 'student.demo@campusconnect.local',
      passwordHash,
      displayName: 'Vishnu Vardhan',
      campusId: 'CC-DEMO-001',
      role: 'Student',
      status: 'Active',
      sessionVersion: 1,
    },
    { upsert: true, new: true }
  );

  const staff = await User.findOneAndUpdate(
    { email: 'staff.demo@campusconnect.local' },
    {
      email: 'staff.demo@campusconnect.local',
      passwordHash,
      displayName: 'Facilities Officer Sarah',
      campusId: 'CC-STAFF-001',
      role: 'Staff',
      department: 'Facilities',
      status: 'Active',
      sessionVersion: 1,
    },
    { upsert: true, new: true }
  );

  const admin = await User.findOneAndUpdate(
    { email: 'admin.demo@campusconnect.local' },
    {
      email: 'admin.demo@campusconnect.local',
      passwordHash,
      displayName: 'Campus Admin Alex',
      campusId: 'CC-ADMIN-001',
      role: 'Administrator',
      status: 'Active',
      sessionVersion: 1,
    },
    { upsert: true, new: true }
  );

  console.log('✅ Demo users seeded successfully.');

  // 2. Clear & Seed Realistic Demo Issues
  await Issue.deleteMany({ reporter: { $in: [student._id, staff._id, admin._id] } });

  const issue1 = await Issue.create({
    title: 'AC not cooling',
    description: 'The air conditioning unit in Block C - Room 204 is blowing warm air and making a loud rattling noise.',
    category: 'Facilities',
    location: 'Block C - Room 204',
    priority: 'High',
    status: 'In_Progress',
    reporter: student._id,
    assignedTo: staff._id,
    department: 'Facilities',
  });

  const issue2 = await Issue.create({
    title: 'Broken chair',
    description: 'A wooden desk chair in the main reading library has a cracked leg and needs replacement.',
    category: 'Furniture',
    location: 'Library 2nd Floor',
    priority: 'Medium',
    status: 'Reported',
    reporter: student._id,
  });

  const issue3 = await Issue.create({
    title: 'Wi-Fi not working',
    description: 'High latency and dropping connections on Campus_Secure network across all 3rd floor classrooms in Block A.',
    category: 'IT_Network',
    location: 'Block A - 3rd Floor',
    priority: 'High',
    status: 'Reported',
    reporter: student._id,
  });

  const issue4 = await Issue.create({
    title: 'Water leakage',
    description: 'Continuous pipe leak near the washroom entrance in Block B causing water pool hazard.',
    category: 'Plumbing',
    location: 'Block B - Washroom',
    priority: 'Critical',
    status: 'Resolved',
    reporter: student._id,
    assignedTo: staff._id,
    resolutionNote: 'Replaced damaged PVC elbow joint and sanitized flooded floor area.',
    verificationWindowExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });

  console.log('✅ Demo issues seeded successfully.');

  // 3. Seed Realistic Lost & Found Items
  await LostFoundItem.deleteMany({ reportedBy: { $in: [student._id, staff._id, admin._id] } });

  const lostItem1 = await LostFoundItem.create({
    type: 'Lost',
    title: 'Black laptop bag',
    description: 'Black Targus laptop backpack containing notebooks and a blue pencil case.',
    category: 'Electronics',
    location: 'Block B',
    itemDate: new Date('2025-04-22'),
    status: 'Active',
    reportedBy: student._id,
  });

  const foundItem1 = await LostFoundItem.create({
    type: 'Found',
    title: 'Wallet',
    description: 'Brown leather tri-fold wallet found on bench near Library entrance.',
    category: 'ID_Cards',
    location: 'Library',
    itemDate: new Date('2025-04-20'),
    status: 'Active',
    reportedBy: staff._id,
  });

  const lostItem2 = await LostFoundItem.create({
    type: 'Lost',
    title: 'Earbuds',
    description: 'White wireless earbud charging case lost near Block C courtyard.',
    category: 'Electronics',
    location: 'Block C',
    itemDate: new Date('2025-04-18'),
    status: 'Active',
    reportedBy: student._id,
  });

  const foundItem2 = await LostFoundItem.create({
    type: 'Found',
    title: 'ID Card',
    description: 'Student identification card belonging to computer science department.',
    category: 'ID_Cards',
    location: 'Cafeteria',
    itemDate: new Date('2025-04-17'),
    status: 'Claimed',
    reportedBy: staff._id,
  });

  console.log('✅ Demo Lost & Found items seeded successfully.');

  // 4. Seed Demo Claim
  await Claim.deleteMany({ claimantId: student._id });
  await Claim.create({
    foundItemId: foundItem1._id,
    claimantId: student._id,
    ownershipEvidence: 'Brown leather wallet containing my library card and student badge matching my name.',
    status: 'Pending',
  });

  // 5. Seed Demo Comments
  await Comment.deleteMany({ authorId: { $in: [student._id, staff._id, admin._id] } });
  await Comment.create({
    parentType: 'Issue',
    parentId: issue1._id,
    authorId: staff._id,
    body: 'Assigned HVAC technician Team Alpha to inspect the compressor fan.',
  });

  // 6. Seed Demo Notifications
  await Notification.deleteMany({ userId: { $in: [student._id, staff._id, admin._id] } });
  await Notification.create({
    userId: student._id,
    type: 'IssueStatusChange',
    title: 'Issue Status Updated: Resolved',
    message: 'Your issue #1023 "Water leakage" has been resolved.',
    link: `/issues/${issue4._id}`,
    isRead: false,
  });

  // 7. Seed Demo Audit Log
  await AuditLog.create({
    actingUserId: admin._id,
    actionType: 'DEMO_SEED_COMPLETED',
    entityType: 'System',
    details: { environment: 'Development' },
    timestamp: new Date(),
  });

  console.log('\n🎉 CampusConnect Demo Data Seeding Completed Successfully!');
  console.log('--------------------------------------------------');
  console.log('DEMO STUDENT: student.demo@campusconnect.local / Demo@12345');
  console.log('DEMO STAFF:   staff.demo@campusconnect.local   / Demo@12345');
  console.log('DEMO ADMIN:   admin.demo@campusconnect.local   / Demo@12345');
  console.log('--------------------------------------------------\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
