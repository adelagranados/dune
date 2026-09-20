import { describe, expect, it } from 'vitest';

import {
  computeActiveElapsedMs,
  computeRemainingTargetMs,
  finishSession,
  isTargetReached,
  pauseSession,
  resumeSession,
  startSession,
} from './timerEngine';

const MINUTE = 60_000;
const T0 = Date.UTC(2026, 0, 1, 12, 0, 0);
const minutes = (n: number) => n * MINUTE;

describe('startSession', () => {
  it('anchors startedAt at now and starts with no paused time', () => {
    const timer = startSession('project-1', null, T0);

    expect(timer).toEqual({
      projectId: 'project-1',
      startedAt: T0,
      accumulatedPausedMs: 0,
      pausedAt: null,
      targetDurationMs: null,
    });
  });
});

describe('computeActiveElapsedMs', () => {
  it('grows with wall-clock time while running', () => {
    const timer = startSession('project-1', null, T0);

    expect(computeActiveElapsedMs(timer, T0 + minutes(10))).toBe(minutes(10));
  });

  it('freezes at the moment a pause began', () => {
    const running = startSession('project-1', null, T0);
    const paused = pauseSession(running, T0 + minutes(10));

    expect(computeActiveElapsedMs(paused, T0 + minutes(30))).toBe(minutes(10));
  });

  it('excludes paused time once resumed, matching the pause/resume example from the product brief', () => {
    // Target 15 min. Work 10 min, pause 20 min, resume, work 5 more min.
    let timer = startSession('project-1', minutes(15), T0);
    timer = pauseSession(timer, T0 + minutes(10));
    timer = resumeSession(timer, T0 + minutes(10) + minutes(20));

    const now = T0 + minutes(10) + minutes(20) + minutes(5);

    expect(computeActiveElapsedMs(timer, now)).toBe(minutes(15));
  });

  it('accumulates multiple separate pauses', () => {
    let timer = startSession('project-1', null, T0);
    timer = pauseSession(timer, T0 + minutes(5));
    timer = resumeSession(timer, T0 + minutes(5) + minutes(2));
    timer = pauseSession(timer, T0 + minutes(5) + minutes(2) + minutes(8));
    timer = resumeSession(timer, T0 + minutes(5) + minutes(2) + minutes(8) + minutes(3));

    // Active time so far: 5 + 8 = 13 min. Two pauses: 2 + 3 = 5 min excluded.
    const now = T0 + minutes(5) + minutes(2) + minutes(8) + minutes(3) + minutes(1);

    expect(computeActiveElapsedMs(timer, now)).toBe(minutes(14));
  });
});

describe('pauseSession / resumeSession', () => {
  it('throws when pausing a session that is already paused', () => {
    const timer = pauseSession(startSession('project-1', null, T0), T0 + minutes(1));

    expect(() => pauseSession(timer, T0 + minutes(2))).toThrow();
  });

  it('throws when resuming a session that is not paused', () => {
    const timer = startSession('project-1', null, T0);

    expect(() => resumeSession(timer, T0 + minutes(1))).toThrow();
  });
});

describe('target duration', () => {
  it('has no remaining time or "reached" state when no target was set', () => {
    const timer = startSession('project-1', null, T0);

    expect(computeRemainingTargetMs(timer, T0 + minutes(999))).toBeNull();
    expect(isTargetReached(timer, T0 + minutes(999))).toBe(false);
  });

  it('counts down remaining active time toward the target', () => {
    const timer = startSession('project-1', minutes(15), T0);

    expect(computeRemainingTargetMs(timer, T0 + minutes(10))).toBe(minutes(5));
    expect(isTargetReached(timer, T0 + minutes(10))).toBe(false);
  });

  it('is reached exactly at the target and stays reached past it, without stopping the timer', () => {
    const timer = startSession('project-1', minutes(15), T0);

    expect(isTargetReached(timer, T0 + minutes(15))).toBe(true);
    expect(computeRemainingTargetMs(timer, T0 + minutes(15))).toBe(0);

    // Working past the target keeps accumulating — remaining floors at 0, never negative.
    expect(isTargetReached(timer, T0 + minutes(22))).toBe(true);
    expect(computeRemainingTargetMs(timer, T0 + minutes(22))).toBe(0);
  });
});

describe('finishSession', () => {
  it('records the full active duration even past the target, matching the product brief example', () => {
    // Target 15 min, but the user keeps working until 22 min and then hits Finish.
    const timer = startSession('project-1', minutes(15), T0);

    const finished = finishSession(timer, T0 + minutes(22));

    expect(finished).toEqual({
      projectId: 'project-1',
      startedAt: T0,
      endedAt: T0 + minutes(22),
      durationMs: minutes(22),
    });
  });

  it('finishes with the frozen duration when called while paused', () => {
    const running = startSession('project-1', null, T0);
    const paused = pauseSession(running, T0 + minutes(8));

    const finished = finishSession(paused, T0 + minutes(50));

    expect(finished.durationMs).toBe(minutes(8));
  });
});
