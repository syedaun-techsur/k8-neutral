# Phase 2: REST API - Research

**Researched:** 2026-08-03
**Domain:** Next.js 14 App Router Route Handlers + PostgreSQL (pg@8)
**Confidence:** HIGH

---

## Summary

Next.js 14 App Router route handlers live in `app/**/route.ts` files and export named async functions per HTTP method (`GET`, `POST`, `PUT`, `DELETE`, etc.). They use the Web `Request`/`Response` APIs natively, with `NextRequest`/`NextResponse` as enhanced wrappers. All 6 required endpoints map cleanly to this pattern.

**Critical version note:** The project pins `next@14.2.29`. In Next.js 14, dynamic route `params` is a **plain synchronous object** (`{ params: { id: string } }`). In Next.js 15+, `params` became a Promise requiring `await`. Do NOT use the `await params` pattern — it only applies to Next.js 15+.

**Primary recommendation:** Use `NextResponse.json(data, { status })` for all responses; use `new Response(null, { status: 204 })` for the no-body DELETE 204; use `NextRequest` as the parameter type; access `params.id` synchronously.

---

## Q&A: All 7 Research Questions

### Q1: Next.js 14 App Router route handler file structure and export pattern

**File structure:**
```
app/
├── api/
│   ├── health/
│   │   └── route.ts          → GET /api/health
│   └── notes/
│       ├── route.ts          → GET /api/notes, POST /api/notes
│       └── [id]/
│           └── route.ts      → GET /api/notes/[id], PUT /api/notes/[id], DELETE /api/notes/[id]
```

**Export pattern (Next.js 14):**
```typescript
// Source: https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers
import { NextRequest, NextResponse } from 'next/server';

// Collection route: app/api/notes/route.ts
export async function GET(request: NextRequest) { ... }
export async function POST(request: NextRequest) { ... }

// Item route: app/api/notes/[id]/route.ts
// In Next.js 14, params is a plain object (NOT a Promise)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;   // synchronous — no await needed
  ...
}
```

**Key constraint:** A `route.ts` and a `page.tsx` cannot coexist at the same path segment. Since all API routes live under `app/api/`, there is no conflict with `app/page.tsx`.

### Q2: `await ready` pattern — should API routes await it?

**Yes, always `await ready` before running any query.**

The `ready` export from `lib/db.ts` is a Promise that resolves when the `CREATE TABLE IF NOT EXISTS` migration completes. Awaiting it in every route handler guarantees the table exists before the first query runs.

**Why it's safe and cheap:**
- A Promise in Node.js can be awaited multiple times — each subsequent `await` resolves instantly (the event loop tick cost is negligible, roughly 0ms after the first resolution).
- If the migration fails on startup, `ready` rejects; `await ready` will then throw in the handler, producing a 500 error rather than a cryptic "table not found" DB error.
- The pool is initialized at module load time — `ready` only guards the migration, not the connection itself.

**Recommended pattern:**
```typescript
import { ready, query } from '@/lib/db';

export async function GET(request: NextRequest) {
  await ready;   // no-op after first resolution; throws if migration failed
  const result = await query('SELECT ...', [...]);
  return NextResponse.json(result.rows);
}
```

**Caveat:** Do NOT `await ready` in the `/api/health` endpoint, because that endpoint must return `200 {"status":"ok"}` even when the database is unavailable. It's a liveness probe, not a readiness probe.

### Q3: Case-insensitive title search in PostgreSQL

**Use `ILIKE` with a parameterized query.** It is simpler, index-friendly (with a `pg_trgm` index if needed), and idiomatic PostgreSQL.

```sql
-- ILIKE approach (recommended for this app)
SELECT * FROM notes
WHERE title ILIKE $1
ORDER BY pinned DESC, created_at DESC;
-- Pass '%' || q || '%' as the parameter value
```

**vs `lower()` approach:**
```sql
WHERE lower(title) LIKE lower($1)
```

Both are functionally equivalent for ASCII text. `ILIKE` is the PostgreSQL-native idiom and slightly cleaner. For a single-user notes app there is no performance difference. Use `ILIKE`.

**Parameter value construction in TypeScript:**
```typescript
const q = request.nextUrl.searchParams.get('q');
if (q) {
  result = await query(
    'SELECT * FROM notes WHERE title ILIKE $1 ORDER BY pinned DESC, created_at DESC',
    [`%${q}%`]
  );
} else {
  result = await query(
    'SELECT * FROM notes ORDER BY pinned DESC, created_at DESC'
  );
}
```

