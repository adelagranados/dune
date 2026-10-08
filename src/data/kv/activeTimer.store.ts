import { createMMKV } from 'react-native-mmkv';

import type { ActiveTimer } from '@/domain/timer/timerEngine';

const storage = createMMKV({ id: 'dune.timer' });

const ACTIVE_TIMER_KEY = 'activeTimer';
const LAST_TARGET_KEY = 'lastTargetDurationMs';

export function readActiveTimer(): ActiveTimer | null {
  const raw = storage.getString(ACTIVE_TIMER_KEY);
  return raw ? (JSON.parse(raw) as ActiveTimer) : null;
}

export function writeActiveTimer(timer: ActiveTimer): void {
  storage.set(ACTIVE_TIMER_KEY, JSON.stringify(timer));
}

export function clearActiveTimer(): void {
  storage.remove(ACTIVE_TIMER_KEY);
}

/** Remembered so the next session preselects the length you usually pick. 0 means "No limit". */
export function readLastTargetDurationMs(): number | null {
  const stored = storage.getNumber(LAST_TARGET_KEY);
  if (stored === undefined) {
    return null;
  }
  return stored === 0 ? null : stored;
}

export function writeLastTargetDurationMs(targetDurationMs: number | null): void {
  storage.set(LAST_TARGET_KEY, targetDurationMs ?? 0);
}
