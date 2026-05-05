import { NextResponse } from 'next/server';
import { globalSearch } from '@/lib/services/general.service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || undefined;
    const res = await globalSearch({ query, type });
    return NextResponse.json({ results: JSON.parse(res) }, { status: 200 });
  } catch (err) {
    console.error('GET /api/search error', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
