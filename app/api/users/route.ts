import { NextResponse } from 'next/server';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser, getSavedQuestions, toggleSaveQuestion } from '@/lib/services/user.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error('POST /api/users error', err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const clerkId = url.searchParams.get('clerkId');
    if (clerkId) {
      const user = await getUserById(clerkId);
      return NextResponse.json(user, { status: 200 });
    }
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '20');
    const searchQuery = url.searchParams.get('searchQuery') || undefined;
    const filter = url.searchParams.get('filter') || undefined;
    const res = await getAllUsers({ searchQuery, filter, page, pageSize });
    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    console.error('GET /api/users error', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    if (action === 'toggleSave') {
      const { questionId, userId } = body;
      if (!questionId || !userId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
      await toggleSaveQuestion({ questionId, userId });
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    const { clerkId, payload } = body;
    if (!clerkId || !payload) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const updated = await updateUser(clerkId, payload);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error('PATCH /api/users error', err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { clerkId } = body;
    if (!clerkId) return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 });
    const deleted = await deleteUser(clerkId);
    return NextResponse.json(deleted, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/users error', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
