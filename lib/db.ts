import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

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

export const ready = migrate;

export function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}
