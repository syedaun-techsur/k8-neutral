import { Pool } from 'pg';

// Lazy singleton — created on first use, not at module load time.
// This avoids throwing during `next build` when DATABASE_URL is absent.
let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    _pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  }
  return _pool;
}

// Migration promise — resolves after CREATE TABLE IF NOT EXISTS completes.
// Lazily created on first access so it only runs at request time.
let _migrate: Promise<void> | null = null;

function getMigration(): Promise<void> {
  if (!_migrate) {
    _migrate = getPool()
      .query(
        `CREATE TABLE IF NOT EXISTS notes (
          id         SERIAL PRIMARY KEY,
          title      TEXT        NOT NULL,
          body       TEXT,
          pinned     BOOLEAN     NOT NULL DEFAULT false,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`
      )
      .then(() => undefined)
      .catch((err) => {
        console.error('[QuickNotes] Database migration failed:', err.message);
        throw err;
      });
  }
  return _migrate;
}

// `ready` is a getter so it only triggers on first real request.
export const ready: Promise<void> = new Proxy({} as Promise<void>, {
  get(_target, prop) {
    const migration = getMigration();
    return (migration as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export function query(text: string, params?: unknown[]) {
  return getPool().query(text, params);
}