### Q4: Sorting — pinned first, then newest first

```sql
ORDER BY pinned DESC, created_at DESC
```

- `pinned DESC`: `true` (1) sorts before `false` (0) in descending order → pinned notes appear first.
- `created_at DESC`: newest first within each group.

This is a standard compound ORDER BY — no special PostgreSQL features needed.

### Q5: `NextResponse` patterns for 201, 204, 404, 400

```typescript
// Source: https://nextjs.org/docs/14/app/api-reference/functions/next-response

import { NextResponse } from 'next/server';

// 200 OK with JSON (default)
return NextResponse.json({ id: 1, title: 'Hello' });

// 201 Created with JSON body
return NextResponse.json(createdNote, { status: 201 });

// 204 No Content — no body allowed; use native Response
return new Response(null, { status: 204 });

// 400 Bad Request with error message
return NextResponse.json({ error: 'title is required' }, { status: 400 });

// 404 Not Found
return NextResponse.json({ error: 'Note not found' }, { status: 404 });

// 500 Internal Server Error
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
```

**Important for 204:** `NextResponse.json(null, { status: 204 })` would send a body with `null`. HTTP 204 must have no body. Use `new Response(null, { status: 204 })` instead.

### Q6: Reading JSON body from `req.json()` in POST/PUT

```typescript
// Source: https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers#request-body

export async function POST(request: NextRequest) {
  const body = await request.json();   // built-in Web API — no bodyParser needed
  const { title, body: noteBody, pinned } = body;
  ...
}
```

**Notes:**
- `request.json()` is the standard Web API method available directly on `NextRequest`.
- No need for `bodyParser`, `express.json()`, or any middleware — Next.js App Router handles it natively.
- If the request body is not valid JSON, `request.json()` throws. Wrap in try/catch and return 400.

**Recommended pattern with validation:**
```typescript
export async function POST(request: NextRequest) {
  let body: { title?: unknown; body?: unknown; pinned?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  ...
}
```

### Q7: Non-numeric `params.id` — return 400 or 404?

**Return 400 Bad Request.**

Rationale: A non-numeric `id` is a malformed request (the client sent something that can never be a valid ID), not a "resource not found" scenario. HTTP semantics:
- `404` = "the resource at this URL does not exist"
- `400` = "the request itself is malformed"

**Recommended validation pattern:**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await ready;
  
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid note id' }, { status: 400 });
  }
  
  const result = await query('SELECT * FROM notes WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }
  
  return NextResponse.json(result.rows[0]);
}
```

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 14.2.29 | App Router route handlers | Already installed; project constraint |
| `pg` | 8.22.0 | PostgreSQL client | Already installed via Phase 1 |

### No additional packages needed
All required functionality (route handling, JSON parsing, response helpers) is built into Next.js 14. No new npm installs are required for Phase 2.

---

## Architecture Patterns

### Recommended File Structure
```
app/
├── api/
│   ├── health/
│   │   └── route.ts          ← GET /api/health (no DB)
│   └── notes/
│       ├── route.ts          ← GET /api/notes, POST /api/notes
│       └── [id]/
│           └── route.ts      ← GET, PUT, DELETE /api/notes/[id]
lib/
└── db.ts                     ← already exists (Phase 1)
```

### Pattern: Shared `await ready` + error wrapper

Each DB-touching handler should follow this structure:

```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { ready, query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await ready;
    // ... query logic ...
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API] GET /api/notes error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Pattern: Dynamic Route (Next.js 14 — synchronous params)

```typescript
// app/api/notes/[id]/route.ts
// Source: https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }   // plain object in Next.js 14
) {
  await ready;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid note id' }, { status: 400 });
  }
  const result = await query('SELECT * FROM notes WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  }
  return NextResponse.json(result.rows[0]);
}
```

### Anti-Patterns to Avoid

