import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/server/utils/rbac';
import { CommentService } from '@/server/services/comment.service';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { text, body: commentBody } = body;
    const finalBody = text || commentBody;

    if (!finalBody) {
      return NextResponse.json({ error: 'Updated comment text is required' }, { status: 400 });
    }

    const comment = await CommentService.editComment(params.id, payload.sub, finalBody);
    return NextResponse.json({ message: 'Comment edited', comment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to edit comment' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const payload = await authenticateRequest(req);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const comment = await CommentService.deleteComment(params.id, payload.sub, payload.role);
    return NextResponse.json({ message: 'Comment deleted', comment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete comment' }, { status: 400 });
  }
}
