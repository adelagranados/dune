import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';

import * as schema from './schema';

const expoDb = SQLite.openDatabaseSync('dune.db');

export const db = drizzle(expoDb, { schema });

export { default as migrations } from './migrations/migrations.js';
