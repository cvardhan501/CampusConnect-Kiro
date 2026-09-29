import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { MediaService, UploadedMedia } from '@/server/services/media.service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploaded: UploadedMedia[] = [];

    for (const file of files) {
      if (typeof file === 'string') continue;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await MediaService.uploadImageBuffer(
        buffer,
        file.name || 'uploaded_image',
        file.type || 'image/jpeg'
      );

      uploaded.push(result);
    }

    return NextResponse.json({ success: true, files: uploaded }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Image upload failed' }, { status: 400 });
  }
}
