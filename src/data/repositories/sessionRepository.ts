import { desc, eq } from 'drizzle-orm';

import { db } from '@/data/db/client';
import { sessions, type Session } from '@/data/db/schema';

export async function listSessionsByProject(projectId: string): Promise<Session[]> {
  return db.select().from(sessions).where(eq(sessions.projectId, projectId)).orderBy(desc(sessions.startedAt));
}
