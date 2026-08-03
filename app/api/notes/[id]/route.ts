import { NextRequest, NextResponse } from 'next/server';
import { query, ready } from '@/lib/db';

type RouteContext = { params: { id: string } };

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  await ready;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const result = await query(
    `SELECT id, title, body, pinned, created_at FROM notes WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  await ready;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const body = await request.json();
  const { title, body: noteBody, pinned } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const result = await query(
    `UPDATE notes
        SET title = $1, body = $2, pinned = $3
      WHERE id = $4
      RETURNING id, title, body, pinned, created_at`,
    [title.trim(), noteBody ?? null, Boolean(pinned), id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  await ready;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  }

  const result = await query(
    `DELETE FROM notes WHERE id = $1 RETURNING id`,
    [id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  // 204 No Content — must have no body per HTTP spec
  return new Response(null, { status: 204 });
}
