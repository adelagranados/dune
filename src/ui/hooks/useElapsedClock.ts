import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  computeElapsedMsForDisplay,
  computeMsUntilNextSecond,
  type ActiveTimer,
  type ElapsedReading,
} from '@/domain/timer/timerEngine';

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
  const [reading, setReading] = useState<ElapsedReading>(() => ({ timer, now: Date.now() }));

  useEffect(() => {
    if (timer === null) {
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = Date.now();
      setReading({ timer, now });
      const untilNextSecond = computeMsUntilNextSecond(timer, now);
      if (untilNextSecond === null) {
        // Paused. The reading has been recorded, which is all a pause needs:
        // the digits are frozen, so there is nothing left to repaint until a
        // resume brings us back here.
        return;
      }
      // Onto the boundary the elapsed time actually turns over on, not a flat
      // second from whatever phase this happened to start on. Every resume
      // moves that boundary, and repainting off it let a digit linger for
      // about two seconds, or skip one.
      timeout = setTimeout(tick, untilNextSecond);
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

  return computeElapsedMsForDisplay(timer, reading);
}
