---

## F04: Data Persistence & Auto-Migration

**PRD Reference:** F4 | **Priority:** P0 — Critical | **User Story:** US6

**Description:** All note data is stored durably in a PostgreSQL database. Notes survive page reloads, browser closes, and server restarts. The database schema is automatically created on application startup using `CREATE TABLE IF NOT EXISTS` — no manual migration steps, no CLI commands, no DBA intervention. The database connection string is read exclusively from environment variables; no credentials appear in source code.

---

### Terminology

- **Auto-migration:** Execution of `CREATE TABLE IF NOT EXISTS notes (...)` at startup — before any route handler runs — so the schema is always present when the first request arrives.
- **Idempotent migration:** The migration SQL can be run any number of times without error and without data loss. `CREATE TABLE IF NOT EXISTS` satisfies this.
- **DB URL:** The PostgreSQL connection string. Sourced from the environment variable `DATABASE_URL` (standard `postgresql://user:password@host:port/dbname` format).
- **Connection pool:** A reusable set of database connections managed by the application to avoid opening a new connection per request.

---

### Sub-features

- Auto-migration on startup (`CREATE TABLE IF NOT EXISTS`)
- Durable PostgreSQL storage for all CRUD operations
- Environment-variable-only database credentials
- Connection pool lifecycle management
- Startup health check verifying DB connectivity (see F05 §GET /api/health)

---

### Process — Startup Migration

1. At application startup (before the HTTP server begins accepting requests, or at latest before the first DB query executes):
   a. Read `DATABASE_URL` from environment variables.
   b. Open a database connection (or initialize the connection pool).
   c. Execute the migration SQL:
      ```sql
      CREATE TABLE IF NOT EXISTS notes (
        id         SERIAL PRIMARY KEY,
        title      TEXT NOT NULL,
        body       TEXT,
        pinned     BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ```
   d. If the SQL succeeds → proceed to serve requests normally.
   e. If the SQL fails (e.g., DB unreachable) → log the error to stdout/stderr with a clear message (e.g., `"[QuickNotes] Database migration failed: <error>"`). The application should not silently swallow the error. The behavior on failure (crash vs. retry) is implementation-defined, but the error must be clearly surfaced.

2. Subsequent startups: `CREATE TABLE IF NOT EXISTS` is a no-op if the table already exists. No data is lost.

---

### Process — CRUD Persistence

All create, read, update, and delete operations performed by the REST API (see F05) and by page-level SSR queries (see F00, F03) read from and write to PostgreSQL exclusively. There is no in-memory cache layer in MVP.

| Operation | SQL Pattern |
|-----------|------------|
| List all notes | `SELECT id, title, pinned, created_at FROM notes ORDER BY pinned DESC, created_at DESC` |
| Fetch one note | `SELECT id, title, body, pinned, created_at FROM notes WHERE id = $1` |
| Create note | `INSERT INTO notes (title, body, pinned) VALUES ($1, $2, $3) RETURNING *` |
| Update note | `UPDATE notes SET title=$1, body=$2, pinned=$3 WHERE id=$4 RETURNING *` |
| Delete note | `DELETE FROM notes WHERE id=$1` |

---

### Inputs

- `DATABASE_URL` environment variable (string): PostgreSQL connection string in standard `postgresql://` URI format.

---

### Outputs

- Database schema present and queryable after startup.
- All write operations are immediately durable (standard PostgreSQL ACID guarantees).
- Read operations reflect the latest committed state.

---

### Validation

- `DATABASE_URL` must be set. If absent, the application must fail with a clear error message rather than using a default or fallback.
- The migration SQL must be `CREATE TABLE IF NOT EXISTS` — not `CREATE TABLE` (which would fail on the second startup) and not `DROP TABLE IF EXISTS; CREATE TABLE` (which would destroy data).
- Connection pool must be initialized once and reused across requests — not opened/closed per request.
- No database credentials may appear in source code, committed `.env` files, or build artifacts.

---

### Error States

| Scenario | Behavior |
|----------|----------|
| `DATABASE_URL` not set | Application fails to start; logs: "DATABASE_URL environment variable is required" |
| Database unreachable at startup | Migration fails; error logged; app behavior on continued start is implementation-defined but error must be surfaced |
| Database unreachable during a request | API returns `500` with `{ "error": "Database error" }`; page renders generic error message |
| Migration SQL fails (unexpected DB state) | Error logged; app may crash to prevent serving requests against a broken schema |
| Connection pool exhaustion | Query fails; API returns `500`; error logged |

---

### API Surface (this feature)

No dedicated API endpoint for migration. Migration is a startup side-effect. The `GET /api/health` endpoint (see F05) verifies DB connectivity post-migration.

---

### Schema Surface (this feature)

**Full DDL — single authoritative definition:**

```sql
CREATE TABLE IF NOT EXISTS notes (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  body       TEXT,
  pinned     BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

See `Y0-schema.md` for the canonical DDL.
