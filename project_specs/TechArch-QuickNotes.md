# Technical Architecture: QuickNotes

**Version:** 1.0  
**Date:** 2026-06-17  
**Status:** Active  
**Project Acronym:** QuickNotes  
**Source Documents:** PRD-QuickNotes.md, FRD-QuickNotes.md

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Component Architecture](#2-component-architecture)
3. [Data Model](#3-data-model)
4. [API Design](#4-api-design)
5. [Security Architecture](#5-security-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Integration Points](#7-integration-points)

---

## 1. Architectural Overview

### Pattern

QuickNotes uses a **monolithic Server-Side Rendered (SSR) architecture** with collocated API routes, implemented as a single Next.js 14 App Router application. There is no separate backend service, no microservices, and no client-side data fetching layer beyond direct `fetch()` calls in form handlers. Server Components perform database queries directly during SSR; Client Components handle interactive UI state (search filtering, form submission).

**Key architectural decisions:**

| Decision | Rationale |
|----------|-----------|
| Next.js 14 App Router (monolith) | Specified hard requirement; collocates pages and API routes in one process |
| Server Components for list/edit pages | Data is fetched at render time — no client hydration gap, no loading spinners |
| Client Components for forms and search | Requires browser event handlers (`onChange`, `onSubmit`, `confirm()`) |
| Direct `pg` pool in Route Handlers | No ORM overhead; single table with simple CRUD does not justify Prisma/Drizzle |
| `CREATE TABLE IF NOT EXISTS` on module init | Zero manual migration; idempotent and safe across restarts |
| `next.config.mjs` (ES Module) | Next.js 14 hard-errors on `.ts` config — non-negotiable constraint |
| No frame-blocking headers | App must render in `<iframe>` preview panels |

---

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser / iframe Host                        │
│   375px–428px mobile viewport  │  any desktop viewport         │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP  (port 3000)
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│               Next.js 14 App Router Process                     │
│               Node.js  ·  0.0.0.0:3000                         │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │     Page Routes (SSR)    │  │   API Route Handlers     │    │
│  │                          │  │                          │    │
│  │  app/                    │  │  app/api/                │    │
│  │  ├─ page.tsx             │  │  ├─ health/route.ts      │    │
│  │  │  (Note List)          │  │  └─ notes/               │    │
│  │  ├─ notes/               │  │     ├─ route.ts          │    │
│  │  │  ├─ new/              │  │     │  (GET, POST)        │    │
│  │  │  │  └─ page.tsx       │  │     └─ [id]/             │    │
│  │  │  └─ [id]/             │  │        └─ route.ts       │    │
│  │  │     └─ edit/          │  │           (GET,PUT,DEL)  │    │
│  │  │        └─ page.tsx    │  │                          │    │
│  │  └─ layout.tsx           │  └──────────┬───────────────┘    │
│  └──────────────────────────┘             │                    │
│                    │                      │                    │
│                    └──────────┬───────────┘                    │
│                               │                                │
│  ┌────────────────────────────▼───────────────────────────┐    │
│  │              lib/db.ts  —  pg Pool (singleton)         │    │
│  │              Auto-migration on module load             │    │
│  └────────────────────────────┬───────────────────────────┘    │
│                               │                                │
└───────────────────────────────┼─────────────────────────────────┘
                                │ TCP  (DATABASE_URL)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                         │
│                     Table: notes                               │
└─────────────────────────────────────────────────────────────────┘
```

---

### Deployment Topology

```
┌────────────────────────────────────────────────────┐
│  Container / VM                                    │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  Next.js process  (npm start)                │  │
│  │  next start -H 0.0.0.0 -p 3000              │  │
│  └──────────────────────────────────────────────┘  │
│                        │                           │
│  ┌─────────────────────▼────────────────────────┐  │
│  │  Environment Variables                       │  │
│  │  DATABASE_URL=postgresql://user:pw@host/db   │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
              │ port 3000 exposed
              ▼
   Reverse proxy / iframe host (optional)
```

**Port/host binding** is mandatory: `0.0.0.0:3000`. The `package.json` scripts enforce this:
```json
{
  "scripts": {
    "dev":   "next dev -H 0.0.0.0 -p 3000",
    "build": "next build",
    "start": "next start -H 0.0.0.0 -p 3000"
  }
}
```

---

## 2. Component Architecture

### File Structure

```
project-root/
├── next.config.mjs          ← MUST be .mjs — Next 14 hard-errors on .ts
├── package.json
├── .env                     ← DATABASE_URL (git-ignored)
│
├── app/
│   ├── layout.tsx           ← Root layout: HTML shell, global CSS import
│   ├── globals.css          ← Global CSS variables, resets, base styles
│   ├── page.tsx             ← / — Note list (Server Component)
│   │
│   ├── notes/
│   │   ├── new/
│   │   │   └── page.tsx     ← /notes/new — Create form (Client Component)
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx ← /notes/[id]/edit — Edit/delete form (Client Component)
│   │
│   └── api/
│       ├── health/
│       │   └── route.ts     ← GET /api/health
│       └── notes/
│           ├── route.ts     ← GET /api/notes, POST /api/notes
│           └── [id]/
│               └── route.ts ← GET/PUT/DELETE /api/notes/[id]
│
├── components/
│   ├── NoteList.tsx         ← Client Component: renders note list + search filter
│   ├── NoteForm.tsx         ← Client Component: shared create/edit form logic
│   └── SearchInput.tsx      ← Client Component: search input with filter state
│
└── lib/
    └── db.ts                ← pg Pool singleton + auto-migration init
```

---

### Component Responsibilities

#### `lib/db.ts` — Database Module

The single authoritative database module. Exports a `pg.Pool` singleton initialized at module load time. Auto-migration runs once when the module is first imported.

**Responsibilities:**
- Read `DATABASE_URL` from `process.env` — fail fast with a clear error if absent
- Create a `pg.Pool` with max 10 connections, 30s idle timeout, 10s connection timeout
- Execute `CREATE TABLE IF NOT EXISTS notes (...)` immediately on module initialization
- Export a `query(text, params)` helper that wraps `pool.query()` for use by Route Handlers and SSR pages
- Log startup migration errors to stderr; re-throw to prevent silent failures

**Initialization pattern:**
```typescript
// lib/db.ts — executes at module load (before first request)
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

// Auto-migration — runs once, idempotent
const migrate = pool.query(`
  CREATE TABLE IF NOT EXISTS notes (
    id         SERIAL PRIMARY KEY,
    title      TEXT        NOT NULL,
    body       TEXT,
    pinned     BOOLEAN     NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`).catch((err) => {
  console.error('[QuickNotes] Database migration failed:', err.message);
  throw err;
});

export const ready = migrate; // await in route handlers if needed

export function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}
```

---

#### `app/page.tsx` — Note List Page (Server Component)

Fetches all notes directly from PostgreSQL at render time (no API call). Passes note data to `NoteList` (Client Component) for search filtering.

**Responsibilities:**
- `SELECT id, title, pinned, created_at FROM notes ORDER BY pinned DESC, created_at DESC`
- Render `NoteList` with fetched notes as props
- Render empty state ("No notes yet" + "New note" button) when no notes exist
- Render generic error state if DB query fails
- Always render "New note" link to `/notes/new`

---

#### `app/notes/new/page.tsx` — Create Note Page (Client Component)

Renders the create note form. Handles client-side validation, `POST /api/notes`, and redirect on success.

**Responsibilities:**
- Render: title input (required), body textarea, pinned checkbox, Save button, Cancel link
- Client-side: validate title non-empty before submitting; show "Title is required" inline
- On valid submit: `POST /api/notes` with `{ title, body, pinned }`
- On 201: `router.push('/')` (client-side navigation)
- On 400/500: display error message inline; preserve form values

---

#### `app/notes/[id]/edit/page.tsx` — Edit/Delete Note Page

Fetches the note by ID server-side, then renders a pre-filled Client Component form.

**Responsibilities:**
- Server side: `SELECT id, title, body, pinned FROM notes WHERE id = $1`
- If not found: render 404 state with link to `/`
- Client side: pre-fill title, body, pinned from fetched note
- Save: validate title, `PUT /api/notes/[id]`, redirect to `/` on 200
- Delete: `confirm("Delete this note? This cannot be undone.")` → `DELETE /api/notes/[id]` → redirect to `/`
- 404 on PUT/DELETE: treat as success (note gone) and redirect to `/`

---

#### `components/NoteList.tsx` — Note List + Search (Client Component)

Receives the full note list from the Server Component page and applies client-side search filtering.

**Responsibilities:**
- Accept `notes: Note[]` prop from parent Server Component
- Render `SearchInput` at top of list
- On search input change: filter `notes` by case-insensitive title substring match
- Render filtered notes as tappable list rows linking to `/notes/[id]/edit`
- Show pinned indicator (visual distinction) for notes with `pinned === true`
- Render "No matching notes" when filter yields no results

---

#### `next.config.mjs` — Next.js Configuration

**Critical constraint:** Must be `.mjs` — never `.ts` or `.js` (prefer `.mjs` for explicit ES Module semantics).

**Responsibilities:**
- Explicitly **omit** `X-Frame-Options` header from all responses
- Ensure no `Content-Security-Policy` with restrictive `frame-ancestors` directive is set
- Next.js 14 may inject `X-Frame-Options: SAMEORIGIN` by default; the headers config must override this to remove it

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Explicitly remove X-Frame-Options to allow iframe embedding
          // Setting an empty value or omitting it entirely prevents the header
          // Note: do NOT set Content-Security-Policy with frame-ancestors restrictions
        ],
      },
    ];
  },
};

export default nextConfig;
```

> **Implementation note:** In Next.js 14, the safest way to suppress `X-Frame-Options` is to not configure it in `headers()` at all and verify with `curl -I` that the header is absent. If Next.js injects it by default, set `headers: [{ key: 'X-Frame-Options', value: '' }]` to neutralize it (or use a custom server). Test with `curl -I http://localhost:3000/` and confirm absence.

---

## 3. Data Model

### Entity Overview

QuickNotes has **one entity**: `Note`. There are no foreign keys, no joins, and no relational complexity.

```
┌─────────────────────────────────────────────────┐
│                     notes                       │
├──────────────┬────────────────┬─────────────────┤
│  id          │  SERIAL        │  PK             │
│  title       │  TEXT NOT NULL │                 │
│  body        │  TEXT          │  nullable       │
│  pinned      │  BOOLEAN       │  DEFAULT false  │
│  created_at  │  TIMESTAMPTZ   │  DEFAULT now()  │
└──────────────┴────────────────┴─────────────────┘
```

---

### DDL — Canonical Auto-Migration SQL

```sql
CREATE TABLE IF NOT EXISTS notes (
  id         SERIAL       PRIMARY KEY,
  title      TEXT         NOT NULL,
  body       TEXT,
  pinned     BOOLEAN      NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

This statement is executed in `lib/db.ts` at module initialization. It is:
- **Idempotent:** Safe to run on every server restart (`IF NOT EXISTS`)
- **Non-destructive:** Never drops or alters existing data
- **Self-contained:** No external migration tool (Flyway, Liquibase, Prisma Migrate) required

---

### Column Definitions

| Column | PostgreSQL Type | Nullable | Default | Description |
|--------|----------------|----------|---------|-------------|
| `id` | `SERIAL` | NO | Auto-increment sequence | Integer primary key. Exposed in API as `"id"`. The `SERIAL` type creates an implicit sequence `notes_id_seq`. |
| `title` | `TEXT` | NO | — (required) | Note title. Non-empty enforced at the application layer (not DB constraint). PostgreSQL `TEXT` is unbounded. |
| `body` | `TEXT` | YES | `NULL` | Note body/content. Optional. Stored as `NULL` when not provided by the user. |
| `pinned` | `BOOLEAN` | NO | `false` | Pin flag. `true` promotes the note to the top of all sorted lists. `NOT NULL` with default ensures it is always set. |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Creation timestamp with timezone offset. Set by PostgreSQL on `INSERT`; never modified by `UPDATE`. |

---

### Indexes

No additional indexes for MVP. A personal single-user app with a small row count does not require explicit indexes beyond the implicit B-tree index on the primary key (`id`).

**Future index (deferred, not MVP):**
```sql
-- Add if list query performance degrades with large row counts
CREATE INDEX idx_notes_created_at ON notes (created_at DESC);
CREATE INDEX idx_notes_pinned_created ON notes (pinned DESC, created_at DESC);
```

---

### Standard SQL Query Patterns

```sql
-- List all notes (home page SSR + GET /api/notes without ?q)
SELECT id, title, pinned, created_at
FROM notes
ORDER BY pinned DESC, created_at DESC;

-- List with server-side title filter (GET /api/notes?q=<term>)
SELECT id, title, body, pinned, created_at
FROM notes
WHERE title ILIKE $1
ORDER BY pinned DESC, created_at DESC;
-- $1 = '%' || search_term || '%'

-- Fetch one note (edit page SSR + GET /api/notes/[id])
SELECT id, title, body, pinned, created_at
FROM notes
WHERE id = $1;

-- Create note (POST /api/notes)
INSERT INTO notes (title, body, pinned)
VALUES ($1, $2, $3)
RETURNING id, title, body, pinned, created_at;

-- Update note (PUT /api/notes/[id])
UPDATE notes
SET title = $1,
    body  = $2,
    pinned = $3
WHERE id = $4
RETURNING id, title, body, pinned, created_at;

-- Delete note (DELETE /api/notes/[id])
-- Check rowCount: 0 = not found (→ 404), 1 = deleted (→ 204)
DELETE FROM notes
WHERE id = $1;
```

---

### JSON Serialization Mapping

API responses use `camelCase`; PostgreSQL columns use `snake_case`. The mapping is applied in Route Handlers when constructing the response:

| DB Column | API JSON Key | TypeScript Type | Example Value |
|-----------|-------------|-----------------|---------------|
| `id` | `id` | `number` | `42` |
| `title` | `title` | `string` | `"Shopping list"` |
| `body` | `body` | `string \| null` | `"Milk, eggs"` or `null` |
| `pinned` | `pinned` | `boolean` | `false` |
| `created_at` | `createdAt` | `string` (ISO 8601) | `"2026-06-17T12:00:00.000Z"` |

---

## 4. API Design

### TypeScript Interfaces

```typescript
// ─── Shared Domain Types ─────────────────────────────────────────────────────

/** A note as returned by the API (camelCase, createdAt as ISO string) */
interface Note {
  id: number;
  title: string;
  body: string | null;
  pinned: boolean;
  createdAt: string; // ISO 8601 timestamp
}

/** Shape of the notes row as returned by pg (snake_case) */
interface NoteRow {
  id: number;
  title: string;
  body: string | null;
  pinned: boolean;
  created_at: Date;
}

/** Serialization helper: NoteRow → Note */
function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    pinned: row.pinned,
    createdAt: row.created_at.toISOString(),
  };
}

// ─── Request Bodies ───────────────────────────────────────────────────────────

/** POST /api/notes request body */
interface CreateNoteBody {
  title: string;         // required, non-empty after trim
  body?: string | null;  // optional
  pinned?: boolean;      // optional, defaults to false
}

/** PUT /api/notes/[id] request body */
interface UpdateNoteBody {
  title: string;         // required, non-empty after trim
  body?: string | null;  // optional, null → stored as NULL
  pinned?: boolean;      // optional, retains existing value if absent
}

// ─── Response Types ───────────────────────────────────────────────────────────

/** GET /api/health response */
interface HealthResponse {
  status: 'ok';
}

/** GET /api/notes response — array of notes */
type NotesListResponse = Note[];

/** POST /api/notes response — created note */
type CreateNoteResponse = Note;

/** GET /api/notes/[id] response — single note */
type GetNoteResponse = Note;

/** PUT /api/notes/[id] response — updated note */
type UpdateNoteResponse = Note;

/** DELETE /api/notes/[id] response — 204, no body */

/** Error response shape for all 4xx and 5xx responses */
interface ErrorResponse {
  error: string;
}
```

---

### Endpoint Catalog

#### Base URL
`http://0.0.0.0:3000` (or the deployed hostname)

**Global response headers (all routes):**
- `Content-Type: application/json` (except 204 responses)
- No `X-Frame-Options` header
- No restrictive `Content-Security-Policy: frame-ancestors`

---

#### GET /api/health

| Property | Value |
|----------|-------|
| File | `app/api/health/route.ts` |
| Auth | None |
| DB required | No |
| Cache | No-store |

**Request:** No body, no parameters required.

**Response — 200 OK:**
```json
{ "status": "ok" }
```

**Error responses:** None. If the process is alive, this endpoint always returns 200.

---

#### GET /api/notes

| Property | Value |
|----------|-------|
| File | `app/api/notes/route.ts` |
| Auth | None |
| DB required | Yes |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Case-insensitive substring filter on `title`. Omit or leave empty to return all notes. |

**Response — 200 OK:**
```json
[
  {
    "id": 2,
    "title": "Pinned note",
    "body": null,
    "pinned": true,
    "createdAt": "2026-06-17T10:00:00.000Z"
  },
  {
    "id": 3,
    "title": "Recent note",
    "body": "Some content",
    "pinned": false,
    "createdAt": "2026-06-17T09:00:00.000Z"
  }
]
```
Returns `[]` if no notes exist or no notes match the filter.

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 500 | `{"error":"Database error"}` | PostgreSQL query failure |

---

#### POST /api/notes

| Property | Value |
|----------|-------|
| File | `app/api/notes/route.ts` |
| Auth | None |
| DB required | Yes |

**Request body:**
```json
{
  "title":  "My new note",
  "body":   "Optional body text",
  "pinned": false
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Non-empty after `trim()`. Returns 400 if violated. |
| `body` | string \| null | No | Any string or null. Stored as NULL if absent. |
| `pinned` | boolean | No | Must be boolean. Defaults to `false` if omitted. |

**Response — 201 Created:**
```json
{
  "id": 4,
  "title": "My new note",
  "body": "Optional body text",
  "pinned": false,
  "createdAt": "2026-06-17T12:30:00.000Z"
}
```

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{"error":"Title is required"}` | `title` missing, null, or whitespace-only |
| 400 | `{"error":"Invalid request body"}` | Malformed JSON |
| 500 | `{"error":"Database error"}` | PostgreSQL insert failure |

---

#### GET /api/notes/[id]

| Property | Value |
|----------|-------|
| File | `app/api/notes/[id]/route.ts` |
| Auth | None |
| DB required | Yes |

**Path parameter:** `id` — positive integer string.

**Response — 200 OK:**
```json
{
  "id": 42,
  "title": "Shopping list",
  "body": "Milk, eggs, bread",
  "pinned": false,
  "createdAt": "2026-06-15T08:00:00.000Z"
}
```

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{"error":"Invalid id"}` | `id` is not a valid positive integer |
| 404 | `{"error":"Note not found"}` | No note with that `id` exists |
| 500 | `{"error":"Database error"}` | PostgreSQL query failure |

---

#### PUT /api/notes/[id]

| Property | Value |
|----------|-------|
| File | `app/api/notes/[id]/route.ts` |
| Auth | None |
| DB required | Yes |

**Path parameter:** `id` — positive integer string.

**Request body:**
```json
{
  "title":  "Updated title",
  "body":   "Updated body",
  "pinned": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | Yes | Non-empty after `trim()`. |
| `body` | string \| null | No | Updated body. Null or omitted → stored as NULL. |
| `pinned` | boolean | No | If omitted, the existing DB value is retained. |

**Response — 200 OK:**
```json
{
  "id": 42,
  "title": "Updated title",
  "body": "Updated body",
  "pinned": true,
  "createdAt": "2026-06-15T08:00:00.000Z"
}
```
`createdAt` is never modified by PUT.

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{"error":"Invalid id"}` | `id` is not a valid positive integer |
| 400 | `{"error":"Title is required"}` | `title` missing, null, or whitespace-only |
| 400 | `{"error":"Invalid request body"}` | Malformed JSON |
| 404 | `{"error":"Note not found"}` | No note with that `id` exists |
| 500 | `{"error":"Database error"}` | PostgreSQL update failure |

---

#### DELETE /api/notes/[id]

| Property | Value |
|----------|-------|
| File | `app/api/notes/[id]/route.ts` |
| Auth | None |
| DB required | Yes |

**Path parameter:** `id` — positive integer string.

**Request:** No body.

**Response — 204 No Content:** No response body.

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{"error":"Invalid id"}` | `id` is not a valid positive integer |
| 404 | `{"error":"Note not found"}` | No note with that `id` exists (zero rows deleted) |
| 500 | `{"error":"Database error"}` | PostgreSQL delete failure |

> **UI behavior:** The edit page (F03) treats a 404 response on DELETE as a successful deletion and redirects to `/`. The note is gone regardless.

---

### Method Not Allowed

Any HTTP method not exported from a Route Handler file returns:
```
HTTP/1.1 405 Method Not Allowed
Content-Type: application/json

{ "error": "Method not allowed" }
```
Next.js 14 App Router handles this automatically for undefined methods; Route Handlers need only export the methods they support.

---

### Route Handler Implementation Pattern

```typescript
// Example: app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { toNote, NoteRow } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get('q');
    let result;
    if (q && q.trim()) {
      result = await query(
        'SELECT id, title, body, pinned, created_at FROM notes WHERE title ILIKE $1 ORDER BY pinned DESC, created_at DESC',
        [`%${q.trim()}%`]
      );
    } else {
      result = await query(
        'SELECT id, title, body, pinned, created_at FROM notes ORDER BY pinned DESC, created_at DESC'
      );
    }
    return NextResponse.json(result.rows.map(toNote));
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const noteBody = body.body != null ? String(body.body) : null;
    const pinned = typeof body.pinned === 'boolean' ? body.pinned : false;
    const result = await query(
      'INSERT INTO notes (title, body, pinned) VALUES ($1, $2, $3) RETURNING id, title, body, pinned, created_at',
      [title, noteBody, pinned]
    );
    return NextResponse.json(toNote(result.rows[0] as NoteRow), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
```

---

## 5. Security Architecture

### Authentication & Authorization

QuickNotes MVP has **no authentication layer**. All routes (pages and API endpoints) are publicly accessible. This is a deliberate design decision documented in the PRD: the app is operated by a single trusted individual in a private environment.

**Implications:**
- No session management, no JWT, no OAuth
- No middleware guards on any route
- All API endpoints respond to unauthenticated requests
- Security relies entirely on network-level access control (operator's responsibility)

**Future migration path:** Adding authentication would require wrapping API routes in a middleware check and adding a session table. The current architecture does not preclude this — it merely defers it.

---

### Credential Security

| Rule | Implementation |
|------|----------------|
| No hard-coded DB credentials | `DATABASE_URL` read from `process.env` only; validated at startup |
| `.env` git-ignored | `.env` and `.env.local` listed in `.gitignore`; never committed |
| Credentials server-side only | `lib/db.ts` is a server module; `pg` pool never reaches the browser bundle |
| No credentials in build artifacts | Next.js server-only modules are not bundled for the client |
| Clear startup failure | If `DATABASE_URL` absent, app throws before serving any request |

```typescript
// lib/db.ts — startup validation
if (!process.env.DATABASE_URL) {
  throw new Error('[QuickNotes] DATABASE_URL environment variable is required');
}
```

---

### Header Security

The following headers are deliberately **omitted** to support iframe embedding:

| Header | Decision | Reason |
|--------|----------|--------|
| `X-Frame-Options` | **NOT emitted** | Would block iframe embedding — violates F7 requirement |
| `Content-Security-Policy: frame-ancestors` | **NOT set restrictively** | Same reason; if CSP is added in future, `frame-ancestors` must allow embedding |

**Headers that may be emitted by Next.js 14 defaults** and should be verified absent:
- `X-Frame-Options: SAMEORIGIN` — Next.js may inject this; verify with `curl -I http://localhost:3000/` after startup

**Recommended `next.config.mjs` headers section:**
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        // Remove X-Frame-Options if Next.js injects it
        // Do NOT add frame-ancestors to Content-Security-Policy
      ],
    },
  ];
},
```

---

### Input Validation

| Layer | Validation Applied |
|-------|-------------------|
| Client-side (forms) | Title non-empty check before API call; shows "Title is required" inline |
| API Route Handlers | Title non-empty after `trim()`; `[id]` is positive integer; JSON body parseable |
| Database | `NOT NULL` on `title`, `pinned`, `created_at`; type enforcement by PostgreSQL |

**SQL injection prevention:** All database queries use parameterized queries (`$1`, `$2`, ...) via `pg` — user input is never string-concatenated into SQL.

**XSS prevention:** React's JSX escapes all dynamic string values rendered in the DOM by default. No `dangerouslySetInnerHTML` is used.

---

### Error Information Disclosure

- **Stack traces** are never sent to the client — only generic messages like `"Database error"` or `"Internal server error"`
- **Server-side errors** are logged to `stdout`/`stderr` with full context for operator debugging
- **4xx errors** are not logged as errors (expected client mistakes)
- **PostgreSQL error details** (e.g., constraint violations) are caught and replaced with generic `500` responses

---

### Data Protection

| Concern | Approach |
|---------|----------|
| Data at rest | Delegated to PostgreSQL operator (disk encryption, access control) |
| Data in transit | Delegated to reverse proxy / deployment environment (TLS termination) |
| Connection security | `DATABASE_URL` may include `?sslmode=require` for encrypted DB connections |
| Client-side data | No note data stored in `localStorage`, `sessionStorage`, or cookies |

---

## 6. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Next.js | 14.x (App Router) | Full-stack React framework; pages + API routes |
| **Runtime** | Node.js | 18+ LTS | Server runtime for Next.js |
| **Language** | TypeScript | 5.x | Type safety across pages, components, Route Handlers |
| **Database** | PostgreSQL | 14+ | Durable relational storage for notes |
| **DB Driver** | `pg` (node-postgres) | 8.x | PostgreSQL client; connection pooling |
| **Styling** | Plain CSS / CSS Modules | — | No Tailwind or CSS-in-JS; `.module.css` files per component |
| **React** | React | 18.x | UI rendering; Server and Client Components |
| **Config** | `next.config.mjs` | — | ES Module config; `.ts` hard-errors on Next 14 |
| **Package Manager** | npm | 9+ | Dependency management |
| **Testing** | Playwright | latest | UAT end-to-end tests for US1–US6 |

---

### Key Dependency: `pg` (node-postgres)

The `pg` package is the PostgreSQL driver. It is used directly (no ORM) because:
1. The schema is a single table with five columns — ORM abstraction provides no value
2. Parameterized queries via `pool.query(text, params)` are sufficient and safe
3. Avoids Prisma's code generation step and Drizzle's schema file overhead
4. The connection pool is initialized once and reused across all requests

**`pg` Pool configuration:**
```typescript
new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,              // max connections in pool
  idleTimeoutMillis: 30_000,  // close idle connections after 30s
  connectionTimeoutMillis: 10_000, // fail fast if DB unreachable
})
```

---

### CSS Design Tokens

```css
/* globals.css — design system variables */
:root {
  --color-accent:     #FBCA5C;  /* Gold — CTAs, pinned indicators, highlights */
  --color-text:       #0A0A0A;  /* Near-black — all body text, labels, headings */
  --color-surface:    #FFFFFF;  /* White — page backgrounds, card surfaces */
  --color-border:     #E5E5E5;  /* Light gray — input borders, dividers */

  --font-size-body:   16px;     /* Minimum for mobile readability */
  --touch-target-min: 44px;     /* Minimum tap target size (WCAG 2.5.8) */

  --max-width:        480px;    /* Max content width; centers on desktop */
  --spacing-base:     16px;     /* Base spacing unit */
}
```

**Gold accent usage rule:** `#FBCA5C` must cover ≤10% of any single view's visible pixel area. Acceptable uses:
- "New note" button background
- "Save"/"Create" button background
- Pinned note indicator (icon, left border, or badge)
- Active/focus ring on inputs

