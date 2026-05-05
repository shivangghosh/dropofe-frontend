import { NextResponse } from 'next/server';
import { getQuestionCount } from '@/lib/services/question.service';
import { getUserCount } from '@/lib/services/user.service';
import { getTagCount } from '@/lib/services/tag.service';

export async function GET(req: Request) {
  try {
    const [questions, users, tags] = await Promise.all([
      getQuestionCount(),
      getUserCount(),
      getTagCount(),
    ]);
    return NextResponse.json({ questions, users, tags }, { status: 200 });
  } catch (err) {
    console.error('GET /api/stats error', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
