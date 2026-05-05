import { NextResponse } from 'next/server';
import { getSavedQuestions } from '@/lib/services/user.service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const clerkId = url.searchParams.get('clerkId');
    const searchQuery = url.searchParams.get('searchQuery') || undefined;
    const filter = url.searchParams.get('filter') || undefined;
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '20');
    if (!clerkId) return NextResponse.json({ error: 'Missing clerkId' }, { status: 400 });
    const res = await getSavedQuestions({ clerkId, searchQuery, filter, page, pageSize });
    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    console.error('GET /api/users/saved-questions error', err);
    return NextResponse.json({ error: 'Failed to fetch saved questions' }, { status: 500 });
  }
}
