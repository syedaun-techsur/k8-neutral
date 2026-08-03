import { NextRequest, NextResponse } from 'next/server';
import { query, ready } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await ready;
  const q = request.nextUrl.searchParams.get('q');

  let result;
  if (q && q.trim() !== '') {
    result = await query(
      `SELECT id, title, body, pinned, created_at
         FROM notes
        WHERE title ILIKE $1
        ORDER BY pinned DESC, created_at DESC`,
      [`%${q}%`]
    );
  } else {
    result = await query(
      `SELECT id, title, body, pinned, created_at
         FROM notes
        ORDER BY pinned DESC, created_at DESC`
    );
  }

  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  await ready;
  const body = await request.json();
  const { title, body: noteBody = null, pinned = false } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO notes (title, body, pinned)
     VALUES ($1, $2, $3)
     RETURNING id, title, body, pinned, created_at`,
    [title.trim(), noteBody ?? null, Boolean(pinned)]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
