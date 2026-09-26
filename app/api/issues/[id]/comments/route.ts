import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { CommentService } from '@/server/services/comment.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const comments = await CommentService.getCommentsForParent(params.id);
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { text, body: commentBody } = body;
    const finalBody = text || commentBody;

    if (!finalBody) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 });
    }

    const comment = await CommentService.createComment('Issue', params.id, payload.sub, finalBody);
    return NextResponse.json({ message: 'Comment added successfully', comment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add comment' }, { status: 400 });
  }
}
