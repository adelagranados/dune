import { desc, eq } from 'drizzle-orm';

import { db } from '@/data/db/client';
import { sessions, type Session, type SessionSource } from '@/data/db/schema';
import { generateId } from '@/lib/uuid';

export type CreateSessionInput = {
  projectId: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  source: SessionSource;
};

export async function createSession(input: CreateSessionInput): Promise<Session> {
  const session: Session = { id: generateId(), ...input };

  await db.insert(sessions).values(session);
  return session;
}

export async function listSessionsByProject(projectId: string): Promise<Session[]> {
  return db.select().from(sessions).where(eq(sessions.projectId, projectId)).orderBy(desc(sessions.startedAt));
}

export async function countSessionsByProject(projectId: string): Promise<number> {
  const rows = await db.select({ id: sessions.id }).from(sessions).where(eq(sessions.projectId, projectId));
  return rows.length;
}
