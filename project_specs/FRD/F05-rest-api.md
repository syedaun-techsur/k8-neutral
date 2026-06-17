---

## F05: REST API

**PRD Reference:** F5 | **Priority:** P0 — Critical | **User Stories:** US1–US6 (infrastructure)

**Description:** A complete REST API backs all UI operations and is independently usable by external clients. All endpoints are implemented as Next.js App Router Route Handlers (`app/api/.../route.ts` or `.js`). The API follows resource-oriented conventions, returns JSON, and uses standard HTTP status codes. `GET /api/health` has no database dependency; all other endpoints require the `notes` table to exist (ensured by F04 auto-migration).

---

### Terminology

- **Route Handler:** A Next.js App Router file exporting named async functions (`GET`, `POST`, `PUT`, `DELETE`) mapped to HTTP methods.
- **Request body:** JSON-encoded payload sent by the client in `POST` and `PUT` requests. `Content-Type: application/json` expected.
- **`[id]`:** Dynamic route segment, integer string. Must be parseable as a positive integer.
- **`?q=`:** Optional query parameter on `GET /api/notes` for server-side title filtering (in addition to client-side filtering in F01).

---

### Sub-features

- `GET /api/health` — health check (no DB dependency)
- `GET /api/notes` — list all notes, optional `?q=` filter
- `POST /api/notes` — create a note
- `GET /api/notes/[id]` — fetch one note
- `PUT /api/notes/[id]` — update one note
- `DELETE /api/notes/[id]` — delete one note

---

### Process — GET /api/health

1. Receive request.
2. Return immediately with `200 OK` and body `{"status":"ok"}`.
3. No database query. No authentication. This endpoint must always respond as long as the process is alive.

---

### Process — GET /api/notes

1. Receive request. Read optional `?q=` query parameter.
2. If `?q=` is absent or empty: `SELECT id, title, body, pinned, created_at FROM notes ORDER BY pinned DESC, created_at DESC`.
3. If `?q=` is present and non-empty: `SELECT id, title, body, pinned, created_at FROM notes WHERE title ILIKE $1 ORDER BY pinned DESC, created_at DESC` with `$1 = '%' + q + '%'`.
4. Return `200 OK` with JSON array of note objects (see Y1-api.md for schema). Empty array `[]` if no results.

---

### Process — POST /api/notes

1. Receive request. Parse JSON body.
2. Validate `title` is present and non-empty after trimming. If invalid → `400 Bad Request` with `{"error":"Title is required"}`.
3. Coerce `pinned` to boolean. If absent → default `false`.
4. Coerce `body` to string or `null`. If absent → `null`.
5. Execute: `INSERT INTO notes (title, body, pinned) VALUES ($1, $2, $3) RETURNING *`.
6. Return `201 Created` with the inserted note object as JSON.

---

### Process — GET /api/notes/[id]

1. Receive request. Parse `[id]` segment as integer. If not a valid positive integer → `400 Bad Request`.
2. Execute: `SELECT id, title, body, pinned, created_at FROM notes WHERE id = $1`.
3. If no row found → `404 Not Found` with `{"error":"Note not found"}`.
4. If row found → `200 OK` with note object as JSON.

---

### Process — PUT /api/notes/[id]

1. Receive request. Parse `[id]` as integer. If invalid → `400 Bad Request`.
2. Parse JSON body.
3. Validate `title` is present and non-empty after trimming. If invalid → `400 Bad Request` with `{"error":"Title is required"}`.
4. Verify note exists: `SELECT id FROM notes WHERE id = $1`. If not found → `404 Not Found` with `{"error":"Note not found"}`.
5. Execute: `UPDATE notes SET title=$1, body=$2, pinned=$3 WHERE id=$4 RETURNING *`.
   - `body`: use provided value or `null` if absent.
   - `pinned`: use provided boolean value; if absent, use existing value from the SELECT above.
6. Return `200 OK` with the updated note object as JSON.

---

### Process — DELETE /api/notes/[id]

1. Receive request. Parse `[id]` as integer. If invalid → `400 Bad Request`.
2. Execute: `DELETE FROM notes WHERE id = $1`.
3. If zero rows deleted (note did not exist) → `404 Not Found` with `{"error":"Note not found"}`.
4. If one row deleted → `204 No Content` (empty body).

---

### Inputs

| Endpoint | Input | Type | Required |
|----------|-------|------|----------|
| POST /api/notes | `title` | string | Yes |
| POST /api/notes | `body` | string | No (null if absent) |
| POST /api/notes | `pinned` | boolean | No (default false) |
| PUT /api/notes/[id] | `title` | string | Yes |
| PUT /api/notes/[id] | `body` | string | No (null if absent) |
| PUT /api/notes/[id] | `pinned` | boolean | No (retain existing if absent) |
| GET /api/notes | `?q=` | string (query param) | No |

---

### Outputs (Response Shapes)

**Note object (returned by GET /api/notes, GET /api/notes/[id], POST, PUT):**
```json
{
  "id": 1,
  "title": "My note",
  "body": "Optional content",
  "pinned": false,
  "createdAt": "2026-06-17T12:00:00.000Z"
}
```

**GET /api/notes — success:**
```json
[{ "id": 1, "title": "...", "body": "...", "pinned": false, "createdAt": "..." }]
```

**GET /api/health — success:**
```json
{ "status": "ok" }
```

**Error response shape (all 4xx/5xx):**
```json
{ "error": "<human-readable error message>" }
```

---

### Validation

- `[id]` must parse as a positive integer. Non-numeric or negative → `400`.
- `title` must be non-empty after `String.prototype.trim()`. Whitespace-only → treated as empty → `400`.
- `body` is always optional; null and empty string are both valid stored values.
- `pinned` must be boolean if provided. Non-boolean values should be coerced or rejected (implementation choice; true/false strings from form submits should be handled).
- HTTP method not allowed on a route → `405 Method Not Allowed`.
- Malformed JSON in request body → `400 Bad Request`.

---

### Error States

| Scenario | HTTP Status | Response Body |
|----------|-------------|---------------|
| `title` missing or empty | 400 | `{"error":"Title is required"}` |
| `[id]` not a valid integer | 400 | `{"error":"Invalid id"}` |
| Note not found | 404 | `{"error":"Note not found"}` |
| Method not allowed | 405 | `{"error":"Method not allowed"}` |
| Malformed JSON body | 400 | `{"error":"Invalid request body"}` |
| Database error | 500 | `{"error":"Database error"}` |
| Unexpected server error | 500 | `{"error":"Internal server error"}` |

---

### API Surface (this feature)

This feature IS the API. Full request/response schemas with headers and examples in `Y1-api.md`.

---

### Schema Surface (this feature)

All endpoints read/write the `notes` table. See `Y0-schema.md §notes table`.
