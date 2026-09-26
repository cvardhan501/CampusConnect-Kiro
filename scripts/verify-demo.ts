import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User } from '../server/models/User';

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...values] = trimmed.split('=');
        process.env[key.trim()] = values.join('=').replace(/^["']|["']$/g, '').trim();
      }
    }
  }
} catch (e) {}

async function verifyDemo() {
  await mongoose.connect(process.env.MONGODB_URI || '');
  const emails = [
    'student.demo@campusconnect.local',
    'staff.demo@campusconnect.local',
    'admin.demo@campusconnect.local',
  ];

  for (const email of emails) {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[FAIL] ${email} not found!`);
      continue;
    }
    const match = await bcrypt.compare('Demo@12345', user.passwordHash);
    console.log(
      `[PASS] ${user.email} | Role: ${user.role} | Status: ${user.status} | CampusID: ${user.campusId} | Password Valid: ${match}`
    );
  }

  await mongoose.disconnect();
}

verifyDemo();
