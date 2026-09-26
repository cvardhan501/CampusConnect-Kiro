import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User } from '../server/models/User';
import { Issue } from '../server/models/Issue';
import { LostFoundItem } from '../server/models/LostFound';
import { Claim } from '../server/models/Claim';
import { Comment } from '../server/models/Comment';
import { Notification } from '../server/models/Notification';
import { AuditLog } from '../server/models/AuditLog';

// Load .env.local manually
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...values] = trimmed.split('=');
        const val = values.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val.trim();
        }
      }
    }
  }
} catch (e) {
  console.warn('Failed to parse .env.local:', e);
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-connect';

async function seedDemoData() {
  console.log('Connecting to MongoDB Atlas / Local database...');
  await mongoose.connect(MONGODB_URI);

  const passwordHash = await bcrypt.hash('Demo@12345', 12);

  // 1. Seed Demo Accounts
  console.log('Creating demo accounts...');
  const student = await User.findOneAndUpdate(
    { email: 'student.demo@campusconnect.local' },
    {
      email: 'student.demo@campusconnect.local',
      campusId: 'CC-DEMO-001',
      displayName: 'Alex Morgan (Student)',
      passwordHash,
      role: 'Student',
      status: 'Active',
      department: 'Computer Science',
      phoneNumber: '+1-555-0192',
    },
    { upsert: true, new: true }
  );

  const staff = await User.findOneAndUpdate(
    { email: 'staff.demo@campusconnect.local' },
    {
      email: 'staff.demo@campusconnect.local',
      campusId: 'CC-STAFF-001',
      displayName: 'David Miller (Facilities Staff)',
      passwordHash,
      role: 'Staff',
      status: 'Active',
      department: 'Facilities',
      phoneNumber: '+1-555-0144',
    },
    { upsert: true, new: true }
  );

  const admin = await User.findOneAndUpdate(
    { email: 'admin.demo@campusconnect.local' },
    {
      email: 'admin.demo@campusconnect.local',
      campusId: 'CC-ADMIN-001',
      displayName: 'Dr. Sarah Jenkins (Administrator)',
      passwordHash,
      role: 'Administrator',
      status: 'Active',
      department: 'Campus Administration',
      phoneNumber: '+1-555-0100',
    },
    { upsert: true, new: true }
  );

  console.log('Demo accounts created/updated successfully.');

  // 2. Interconnected Demo Issues
  console.log('Creating interconnected demo issues...');
  const issue1 = await Issue.create({
    title: 'Broken Projector in Science Hall Lab 204',
    description: 'The overhead projector power supply fluctuates and turns off every 5 minutes during lecture.',
    category: 'IT_Network',
    location: 'Science Hall 204',
    priority: 'High',
    status: 'In_Progress',
    reporter: student._id,
    assignedTo: staff._id,
    department: 'Facilities',
    aiTriageStatus: 'Completed',
    aiSuggestedCategory: 'IT_Network',
    aiSuggestedPriority: 'High',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  });

  const issue2 = await Issue.create({
    title: 'Water Leak Near Library East Wing Restrooms',
    description: 'A major water leak has formed under the sink on the second floor, causing slippery tile conditions.',
    category: 'Plumbing',
    location: 'Central Library Floor 2',
    priority: 'Critical',
    status: 'Reported',
    reporter: student._id,
    department: 'Facilities',
    aiTriageStatus: 'Completed',
    aiSuggestedCategory: 'Plumbing',
    aiSuggestedPriority: 'Critical',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  });

  const issue3 = await Issue.create({
    title: 'Main Quad Streetlight Outage',
    description: 'Two lamp posts near the student center pathway are completely unlit after 8 PM.',
    category: 'Electrical',
    location: 'Student Center Pathway',
    priority: 'Medium',
    status: 'Resolved',
    reporter: student._id,
    assignedTo: staff._id,
    resolutionNote: 'Replaced faulty breaker and LED bulb assembly. Tested pathway illumination.',
    verificationWindowExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    aiTriageStatus: 'Completed',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  });

  // 3. Interconnected Comments
  await Comment.create({
    parentType: 'Issue',
    parentId: issue1._id,
    authorId: staff._id,
    body: 'Ordered replacement power supply unit from vendor. Will install on Thursday morning.',
    isTombstone: false,
  });

  await Comment.create({
    parentType: 'Issue',
    parentId: issue1._id,
    authorId: student._id,
    body: 'Thank you! The morning class starts at 9 AM.',
    isTombstone: false,
  });

  // 4. Lost & Found + Claims
  console.log('Creating Lost & Found items and claims...');
  const foundItem = await LostFoundItem.create({
    type: 'Found',
    title: 'Silver MacBook Air M2 in Black Sleeve',
    description: 'Left on the 3rd floor quiet study desk in the Library. Contains campus sticker on lid.',
    category: 'Electronics',
    location: 'Main Library 3rd Floor',
    itemDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'Active',
    reportedBy: staff._id,
  });

  const lostItem = await LostFoundItem.create({
    type: 'Lost',
    title: 'Lost Apple MacBook Air Silver',
    description: 'Lost my silver laptop with stickers on the lid somewhere in the Library yesterday.',
    category: 'Electronics',
    location: 'Main Library',
    itemDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'Active',
    reportedBy: student._id,
  });

  const claim = await Claim.create({
    foundItemId: foundItem._id,
    claimantId: student._id,
    ownershipEvidence: 'It is a silver 13-inch MacBook Air with a blue React sticker and a NASA sticker on the top shell. Serial number ends in 4X89.',
    status: 'Pending',
  });

  // 5. Notifications & Audit Logs
  await Notification.create({
    userId: student._id,
    type: 'IssueStatusChange',
    title: 'Issue Updated to In_Progress',
    message: 'Your issue "Broken Projector in Science Hall Lab 204" is now in progress.',
    link: `/issues/${issue1._id}`,
    isRead: false,
  });

  await AuditLog.create({
    actingUserId: student._id.toString(),
    actionType: 'ISSUE_CREATED',
    entityType: 'Issue',
    entityId: issue1._id,
    details: { priority: 'High', category: 'IT_Network' },
    timestamp: new Date(),
  });

  await AuditLog.create({
    actingUserId: staff._id.toString(),
    actionType: 'CLAIM_SUBMITTED',
    entityType: 'Claim',
    entityId: claim._id,
    details: { foundItemId: foundItem._id },
    timestamp: new Date(),
  });

  console.log('✅ Demo Environment Successfully Seeded!');
  console.log('--------------------------------------------------');
  console.log('Student:       student.demo@campusconnect.local / Demo@12345');
  console.log('Staff:         staff.demo@campusconnect.local   / Demo@12345');
  console.log('Administrator: admin.demo@campusconnect.local   / Demo@12345');
  console.log('--------------------------------------------------');

  await mongoose.disconnect();
}

seedDemoData().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
