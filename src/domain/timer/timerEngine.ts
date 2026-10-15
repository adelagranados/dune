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

/**
 * Wall-clock timestamp at which the target would be reached if the timer keeps
 * running from `now`.
 *
 * The target is measured in active work time, but a notification can only be
 * scheduled against wall-clock time — the two only line up while the timer is
 * running. That is why this returns null while paused: a frozen clock has no
 * future moment to aim at, so the pending notification has to be dropped and a
 * fresh one computed on resume.
 */
export function computeTargetFireAt(timer: ActiveTimer, now: number): number | null {
  if (timer.pausedAt !== null) {
    return null;
  }
  const remainingMs = computeRemainingTargetMs(timer, now);
  if (remainingMs === null || remainingMs <= 0) {
    return null;
  }
  return now + remainingMs;
}

/**
 * How long from `now` until the elapsed time crosses its next whole second.
 *
 * A clock drawn from these timestamps turns over on a boundary set by
 * `startedAt` and the pauses so far, not on whatever phase a repeating 1000ms
 * timer happened to start on — and resuming moves that boundary by the length
 * of the pause. Repainting on the wrong phase is what made the digits hold for
 * about two seconds, or skip one, after a quick pause and resume.
 *
 * Null while paused: a frozen clock has no next second to wait for, and the
 * current pause is not in `accumulatedPausedMs` yet, so there is no boundary
 * to measure from either.
 */
export function computeMsUntilNextSecond(timer: ActiveTimer, now: number): number | null {
  if (timer.pausedAt !== null) {
    return null;
  }
  const turnoverAnchor = timer.startedAt + timer.accumulatedPausedMs;
  return 1000 - ((now - turnoverAnchor) % 1000);
}

/** A reading of the clock, and the timer it was taken against. */
export type ElapsedReading = {
  timer: ActiveTimer | null;
  now: number;
};

/**
 * The elapsed time to show for `timer`, given the most recent reading of the
 * clock — which may have been taken against an earlier state of the session.
 *
 * A reading only means anything for the timer it was taken against, and in a
 * live app the two come apart constantly: pausing and resuming each replace
 * the timer, and whatever schedules the repaints has to catch up. Every resume
 * folds its pause into `accumulatedPausedMs`, so subtracting that larger total
 * from a reading taken before it leaves the clock short by exactly how long
 * the pause lasted — twelve seconds paused showing as twelve seconds lost.
 *
 * Rather than demand a fresh reading at the instant of every transition, this
 * leans on the fact that elapsed time is continuous across a pause and a
 * resume. A paused timer reports its frozen value without consulting the
 * reading at all, so a running timer whose reading predates it can defer to
 * the timer that reading *was* taken against: the paused one, still holding
 * the value the clock is about to resume from.
 *
 * That deferral stops at the session boundary. `startedAt` never moves once a
 * session begins, so it identifies one; without the check, starting a session
 * while the reading still described the one just finished would show the
 * finished session's total.
 */
export function computeElapsedMsForDisplay(
  timer: ActiveTimer | null,
  reading: ElapsedReading,
): number {
  if (timer === null) {
    return 0;
  }
  const taken = reading.timer;
  const deferToReading =
    timer.pausedAt === null &&
    taken !== null &&
    taken !== timer &&
    taken.startedAt === timer.startedAt;

  return computeActiveElapsedMs(deferToReading ? taken : timer, reading.now);
}
