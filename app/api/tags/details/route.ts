import { NextResponse } from 'next/server';
import { getQuestionsByTagId } from '@/lib/services/tag.service';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tagId = url.searchParams.get('tagId');
    if (!tagId) return NextResponse.json({ error: 'Missing tagId' }, { status: 400 });

    const searchQuery = url.searchParams.get('searchQuery') || undefined;
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');

    const res = await getQuestionsByTagId({ tagId, searchQuery, page, pageSize });
    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    console.error('GET /api/tags/details error', err);
    return NextResponse.json({ error: 'Failed to fetch tag details' }, { status: 500 });
  }
}
