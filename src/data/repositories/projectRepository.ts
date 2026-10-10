import { desc, eq, sql } from 'drizzle-orm';

import { db } from '@/data/db/client';
import { projects, sessions, type Project, type ProjectColor } from '@/data/db/schema';
import { generateId } from '@/lib/uuid';

export type CreateProjectInput = {
  name: string;
  category: string | null;
  color: ProjectColor;
  estimatedTimeMs: number | null;
};

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const project: Project = {
    id: generateId(),
    name: input.name,
    category: input.category,
    color: input.color,
    estimatedTimeMs: input.estimatedTimeMs,
    status: 'active',
    createdAt: Date.now(),
    completedAt: null,
  };

  await db.insert(projects).values(project);
  return project;
}

export type UpdateProjectInput = {
  name: string;
  category: string | null;
  color: ProjectColor;
  estimatedTimeMs: number | null;
};

/**
 * Edits a project's details. Sessions are untouched: the time already recorded
 * against a project does not belong to its name or its colour.
 */
export async function updateProject(id: string, input: UpdateProjectInput): Promise<void> {
  await db.update(projects).set(input).where(eq(projects.id, id));
}

export async function getProjectById(id: string): Promise<Project | null> {
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0] ?? null;
}

export type ProjectWithTotal = {
  project: Project;
  totalDurationMs: number;
};

export async function listProjectsWithTotals(): Promise<ProjectWithTotal[]> {
  const rows = await db
    .select({
      project: projects,
      totalDurationMs: sql<number>`coalesce(sum(${sessions.durationMs}), 0)`,
    })
    .from(projects)
    .leftJoin(sessions, eq(sessions.projectId, projects.id))
    .groupBy(projects.id)
    .orderBy(desc(projects.createdAt));

  return rows;
}

/** Categories already used, for the Create Project chips — free text, not a fixed enum. */
export async function getDistinctCategories(): Promise<string[]> {
  const rows = await db.select({ category: projects.category }).from(projects);

  const categories = new Set<string>();
  for (const row of rows) {
    if (row.category) {
      categories.add(row.category);
    }
  }
  return Array.from(categories);
}

/**
 * Removes a project together with every session recorded against it.
 *
 * The sessions are deleted explicitly rather than left to the database: the
 * foreign key is declared without `onDelete: 'cascade'`, and SQLite only
 * enforces foreign keys when the connection asks it to. Relying on either
 * would risk leaving rows pointing at a project that no longer exists, which
 * would then be counted by nothing and found by no screen.
 *
 * Both deletes share a transaction so a failure cannot strip the sessions and
 * leave the project standing.
 */
export async function deleteProject(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(sessions).where(eq(sessions.projectId, id));
    await tx.delete(projects).where(eq(projects.id, id));
  });
}