- **`await params` (Next.js 15 pattern):** This project is on Next.js 14. `params` is a plain object — `await params.id` will silently coerce the string to a resolved promise value but is misleading and wrong. Use `params.id` directly.
- **Skipping `await ready` in DB handlers:** The migration runs asynchronously at module init. Under high concurrency at cold start, the first request could arrive before the migration completes. Always `await ready`.
- **`NextResponse.json(null, { status: 204 })`:** This sends a body (`null`). Use `new Response(null, { status: 204 })` for true 204 No Content.
- **`export const dynamic = 'force-static'` on DB routes:** DB routes must be dynamic. The default is fine (`'auto'`); don't add static annotations.
- **Throwing instead of returning error responses:** In route handlers, uncaught errors produce 500s with no JSON body. Always catch and return structured `NextResponse.json({ error: ... }, { status })`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON body parsing | Custom body reader | `await request.json()` | Built into Web API / NextRequest |
| Query param reading | URL string splitting | `request.nextUrl.searchParams.get('q')` | Built into NextRequest |
| HTTP status responses | Custom response builder | `NextResponse.json(data, { status })` | Built into Next.js |
| Case-insensitive search | JS-side `.toLowerCase()` filtering | PostgreSQL `ILIKE` | Runs in DB, handles NULLs, scales |
| ID coercion | Complex regex validation | `parseInt(id, 10)` + `isNaN()` check | Sufficient for SERIAL integer IDs |

---

## Common Pitfalls

### Pitfall 1: Using Next.js 15 `await params` pattern on Next.js 14

**What goes wrong:** Code like `const { id } = await params` compiles fine in TS but is semantically wrong in Next.js 14 where params is a plain object. In some edge cases it may break or produce confusing TypeScript errors.
**Why it happens:** Official Next.js docs now show version 15+ by default (URL: `nextjs.org/docs/app/...` without the `/14/` prefix). The docs for v14 are at `nextjs.org/docs/14/...`.
**How to avoid:** Always use `{ params }: { params: { id: string } }` with synchronous `params.id` for Next.js 14.
**Warning signs:** TypeScript error "Property 'then' does not exist on type '{ id: string }'" when trying to await.

### Pitfall 2: GET route handler caching with `?q=` query parameter

**What goes wrong:** In Next.js 14, `GET` route handlers that do NOT use the `request` parameter object may be statically cached. If `GET /api/notes` is cached and doesn't re-run per request, the `?q=` filter always returns the same result.
**Why it happens:** Next.js 14 defaults `GET` handlers using only `Response` (not `Request`) to static caching.
**How to avoid:** Use `request: NextRequest` as the first parameter (even if you only sometimes use `request.nextUrl`). Accessing the request object opts the handler into dynamic mode. Alternatively, add `export const dynamic = 'force-dynamic'`.
**Confirmed by:** https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers#opting-out-of-caching

### Pitfall 3: `204 No Content` with a JSON body

**What goes wrong:** `NextResponse.json(null, { status: 204 })` sends a response with `Content-Type: application/json` and body `null`. Some clients reject this as invalid per HTTP spec (204 MUST NOT include a body).
**How to avoid:** `new Response(null, { status: 204 })`.

### Pitfall 4: Not catching `request.json()` parse errors

**What goes wrong:** If a client sends a POST/PUT with no `Content-Type: application/json` or malformed JSON, `request.json()` throws an unhandled error, resulting in a 500 instead of a clean 400.
**How to avoid:** Wrap `await request.json()` in try/catch; return 400 on failure.

### Pitfall 5: SQL injection via string interpolation

**What goes wrong:** Constructing queries with template literals like `` `SELECT ... WHERE title LIKE '%${q}%'` `` allows SQL injection.
**How to avoid:** Always use parameterized queries: `query('... WHERE title ILIKE $1', [\`%${q}%\`])`.

---

## Code Examples

### Full handler: `GET /api/health`
```typescript
// app/api/health/route.ts
// Source: https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers
export async function GET() {
  return Response.json({ status: 'ok' });
}
```
No DB dependency. No `await ready`. Returns 200 always.

