import { NextResponse } from 'next/server';
import { createAnswer, getAllAnswers, upvoteAnswer, downvoteAnswer, deleteAnswer } from '@/lib/services/answer.service';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const answer = await createAnswer(body);
    try { revalidatePath('/'); } catch (e) {}
    return NextResponse.json({ answer }, { status: 201 });
  } catch (err) {
    console.error('POST /api/answers error', err);
    return NextResponse.json({ error: 'Failed to create answer' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const questionId = url.searchParams.get('questionId') || '';
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');
    const sortBy = url.searchParams.get('sortBy') || undefined;
    const res = await getAllAnswers({ questionId, page, pageSize, sortBy });
    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    console.error('GET /api/answers error', err);
    return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    if (action === 'upvote') {
      const updated = await upvoteAnswer(body);
      return NextResponse.json(updated, { status: 200 });
    }
    if (action === 'downvote') {
      const updated = await downvoteAnswer(body);
      return NextResponse.json(updated, { status: 200 });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('PATCH /api/answers error', err);
    return NextResponse.json({ error: 'Failed to update answer' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { answerId } = body;
    const deleted = await deleteAnswer({ answerId });
    try { revalidatePath('/'); } catch (e) {}
    return NextResponse.json(deleted, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/answers error', err);
    return NextResponse.json({ error: 'Failed to delete answer' }, { status: 500 });
  }
}