---

## 7. Integration Points

### 1. PostgreSQL Database (Critical)

**Dependency level:** Critical — all CRUD operations require PostgreSQL.

**Connection:**
```
postgresql://[user]:[password]@[host]:[port]/[dbname]
```

**Environment variable:**

| Variable | Required | Format | Example |
|----------|----------|--------|---------|
| `DATABASE_URL` | Yes | `postgresql://user:pw@host:5432/dbname` | `postgresql://postgres:secret@localhost:5432/quicknotes` |

Alternative split-variable approach (if `DATABASE_URL` is not available):

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `PGHOST` | Yes | — | `localhost` |
| `PGPORT` | No | `5432` | `5432` |
| `PGUSER` | Yes | — | `postgres` |
| `PGPASSWORD` | Yes | — | `secret` |
| `PGDATABASE` | Yes | — | `quicknotes` |

**Recommendation:** Use `DATABASE_URL` as the single source of truth. The `pg` Pool accepts it directly via `connectionString`.

**Startup sequence:**
1. `lib/db.ts` imported → reads `DATABASE_URL` → fails fast if absent
2. `Pool` created → connections established lazily on first query
3. Auto-migration SQL executed → `CREATE TABLE IF NOT EXISTS notes (...)`
4. If migration fails → error logged to stderr → process should exit or surface clearly
5. Server begins accepting HTTP requests

