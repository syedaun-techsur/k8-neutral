---

## Y1: REST API Endpoint Catalog

**Base URL:** `http://0.0.0.0:3000` (or the deployed hostname)  
**Content-Type:** All request bodies and responses are `application/json` unless the response has no body (204).  
**Authentication:** None — all endpoints are publicly accessible.  
**Implementation:** Next.js 14 App Router Route Handlers in `app/api/`.

---

### Shared Response Conventions

**Success note object schema** (returned by GET list item, GET single, POST, PUT):
```json
{
  "id":        1,
  "title":     "My note title",
  "body":      "Optional body content or null",
  "pinned":    false,
  "createdAt": "2026-06-17T12:00:00.000Z"
}
```

**Error response schema** (all 4xx and 5xx responses):
```json
{ "error": "Human-readable error message" }
```

---

### GET /api/health

**Purpose:** Health check. Verifies the process is alive. No database dependency.  
**File:** `app/api/health/route.ts` (or `.js`)

**Request:**
```
GET /api/health HTTP/1.1
```
No headers, body, or parameters required.

**Response — 200 OK:**
```json
{ "status": "ok" }
```

**Error responses:** None expected. If the process is alive, this endpoint always returns 200.

---

### GET /api/notes

**Purpose:** Returns all notes, newest first with pinned notes promoted to top. Optional title filter via `?q=`.  
**File:** `app/api/notes/route.ts`

**Request:**
```
GET /api/notes HTTP/1.1
GET /api/notes?q=groceries HTTP/1.1
```

| Query Parameter | Type | Required | Description |
|----------------|------|----------|-------------|
| `q` | string | No | Case-insensitive substring filter on `title`. If omitted or empty, all notes are returned. |

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

Returns `[]` (empty array) if no notes exist or no notes match the filter.

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 500 | `{"error":"Database error"}` | PostgreSQL query failure |

---

### POST /api/notes

**Purpose:** Creates a new note. Returns the created note with its assigned `id` and `createdAt`.  
**File:** `app/api/notes/route.ts`

**Request:**
```
POST /api/notes HTTP/1.1
Content-Type: application/json

{
  "title":  "My new note",
  "body":   "Optional body text",
  "pinned": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Non-empty after trimming. |
| `body` | string \| null | No | Note body. Null or omitted → stored as NULL. |
| `pinned` | boolean | No | Defaults to `false` if omitted. |

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
| 400 | `{"error":"Title is required"}` | `title` missing, null, or empty/whitespace |
| 400 | `{"error":"Invalid request body"}` | Malformed JSON |
| 500 | `{"error":"Database error"}` | PostgreSQL insert failure |

---

### GET /api/notes/[id]

**Purpose:** Fetches a single note by its integer primary key.  
**File:** `app/api/notes/[id]/route.ts`

**Request:**
```
GET /api/notes/42 HTTP/1.1
```

**Path Parameter:** `id` — positive integer string.

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

### PUT /api/notes/[id]

**Purpose:** Replaces the `title`, `body`, and `pinned` fields of an existing note. Returns the updated note.  
**File:** `app/api/notes/[id]/route.ts`

**Request:**
```
PUT /api/notes/42 HTTP/1.1
Content-Type: application/json

{
  "title":  "Updated title",
  "body":   "Updated body",
  "pinned": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Non-empty after trimming. |
| `body` | string \| null | No | Updated body. Null or omitted → stored as NULL. |
| `pinned` | boolean | No | If omitted, existing value is retained. |

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

> `createdAt` is never changed by a PUT — it reflects the original creation time.

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{"error":"Invalid id"}` | `id` is not a valid positive integer |
| 400 | `{"error":"Title is required"}` | `title` missing, null, or empty/whitespace |
| 400 | `{"error":"Invalid request body"}` | Malformed JSON |
| 404 | `{"error":"Note not found"}` | No note with that `id` exists |
| 500 | `{"error":"Database error"}` | PostgreSQL update failure |

---

### DELETE /api/notes/[id]

**Purpose:** Permanently deletes a note. Returns no body on success.  
**File:** `app/api/notes/[id]/route.ts`

**Request:**
```
DELETE /api/notes/42 HTTP/1.1
```

**Path Parameter:** `id` — positive integer string.

**Response — 204 No Content:**
```
HTTP/1.1 204 No Content
```
No response body.

**Error responses:**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{"error":"Invalid id"}` | `id` is not a valid positive integer |
| 404 | `{"error":"Note not found"}` | No note with that `id` exists (zero rows deleted) |
| 500 | `{"error":"Database error"}` | PostgreSQL delete failure |

---

### Method Not Allowed

Any HTTP method not defined on a route returns:

```
HTTP/1.1 405 Method Not Allowed
Content-Type: application/json

{ "error": "Method not allowed" }
```

---

### File Layout (Next.js App Router)

```
app/
  api/
    health/
      route.ts         ← exports GET
    notes/
      route.ts         ← exports GET, POST
      [id]/
        route.ts       ← exports GET, PUT, DELETE
```
