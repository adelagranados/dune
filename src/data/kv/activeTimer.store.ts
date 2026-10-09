import { readValue, removeValue, writeValue } from '@/data/kv/kvStore';
import type { ActiveTimer } from '@/domain/timer/timerEngine';

const ACTIVE_TIMER_KEY = 'timer.active';
const LAST_TARGET_KEY = 'timer.lastTargetDurationMs';
const TARGET_NOTIFICATION_ID_KEY = 'timer.targetNotificationId';

export function readActiveTimer(): ActiveTimer | null {
  const raw = readValue(ACTIVE_TIMER_KEY);
  return raw ? (JSON.parse(raw) as ActiveTimer) : null;
}

export function writeActiveTimer(timer: ActiveTimer): void {
  writeValue(ACTIVE_TIMER_KEY, JSON.stringify(timer));
}

export function clearActiveTimer(): void {
  removeValue(ACTIVE_TIMER_KEY);
}

/** Remembered so the next session preselects the length you usually pick. 0 means "No limit". */
export function readLastTargetDurationMs(): number | null {
  const stored = readValue(LAST_TARGET_KEY);
  if (stored === null) {
    return null;
  }
  const parsed = Number(stored);
  if (!Number.isFinite(parsed) || parsed === 0) {
    return null;
  }
  return parsed;
}

export function writeLastTargetDurationMs(targetDurationMs: number | null): void {
  writeValue(LAST_TARGET_KEY, String(targetDurationMs ?? 0));
}

/**
 * Kept next to the timer but deliberately out of `ActiveTimer`: the id belongs
 * to the OS scheduler, not to the session, and the domain type stays free of
 * platform concerns. It survives a relaunch so a pending notification can still
 * be cancelled after the process was killed.
 */
export function readTargetNotificationId(): string | null {
  return readValue(TARGET_NOTIFICATION_ID_KEY);
}

export function writeTargetNotificationId(id: string | null): void {
  if (id === null) {
    removeValue(TARGET_NOTIFICATION_ID_KEY);
    return;
  }
  writeValue(TARGET_NOTIFICATION_ID_KEY, id);
}