**Connection pool settings:**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Max connections | 10 | Sufficient for single-user MVP |
| Idle timeout | 30 seconds | Returns idle connections to pool |
| Connection timeout | 10 seconds | Surfaces DB unavailability quickly |

---

### 2. Node.js / Container Runtime

**Binding:** `0.0.0.0:3000` (mandatory for container and iframe access)

**npm scripts (required exact values):**
```json
{
  "scripts": {
    "dev":   "next dev -H 0.0.0.0 -p 3000",
    "build": "next build",
    "start": "next start -H 0.0.0.0 -p 3000"
  }
}
```

**Config file:** `next.config.mjs` must exist at project root. No `next.config.ts`, no `next.config.js` (prefer `.mjs` for explicit ES Module semantics in Node.js).

---

### 3. Browser / iframe Host

**Supported browsers (MVP):**

| Browser | Platform |
|---------|----------|
| Chrome (latest stable) | Mobile + Desktop |
| Safari (latest stable) | Mobile + Desktop |
| Firefox (latest stable) | Mobile + Desktop |

**Viewport targets:**

| Target | Width | Requirement |
|--------|-------|-------------|
| Primary (mobile) | 375px–428px | Fully optimized; no horizontal scroll |
| Tablet | 768px+ | Must not break; layout may expand |
| Desktop | 1024px+ | Must not break; mobile design scales up |

