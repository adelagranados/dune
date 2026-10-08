/**
 * Timer state is timestamp-based, never an incrementing counter: elapsed time
 * is always derived from `now`, `startedAt` and `accumulatedPausedMs`. Every
 * function here takes `now` as an explicit argument instead of reading
 * `Date.now()` internally, so the whole engine is testable with fixed
 * timestamps and has no notion of "background" vs "foreground" — there is
 * nothing to resume, because nothing was ever ticking.
 */

export type ActiveTimer = {
  projectId: string;
  /** Fixed anchor for this session; never changes after startSession. */
  startedAt: number;
  /** Sum of all completed pause intervals (excludes the current one, if any). */
  accumulatedPausedMs: number;
  /** Timestamp when the current pause began, or null while running. */
  pausedAt: number | null;
  /** Optional target the user picked in "Choose session length"; null = "No limit". */
  targetDurationMs: number | null;
};

export type FinishedSession = {
  projectId: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
};

export function startSession(
  projectId: string,
  targetDurationMs: number | null,
  now: number,
): ActiveTimer {
  return {
    projectId,
    startedAt: now,
    accumulatedPausedMs: 0,
    pausedAt: null,
    targetDurationMs,
  };
}

export function pauseSession(timer: ActiveTimer, now: number): ActiveTimer {
  if (timer.pausedAt !== null) {
    throw new Error('Cannot pause a session that is already paused.');
  }
  return { ...timer, pausedAt: now };
}

export function resumeSession(timer: ActiveTimer, now: number): ActiveTimer {
  if (timer.pausedAt === null) {
    throw new Error('Cannot resume a session that is not paused.');
  }
  return {
    ...timer,
    accumulatedPausedMs: timer.accumulatedPausedMs + (now - timer.pausedAt),
    pausedAt: null,
  };
}

export function finishSession(timer: ActiveTimer, now: number): FinishedSession {
  return {
    projectId: timer.projectId,
    startedAt: timer.startedAt,
    endedAt: now,
    durationMs: computeActiveElapsedMs(timer, now),
  };
}

/** Active work time, excluding any paused intervals — frozen while paused. */
export function computeActiveElapsedMs(timer: ActiveTimer, now: number): number {
  const referenceNow = timer.pausedAt ?? now;
  return referenceNow - timer.startedAt - timer.accumulatedPausedMs;
}

/** Time left until the target, in active work time. Null when there's no target. */
export function computeRemainingTargetMs(timer: ActiveTimer, now: number): number | null {
  if (timer.targetDurationMs === null) {
    return null;
  }
  return Math.max(0, timer.targetDurationMs - computeActiveElapsedMs(timer, now));
}

/** Derived, never persisted — recomputing from timestamps is what keeps this in sync. */
export function isTargetReached(timer: ActiveTimer, now: number): boolean {
  if (timer.targetDurationMs === null) {
    return false;
  }
  return computeActiveElapsedMs(timer, now) >= timer.targetDurationMs;
}
