import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

// Exported so the key/value store can share the one open connection rather
// than opening the same file twice.
export const expoDb = SQLite.openDatabaseSync('dune.db');

export const db = drizzle(expoDb, { schema });

export { default as migrations } from './migrations/migrations.js';
