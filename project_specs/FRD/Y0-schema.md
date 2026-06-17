---

## Y0: Database Schema

**Scope:** All entities used by QuickNotes MVP. The application has exactly one table: `notes`.

---

### notes Table

**Purpose:** Stores all user-created notes. Single entity, four operations (CRUD). No foreign keys, no joins.

#### DDL — Canonical Auto-Migration SQL

```sql
CREATE TABLE IF NOT EXISTS notes (
  id         SERIAL PRIMARY KEY,
  title      TEXT        NOT NULL,
  body       TEXT,
  pinned     BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

This SQL is executed at application startup before the first request is served (see F04 §Process — Startup Migration). It is safe to run multiple times (`IF NOT EXISTS` makes it idempotent).

---

#### Column Definitions

| Column | PostgreSQL Type | Nullable | Default | Notes |
|--------|----------------|----------|---------|-------|
| `id` | `SERIAL` | NO | Auto-increment (sequence) | Primary key. Integer, auto-incremented. Exposed in API as `"id"`. |
| `title` | `TEXT` | NO | — (required) | Note title. Must be non-empty (enforced in application layer). No max length in DB. |
| `body` | `TEXT` | YES | NULL | Note body/content. Optional. Stored as NULL if not provided. |
| `pinned` | `BOOLEAN` | NO | `false` | Pin flag. When true, note is sorted to the top of all lists. |
| `created_at` | `TIMESTAMPTZ` | NO | `now()` | Creation timestamp with timezone. Set by DB on INSERT; never updated. |

---

#### Indexes

No additional indexes for MVP. The full table scan is acceptable for a personal single-user application with a small row count.

**Future consideration (not MVP):** `CREATE INDEX idx_notes_created_at ON notes (created_at DESC);` if list query performance degrades.

---

#### Constraints Summary

| Constraint | Type | Definition |
|------------|------|------------|
| `notes_pkey` | PRIMARY KEY | `id` |
| `title NOT NULL` | NOT NULL | `title` must always have a value |
| `pinned NOT NULL` | NOT NULL | `pinned` must always have a value |
| `created_at NOT NULL` | NOT NULL | `created_at` must always have a value |

---

#### Standard Query Patterns

```sql
-- List all notes (home page, F00)
SELECT id, title, pinned, created_at
FROM notes
ORDER BY pinned DESC, created_at DESC;

-- List with server-side title filter (GET /api/notes?q=, F05)
SELECT id, title, body, pinned, created_at
FROM notes
WHERE title ILIKE $1
ORDER BY pinned DESC, created_at DESC;
-- $1 = '%' || search_term || '%'

-- Fetch one note (edit page load, GET /api/notes/[id], F03/F05)
SELECT id, title, body, pinned, created_at
FROM notes
WHERE id = $1;

-- Create note (POST /api/notes, F02/F05)
INSERT INTO notes (title, body, pinned)
VALUES ($1, $2, $3)
RETURNING id, title, body, pinned, created_at;

-- Update note (PUT /api/notes/[id], F03/F05)
UPDATE notes
SET title = $1, body = $2, pinned = $3
WHERE id = $4
RETURNING id, title, body, pinned, created_at;

-- Delete note (DELETE /api/notes/[id], F03/F05)
DELETE FROM notes
WHERE id = $1;
-- Check affected row count: 0 = not found (404), 1 = success (204)
```

---

#### JSON Serialization Mapping

PostgreSQL column names use `snake_case`; API responses use `camelCase`:

| DB Column | API JSON Key | Example Value |
|-----------|-------------|---------------|
| `id` | `id` | `1` |
| `title` | `title` | `"My note"` |
| `body` | `body` | `"Optional content"` or `null` |
| `pinned` | `pinned` | `false` |
| `created_at` | `createdAt` | `"2026-06-17T12:00:00.000Z"` |

---

#### Future Schema Evolution

Per the PRD, schema changes after MVP must use additive `ALTER TABLE` statements — never destructive changes. No existing columns may be dropped or renamed in production without a migration plan. New columns must have defaults or be nullable to avoid breaking the auto-migration idempotency guarantee.
