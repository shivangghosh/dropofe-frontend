import { NextResponse } from 'next/server';
import { viewQuestion } from '@/lib/services/interaction.service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await viewQuestion(body);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('POST /api/interactions error', err);
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 });
  }
}
