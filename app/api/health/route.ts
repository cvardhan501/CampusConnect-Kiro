import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/server/db/connection';

export async function GET() {
  const start = Date.now();
  let dbStatus = 'Disconnected';

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      dbStatus = 'Connected';
    }
  } catch (err) {
    dbStatus = 'Error';
  }

  const durationMs = Date.now() - start;

  return NextResponse.json(
    {
      status: dbStatus === 'Connected' ? 'Healthy' : 'Unhealthy',
      timestamp: new Date().toISOString(),
      latencyMs: durationMs,
      services: {
        database: dbStatus,
        fileStorage: process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'LocalFallback',
        aiTriage: process.env.GEMINI_API_KEY ? 'Configured' : 'LocalFallback',
        email: process.env.RESEND_API_KEY ? 'Configured' : 'LocalFallback',
      },
    },
    { status: dbStatus === 'Connected' ? 200 : 503 }
  );
}
