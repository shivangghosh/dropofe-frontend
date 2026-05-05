import { NextResponse } from 'next/server';
import { getTopInteractedTags } from '@/lib/services/tag.service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || undefined;
    const limit = Number(url.searchParams.get('limit') || '3');
    const res = await getTopInteractedTags({ userId, limit });
    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    console.error('GET /api/tags/top error', err);
    return NextResponse.json({ error: 'Failed to fetch top tags' }, { status: 500 });
  }
}
