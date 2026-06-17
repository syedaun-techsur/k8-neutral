---

## F07: Iframe & Deployment Compatibility

**PRD Reference:** F7 | **Priority:** P0 — Critical | **User Stories:** —

**Description:** The application must render correctly when embedded in an `<iframe>` (e.g., a preview panel or dashboard widget) and must not emit HTTP response headers that prevent framing. The server must bind to `0.0.0.0:3000` to be accessible in containerized or reverse-proxied environments. The Next.js config file must use the `.mjs` extension — never `.ts` — because Next.js 14 cannot parse TypeScript config files and will hard-error at build time.

---

### Terminology

- **`X-Frame-Options`:** An HTTP response header that prevents a page from being embedded in an `<iframe>`. Must NOT be emitted.
- **`frame-ancestors` directive:** A `Content-Security-Policy` directive that restricts which origins can embed the page in a frame. Must NOT be set to a restrictive value (e.g., `'none'` or `'self'`).
- **`0.0.0.0`:** Wildcard bind address — the server listens on all network interfaces, making it accessible from outside the container.
- **`next.config.mjs`:** The required Next.js configuration file. Must be `.mjs` (ES Module) or `.js` (CommonJS). TypeScript extension `.ts` causes a hard build/startup error on Next.js 14.
- **Hard-error:** A Next.js build or startup failure that prevents the application from running entirely.

---

### Sub-features

- Omit `X-Frame-Options` header from all responses
- Omit or leave unrestricted the `Content-Security-Policy: frame-ancestors` directive
- Server listens on `0.0.0.0:3000`
- Config file is `next.config.mjs` (never `next.config.ts`)
- No other frame-blocking mechanisms introduced by middleware or custom headers

---

### Process — Header Configuration

1. In `next.config.mjs`, configure the `headers()` async function to explicitly **not** set `X-Frame-Options` on any route.
2. Do not set `Content-Security-Policy` headers with `frame-ancestors 'none'` or `frame-ancestors 'self'`. If a CSP is needed in future, it must allow framing.
3. Next.js 14 may set `X-Frame-Options: SAMEORIGIN` by default in some versions. Explicitly override with an empty or no-op configuration if needed to ensure the header is absent.
4. Verify no middleware (`middleware.ts`) adds frame-blocking headers.

---

### Process — Port & Host Binding

1. The `next start` command (or custom server) must bind to host `0.0.0.0` and port `3000`.
2. In `package.json`, the start script must be: `"start": "next start -H 0.0.0.0 -p 3000"`.
3. The dev script should also use: `"dev": "next dev -H 0.0.0.0 -p 3000"` for consistency.
4. No environment variable should override the port unless explicitly designed to do so.

---

### Process — Config File

1. The Next.js configuration file must be named exactly `next.config.mjs`.
2. The file must use ES Module syntax (`export default { ... }`).
3. Do NOT create `next.config.ts` — even if the rest of the project uses TypeScript, the config file must be `.mjs`.
4. If the project were to be moved to a newer Next.js version that supports `.ts`, migration to `.ts` is explicitly deferred — not a risk to take during MVP.

---

### Inputs

- HTTP request to any route (determines whether frame-blocking headers are present in the response).
- `package.json` start script (determines bind address and port).
- `next.config.mjs` (determines header policy and any Next.js-level overrides).

---

### Outputs

- HTTP responses with NO `X-Frame-Options` header.
- HTTP responses with NO `Content-Security-Policy` header containing a restrictive `frame-ancestors` directive.
- Server process listening on `0.0.0.0:3000` after `npm start`.
- Successful Next.js build and startup with `next.config.mjs` present.

---

### Validation

- **Required absence check:** `X-Frame-Options` must not appear in response headers for any route (verify with `curl -I http://localhost:3000/`).
- **Required absence check:** `Content-Security-Policy` header, if present, must not contain `frame-ancestors 'none'` or `frame-ancestors 'self'`.
- **Port check:** `ss -tlnp | grep 3000` or equivalent shows the process listening on `0.0.0.0:3000` after startup.
- **Config file check:** `ls next.config.*` shows exactly `next.config.mjs` — no `.ts`, no `.js` duplicate.
- **Build check:** `npm run build` completes without error (no TypeScript config parse error).

---

### Error States

| Scenario | Impact | Resolution |
|----------|--------|------------|
| `next.config.ts` used instead of `.mjs` | Hard build/startup error; app cannot start | Delete `.ts` file; create `next.config.mjs` with identical config using ES Module syntax |
| `X-Frame-Options` header present in responses | App fails to render in iframe | Remove header configuration from `next.config.mjs` and any middleware |
| Server bound to `127.0.0.1` instead of `0.0.0.0` | App inaccessible from outside the container | Update start script to use `-H 0.0.0.0` |
| Port conflict on 3000 | App fails to start | Resolve port conflict; the target port is non-negotiable for MVP |

---

### API Surface (this feature)

No dedicated API endpoints. Applies to all HTTP responses across all routes and API endpoints.

---

### Schema Surface (this feature)

None. No database interaction specific to this feature.
