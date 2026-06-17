---

## Y2: Cross-Feature Error Catalog

**Scope:** All error scenarios across QuickNotes features, with HTTP status codes, error response bodies, and user-visible behaviors.

---

### Error Response Shape

All API errors return JSON with a single `error` key:
```json
{ "error": "Human-readable error message" }
```

Page-level errors (SSR failures) render an appropriate UI state (error message, 404 page, etc.) rather than returning raw JSON.

---

### HTTP Status Code Reference

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, successful PUT |
| 201 | Created | Successful POST (note created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input (missing title, non-integer id, malformed JSON) |
| 404 | Not Found | Note with given `id` does not exist |
| 405 | Method Not Allowed | HTTP method not supported on the route |
| 500 | Internal Server Error | Database error, unexpected exception |

---

### Validation Errors (400)

| Error Code | HTTP | API Response Body | Trigger |
|------------|------|-------------------|---------|
| TITLE_REQUIRED | 400 | `{"error":"Title is required"}` | `POST /api/notes` or `PUT /api/notes/[id]` called with missing, null, or whitespace-only `title` |
| INVALID_ID | 400 | `{"error":"Invalid id"}` | `[id]` segment in path is not a valid positive integer |
| INVALID_BODY | 400 | `{"error":"Invalid request body"}` | Request body is not valid JSON |

---

### Not Found Errors (404)

| Error Code | HTTP | API Response Body | Trigger |
|------------|------|-------------------|---------|
| NOTE_NOT_FOUND | 404 | `{"error":"Note not found"}` | `GET /api/notes/[id]`, `PUT /api/notes/[id]`, or `DELETE /api/notes/[id]` called with an `id` that has no matching row |

**Page behavior for 404:** When `/notes/[id]/edit` is accessed and the note does not exist, the page renders a "Note not found" message with a link back to `/`. The HTTP status of the page response should also be 404.

---

### Method Not Allowed (405)

| HTTP | API Response Body | Trigger |
|------|-------------------|---------|
| 405 | `{"error":"Method not allowed"}` | HTTP method not defined for the requested route (e.g., DELETE on `/api/notes`, PATCH on any route) |

---

### Server Errors (500)

| Error Code | HTTP | API Response Body | Trigger |
|------------|------|-------------------|---------|
| DB_ERROR | 500 | `{"error":"Database error"}` | PostgreSQL query throws an exception (connection refused, query syntax error, constraint violation) |
| INTERNAL_ERROR | 500 | `{"error":"Internal server error"}` | Unexpected exception in route handler not related to DB |

**Page behavior for 500:** SSR pages that fail due to a database error render a generic error message: "Unable to load notes. Please try again." The raw error is logged server-side; the stack trace is never exposed to the client.

---

### Client-Side Form Validation Errors (Not HTTP)

These errors are caught before any API call is made and displayed inline in the UI:

| Scenario | Field | Inline Message |
|----------|-------|----------------|
| Submit with empty title | Title input | "Title is required" |
| Submit with whitespace-only title | Title input | "Title is required" |

---

### Startup Errors (Not HTTP)

These errors occur before the HTTP server is ready and are surfaced in process logs only:

| Scenario | Log Message | Behavior |
|----------|-------------|----------|
| `DATABASE_URL` not set | `"DATABASE_URL environment variable is required"` | Process exits or refuses to serve requests |
| Auto-migration SQL fails | `"[QuickNotes] Database migration failed: <pg error message>"` | Error surfaced; behavior (crash vs. degraded mode) is implementation-defined |
| DB unreachable at startup | `"[QuickNotes] Failed to connect to database: <error>"` | Error surfaced; retry logic optional for MVP |

---

### Error Handling Rules

1. **Never expose stack traces** or raw PostgreSQL error messages to API clients or page users.
2. **Always log** unexpected errors (500-level) to stdout/stderr with sufficient context for debugging.
3. **4xx errors** are expected and should not be logged as errors — they indicate client mistakes.
4. **Idempotency:** `DELETE /api/notes/[id]` returns 404 if the note is already gone. The UI (F03) treats a 404 on delete as a successful deletion and redirects to `/`.
5. **Network errors** (no response from server) on form submissions display a generic retry message; form values are preserved.