**iframe embedding:** The application must render correctly inside `<iframe src="http://...">` from any origin. No `X-Frame-Options` or restrictive `frame-ancestors` CSP may be present in HTTP responses.

---

### 4. No Other External Integrations (MVP)

QuickNotes MVP is entirely self-contained. The following are explicitly absent:

- No authentication provider (no OAuth, SAML, or Azure AD)
- No email or notification service
- No analytics or telemetry
- No CDN or object storage
- No AI/ML services
- No third-party APIs

All functionality is delivered by the Next.js process and its PostgreSQL database.

---

## Appendix: Architecture Decision Record (ADR) Summary

| # | Decision | Options Considered | Chosen | Rationale |
|---|----------|-------------------|--------|-----------|
| ADR-01 | Config file extension | `.ts`, `.js`, `.mjs` | `.mjs` | Next.js 14 hard-errors on `.ts`; `.mjs` is explicit ES Module |
| ADR-02 | Database access layer | Prisma, Drizzle, raw `pg` | raw `pg` | Single table, simple CRUD; ORM adds complexity without value |
| ADR-03 | Auto-migration mechanism | Prisma Migrate, Flyway, `IF NOT EXISTS` | `CREATE TABLE IF NOT EXISTS` in module init | Zero external tools; idempotent; runs before first request |
| ADR-04 | Rendering strategy | CSR (SPA), SSR, ISR | SSR (Server Components) | Notes must reflect DB state on page load; no stale cache risk |
| ADR-05 | Search approach | Server-side API call, client-side filter | Client-side filter | In-memory filter on the already-loaded list; no debounce needed at MVP scale |
| ADR-06 | Styling approach | Tailwind CSS, CSS-in-JS, plain CSS | Plain CSS / CSS Modules | PRD does not require Tailwind; plain CSS is simpler and always works |
| ADR-07 | Frame compatibility | Default headers, custom headers | No `X-Frame-Options` emitted | App must render in `<iframe>` — any frame-blocking header breaks the use case |
| ADR-08 | Authentication | Full auth, simple token, none | None | Single-user operator environment; auth is out of scope for MVP |

---

*Document generated: 2026-06-17*  
*Source: PRD-QuickNotes.md, FRD-QuickNotes.md, .planning/PROJECT.md*  
*Next downstream document: UserStories-QuickNotes.md*
