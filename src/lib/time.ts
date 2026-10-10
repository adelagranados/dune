/** Calendar-day comparison in local time, so it survives DST and month boundaries. */
export function isSameDay(a: number, b: number): boolean {
  const first = new Date(a);
  const second = new Date(b);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

/** "01:24:17" — the running clock on the Active Timer, always zero-padded to hours. */
export function formatTimerClock(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** "0m", "45m", "1h 24m", "15h" — the compact duration format used across the app. */
export function formatDuration(durationMs: number): string {
  const totalMinutes = Math.floor(durationMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * "45s", "2m 30s", "1h 24m" — a single recorded session.
 *
 * Separate from `formatDuration` on purpose. Totals round to the minute, which
 * is the right grain for "how long did this take"; a single session does not,
 * because a short one would read as 0m while still counting toward the total,
 * and a row that says nothing happened next to a total that moved is a lie.
 *
 * Seconds are dropped past an hour, where they are noise.
 */
export function formatSessionDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  }
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
}
