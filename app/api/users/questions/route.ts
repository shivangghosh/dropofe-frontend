import { NextResponse } from 'next/server';
import { getUserQuestions } from '@/lib/services/user.service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    const res = await getUserQuestions({ userId, page, pageSize });
    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    console.error('GET /api/users/questions error', err);
    return NextResponse.json({ error: 'Failed to fetch user questions' }, { status: 500 });
  }
}
