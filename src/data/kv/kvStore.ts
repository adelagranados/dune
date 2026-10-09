import { expoDb } from '@/data/db/client';

/**
 * A small key/value table inside the same SQLite file as the rest of the data.
 *
 * Created with a raw statement instead of a Drizzle migration on purpose: the
 * active timer is read at module load, well before `useMigrations` has had a
 * chance to run, so the table has to already exist by then. It has one shape
 * and nothing to evolve, which is what makes that safe.
 *
 * The reads are deliberately synchronous. `useActiveTimerStore` seeds itself
 * with one at creation, so relaunching the app paints the running session
 * immediately rather than flashing an empty state and filling it in.
 */
expoDb.execSync(
  'CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)',
);

export function readValue(key: string): string | null {
  const row = expoDb.getFirstSync<{ value: string }>('SELECT value FROM kv WHERE key = ?', key);
  return row?.value ?? null;
}

export function writeValue(key: string, value: string): void {
  expoDb.runSync(
    'INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

export function removeValue(key: string): void {
  expoDb.runSync('DELETE FROM kv WHERE key = ?', key);
}
