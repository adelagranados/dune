import { create } from 'zustand';

import { clearActiveTimer, readActiveTimer, writeActiveTimer } from '@/data/kv/activeTimer.store';
import {
  finishSession,
  pauseSession,
  resumeSession,
  startSession,
  type ActiveTimer,
  type FinishedSession,
} from '@/domain/timer/timerEngine';

type ActiveTimerState = {
  timer: ActiveTimer | null;
  start: (projectId: string, targetDurationMs: number | null) => void;
  pause: () => void;
  resume: () => void;
  finish: () => FinishedSession | null;
};

/**
 * Orchestrates the pure timer engine with its persisted copy. The store is
 * seeded straight from storage, so a relaunch picks the session back up with
 * its original startedAt rather than restarting the clock.
 */
export const useActiveTimerStore = create<ActiveTimerState>((set, get) => ({
  timer: readActiveTimer(),

  start: (projectId, targetDurationMs) => {
    const timer = startSession(projectId, targetDurationMs, Date.now());
    writeActiveTimer(timer);
    set({ timer });
  },

  pause: () => {
    const current = get().timer;
    if (!current || current.pausedAt !== null) {
      return;
    }
    const timer = pauseSession(current, Date.now());
    writeActiveTimer(timer);
    set({ timer });
  },

  resume: () => {
    const current = get().timer;
    if (!current || current.pausedAt === null) {
      return;
    }
    const timer = resumeSession(current, Date.now());
    writeActiveTimer(timer);
    set({ timer });
  },

  finish: () => {
    const current = get().timer;
    if (!current) {
      return null;
    }
    const session = finishSession(current, Date.now());
    clearActiveTimer();
    set({ timer: null });
    return session;
  },
}));
