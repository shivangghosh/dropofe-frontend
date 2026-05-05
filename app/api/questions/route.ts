import { NextResponse } from 'next/server';
import {
  createQuestion as createQuestionService,
  getQuestionById,
  getAllQuestions,
  upvoteQuestion,
  downvoteQuestion,
  updateQuestion,
  deleteQuestion,
} from '@/lib/services/question.service';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = await createQuestionService(body);
    try {
      revalidatePath('/');
    } catch (e) {
      // revalidation is best-effort
      console.warn('revalidatePath failed', e);
    }
    return NextResponse.json({ question }, { status: 201 });
  } catch (err) {
    console.error('Failed to create question (route)', err);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (id) {
      const question = await getQuestionById(id);
      return NextResponse.json({ question }, { status: 200 });
    }
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '20');
    const searchQuery = url.searchParams.get('searchQuery') || undefined;
    const filter = url.searchParams.get('filter') || undefined;
    const res = await getAllQuestions({ searchQuery, filter, page, pageSize });
    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    console.error('GET /api/questions error', err);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    if (action === 'upvote') {
      const updated = await upvoteQuestion(body);
      return NextResponse.json(updated, { status: 200 });
    }
    if (action === 'downvote') {
      const updated = await downvoteQuestion(body);
      return NextResponse.json(updated, { status: 200 });
    }
    if (action === 'update') {
      const updated = await updateQuestion(body);
      try { revalidatePath(body.path || '/'); } catch (e) {}
      return NextResponse.json(updated, { status: 200 });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('PATCH /api/questions error', err);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { questionId } = body;
    const deleted = await deleteQuestion({ questionId });
    try { revalidatePath('/'); } catch (e) {}
    return NextResponse.json(deleted, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/questions error', err);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
