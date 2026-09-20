import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export type ProjectStatus = 'active' | 'completed';
export type SessionSource = 'timer' | 'manual';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  // Free-text tag chosen or typed by the user — not a fixed enum (see architecture Q&A).
  category: text('category'),
  color: text('color').notNull(),
  estimatedTimeMs: integer('estimated_time_ms'),
  status: text('status').notNull().$type<ProjectStatus>(),
  createdAt: integer('created_at').notNull(),
  completedAt: integer('completed_at'),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  // Wall-clock boundaries, used for display only (e.g. "Started at 3:30 PM").
  startedAt: integer('started_at').notNull(),
  endedAt: integer('ended_at').notNull(),
  // The value that actually gets added to the project total — active work
  // time for timer sessions (pauses excluded), equal to endedAt - startedAt
  // for manual entries.
  durationMs: integer('duration_ms').notNull(),
  source: text('source').notNull().$type<SessionSource>(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
