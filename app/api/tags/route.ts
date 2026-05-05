import { NextResponse } from 'next/server';
import { getAllTags, createTag } from '@/lib/services/tag.service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('searchQuery') || undefined;
    const filter = url.searchParams.get('filter') || undefined;
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '20');
    const res = await getAllTags({ searchQuery, filter, page, pageSize });
    return NextResponse.json(res, { status: 200 });
  } catch (err) {
    console.error('GET /api/tags error', err);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tag = await createTag(body);
    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    console.error('POST /api/tags error', err);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
