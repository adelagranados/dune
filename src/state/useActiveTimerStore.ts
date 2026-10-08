import { create } from 'zustand';

import { clearActiveTimer, readActiveTimer, writeActiveTimer } from '@/data/kv/activeTimer.store';
import { syncTargetNotification } from '@/data/notifications/targetNotifications';
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
 * Rescheduling is intentionally not awaited: the transition is already
 * persisted, and a slow or failing scheduler must never delay the UI or lose a
 * session. The timer is the record; the notification is a courtesy.
 */
function syncNotification(timer: ActiveTimer | null, now: number): void {
  syncTargetNotification(timer, now).catch(() => {
    // Swallowed on purpose — see above.
  });
}

/**
 * Orchestrates the pure timer engine with its persisted copy. The store is
 * seeded straight from storage, so a relaunch picks the session back up with
 * its original startedAt rather than restarting the clock.
 */
export const useActiveTimerStore = create<ActiveTimerState>((set, get) => ({
  timer: readActiveTimer(),

  start: (projectId, targetDurationMs) => {
    const now = Date.now();
    const timer = startSession(projectId, targetDurationMs, now);
    writeActiveTimer(timer);
    set({ timer });
    syncNotification(timer, now);
  },

  pause: () => {
    const current = get().timer;
    if (!current || current.pausedAt !== null) {
      return;
    }
    const now = Date.now();
    const timer = pauseSession(current, now);
    writeActiveTimer(timer);
    set({ timer });
    syncNotification(timer, now);
  },

  resume: () => {
    const current = get().timer;
    if (!current || current.pausedAt === null) {
      return;
    }
    const now = Date.now();
    const timer = resumeSession(current, now);
    writeActiveTimer(timer);
    set({ timer });
    syncNotification(timer, now);
  },

  finish: () => {
    const current = get().timer;
    if (!current) {
      return null;
    }
    const now = Date.now();
    const session = finishSession(current, now);
    clearActiveTimer();
    set({ timer: null });
    syncNotification(null, now);
    return session;
  },
}));
