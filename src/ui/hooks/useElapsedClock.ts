import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  computeActiveElapsedMs,
  computeMsUntilNextSecond,
  type ActiveTimer,
} from '@/domain/timer/timerEngine';

type Sample = {
  /** The timer this reading was taken against. */
  timer: ActiveTimer | null;
  now: number;
};

/**
 * Picks the timer the elapsed time should be read from.
 *
 * A reference time only means anything for the timer it was captured against,
 * and the two come apart constantly: pausing and resuming each replace the
 * timer, which cancels the repaint this hook had pending, so nothing refreshes
 * the reading until a new tick lands. Every resume meanwhile folds its pause
 * into `accumulatedPausedMs` — and subtracting that larger total from a
 * reading taken before it left the clock short by exactly how long the pause
 * had lasted. Twelve seconds paused showed as twelve seconds lost.
 *
 * Rather than scramble to refresh the reading, this leans on the engine:
 * elapsed time is continuous across a pause and a resume, and a paused timer
 * reports its frozen value without consulting the reference at all. So a
 * paused timer always answers for itself, and a running one whose reading
 * predates it defers to the paused timer that reading *was* taken against,
 * which still reports the value the clock resumed from.
 */
function referenceTimer(timer: ActiveTimer | null, sample: Sample): ActiveTimer | null {
  if (timer === null || timer.pausedAt !== null) {
    return timer;
  }
  return sample.timer === timer ? timer : (sample.timer ?? timer);
}

/**
 * A session's active elapsed time, repainted once per displayed second.
 *
 * Nothing here accumulates time — the value is still only ever derived from
 * the stored timestamps. What this owns is the reference those timestamps are
 * read against, and when to repaint.
 *
 * Both the timer screen and the mini bar read this. Keeping one copy is the
 * point: the bar had gone on keying its interval to whether the session was
 * running long after the timer screen was fixed for exactly that.
 */
export function useElapsedClock(timer: ActiveTimer | null): number {
  const [sample, setSample] = useState<Sample>(() => ({ timer, now: Date.now() }));

  useEffect(() => {
    // A frozen clock has nothing to repaint — it reads `pausedAt`, not the
    // reference — and resuming re-runs this.
    if (timer === null || timer.pausedAt !== null) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = Date.now();
      setSample({ timer, now });
      // Onto the boundary the elapsed time actually turns over on, not a flat
      // second from whatever phase this happened to start on. Every resume
      // moves that boundary, and repainting off it let a digit linger for
      // about two seconds, or skip one.
      timeout = setTimeout(tick, computeMsUntilNextSecond(timer, now) ?? 1000);
    };

    // Straight away, so the reading catches up with this timer in the frame
    // after it appears rather than up to a second later.
    timeout = setTimeout(tick, 0);

    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active') {
        return;
      }
      // JS timers are throttled in the background, so the pending one can be
      // long overdue by the time the app comes back.
      clearTimeout(timeout);
      tick();
    });

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, [timer]);

  const reference = referenceTimer(timer, sample);
  return reference ? computeActiveElapsedMs(reference, sample.now) : 0;
}