### Full handler: `GET /api/notes` with optional `?q=` filter
```typescript
// app/api/notes/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { ready, query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await ready;
    const q = request.nextUrl.searchParams.get('q');
    const result = q
      ? await query(
          'SELECT * FROM notes WHERE title ILIKE $1 ORDER BY pinned DESC, created_at DESC',
          [`%${q}%`]
        )
      : await query('SELECT * FROM notes ORDER BY pinned DESC, created_at DESC');
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('[API] GET /api/notes error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Full handler: `POST /api/notes`
```typescript
export async function POST(request: NextRequest) {
  let body: { title?: unknown; body?: unknown; pinned?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  try {
    await ready;
    const result = await query(
      'INSERT INTO notes (title, body, pinned) VALUES ($1, $2, $3) RETURNING *',
      [body.title.trim(), body.body ?? null, body.pinned ?? false]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('[API] POST /api/notes error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Full handler: `GET /api/notes/[id]`
```typescript
// app/api/notes/[id]/route.ts
// Source: https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers#dynamic-route-segments
import { type NextRequest, NextResponse } from 'next/server';
import { ready, query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }   // Next.js 14: plain object, NOT Promise
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid note id' }, { status: 400 });
  }
  try {
    await ready;
    const result = await query('SELECT * FROM notes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(`[API] GET /api/notes/${id} error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Full handler: `PUT /api/notes/[id]`
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid note id' }, { status: 400 });
  }
  let body: { title?: unknown; body?: unknown; pinned?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  try {
    await ready;
    const result = await query(
      'UPDATE notes SET title=$1, body=$2, pinned=$3 WHERE id=$4 RETURNING *',
      [body.title.trim(), body.body ?? null, body.pinned ?? false, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error(`[API] PUT /api/notes/${id} error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Full handler: `DELETE /api/notes/[id]`
```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid note id' }, { status: 400 });
  }
  try {
    await ready;
    const result = await query(
      'DELETE FROM notes WHERE id=$1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return new Response(null, { status: 204 });  // No body — use native Response
  } catch (err) {
    console.error(`[API] DELETE /api/notes/${id} error:`, err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## State of the Art

| Old Approach | Current Approach (Next 14) | Note |
|--------------|---------------------------|------|
| Pages Router `pages/api/` with `req`/`res` | App Router `app/api/**/route.ts` with Web APIs | Next.js 13+ |
| `res.status(201).json(data)` | `NextResponse.json(data, { status: 201 })` | Web API style |
| `req.body` (auto-parsed by bodyParser) | `await request.json()` | Explicit, Web-native |
| `params.id` is sync | `await params` (Next.js 15+) | **NOT applicable here — project is on 14** |

**Deprecated/outdated:**
- `pages/api/` route files: Not wrong, but unused in App Router projects
- `next-connect` middleware: Not needed for simple route handlers
- `bodyParser: false` config: Only relevant in Pages Router API routes

---

## Open Questions

1. **Error shape consistency**
   - What we know: Each handler returns `{ error: string }` for errors
   - What's unclear: Should there be a shared error helper to enforce consistency?
   - Recommendation: A tiny inline helper `err(msg, status)` in each file is sufficient for 6 endpoints; no separate file needed unless the planner wants one.

2. **Type for `lib/db.ts` query result rows**
   - What we know: `query()` returns `pg.QueryResult<any>`
   - What's unclear: Should a shared `Note` type be defined?
   - Recommendation: Define `interface Note { id: number; title: string; body: string | null; pinned: boolean; created_at: string }` in a shared file (e.g., `lib/types.ts`) so all route handlers use the same shape.

---

## Sources

### Primary (HIGH confidence)
- **https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers** — Route handler file structure, HTTP method exports, dynamic segments (params as plain object in v14), body parsing, query params, caching behavior
- **https://nextjs.org/docs/14/app/api-reference/functions/next-response** — `NextResponse.json()` with status, 204 pattern
- **https://nextjs.org/docs/14/app/api-reference/functions/next-request** — `NextRequest` type, `request.nextUrl.searchParams`
- **npm registry `next@14.2.29`** — Version confirmed published 2025-05-20

### Secondary (MEDIUM confidence)
- **Node.js Promise semantics** — Awaiting an already-resolved Promise is safe and instant (verified locally)
- **PostgreSQL ILIKE documentation** — Standard PostgreSQL case-insensitive LIKE operator

---

## Metadata

**Confidence breakdown:**
- Route handler patterns (Q1): HIGH — official Next.js 14 docs
- `await ready` pattern (Q2): HIGH — Node.js promise semantics + lib/db.ts code review
- ILIKE vs lower() (Q3): HIGH — standard PostgreSQL
- ORDER BY sorting (Q4): HIGH — standard SQL
- Status code patterns (Q5): HIGH — official NextResponse docs
- JSON body parsing (Q6): HIGH — official Next.js 14 docs
- ID validation 400 vs 404 (Q7): HIGH — HTTP spec semantics

**Research date:** 2026-08-03
**Valid until:** 2026-09-03 (stable; Next.js 14 is pinned in package.json)

**Critical version warning:** When reading Next.js docs, always use the `/docs/14/` URL prefix. The default docs URL (`/docs/app/...`) serves Next.js 15+ content where `params` is a Promise — wrong for this project.
