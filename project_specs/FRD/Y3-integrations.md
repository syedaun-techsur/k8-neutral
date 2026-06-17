---

## Y3: External Integration Points

**Scope:** All external systems and environment dependencies that QuickNotes relies on at runtime.

---

### 1. PostgreSQL Database

**Type:** External relational database  
**Dependency level:** Critical — all CRUD operations require PostgreSQL  
**Connection mechanism:** Standard TCP connection via `pg` (node-postgres) or compatible driver  

#### Environment Variables

| Variable | Required | Format | Example |
|----------|----------|--------|---------|
| `DATABASE_URL` | Yes | `postgresql://user:password@host:port/dbname` | `postgresql://postgres:secret@localhost:5432/quicknotes` |

Alternative split-variable approach (implementation may choose either):

| Variable | Required | Example |
|----------|----------|---------|
| `PGHOST` | Yes | `localhost` |
| `PGPORT` | No (default 5432) | `5432` |
| `PGUSER` | Yes | `postgres` |
| `PGPASSWORD` | Yes | `secret` |
| `PGDATABASE` | Yes | `quicknotes` |

**Recommendation:** Use `DATABASE_URL` as the single source of truth for simplicity.

#### Connection Pool Configuration

| Parameter | Recommended Value | Notes |
|-----------|------------------|-------|
| Max connections | 10 | Suitable for single-user MVP |
| Idle timeout | 30 seconds | Return idle connections to pool |
| Connection timeout | 10 seconds | Surface DB unavailability quickly |

#### Startup Behavior

- The connection pool is initialized once at application startup (or on first request).
- Auto-migration (`CREATE TABLE IF NOT EXISTS`) is executed once before serving any requests.
- If PostgreSQL is unavailable at startup, the error is logged and the application must surface it clearly (see Y2-errors.md §Startup Errors).

#### Security Constraints

- `DATABASE_URL` (or equivalent variables) must NEVER be hard-coded in source files.
- `.env` files containing credentials must be listed in `.gitignore`.
- Credentials must not appear in build artifacts, Docker image layers, or Next.js client bundles.
- The database connection is server-side only — credentials are never sent to the browser.

---

### 2. Node.js Runtime / Container Environment

**Type:** Process environment  
**Dependency level:** Required — Next.js runs on Node.js  

#### Port Binding

| Property | Value |
|----------|-------|
| Host | `0.0.0.0` (all interfaces) |
| Port | `3000` |
| Protocol | HTTP |

#### Required npm Scripts

```json
{
  "scripts": {
    "dev":   "next dev -H 0.0.0.0 -p 3000",
    "build": "next build",
    "start": "next start -H 0.0.0.0 -p 3000"
  }
}
```

#### Config File Constraint

The Next.js configuration must be at `next.config.mjs` in the project root. No other extension is acceptable for Next.js 14.

---

### 3. Browser Environment (Client-Side)

**Type:** Web browser  
**Dependency level:** Required — UI is browser-rendered  

#### Supported Browsers (MVP)

- Chrome (latest stable) — mobile and desktop
- Safari (latest stable) — mobile and desktop
- Firefox (latest stable) — mobile and desktop

#### Viewport Targets

| Target | Width | Notes |
|--------|-------|-------|
| Primary (mobile) | 375px–428px | iPhone SE to iPhone 14 Pro Max |
| Secondary (tablet) | 768px+ | Must not break; layout may expand |
| Desktop | 1024px+ | Must not break; mobile design scales up |

#### iframe Embedding

The application must render correctly when embedded via `<iframe src="http://...">`. The host page's origin may differ from the app's origin. No `X-Frame-Options` or restrictive `frame-ancestors` CSP may be emitted (see F07).

---

### 4. No Other External Integrations (MVP)

QuickNotes MVP has no integrations with:

- Authentication providers (no OAuth, no SAML, no Azure AD)
- Email or notification services
- Analytics or telemetry platforms
- CDN or object storage
- AI/ML services
- Third-party APIs of any kind

All functionality is self-contained within the Next.js application and its PostgreSQL database.
