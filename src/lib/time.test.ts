import { describe, expect, it } from 'vitest';

import { formatDuration, formatSessionDuration, formatTimerClock } from './time';

const SECOND = 1_000;
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

describe('formatDuration', () => {
  it('shows minutes only under an hour', () => {
    expect(formatDuration(0)).toBe('0m');
    expect(formatDuration(45 * MINUTE)).toBe('45m');
  });

  it('shows hours and minutes together', () => {
    expect(formatDuration(HOUR + 24 * MINUTE)).toBe('1h 24m');
    expect(formatDuration(8 * HOUR + 42 * MINUTE)).toBe('8h 42m');
  });

  it('drops the minutes on a whole number of hours', () => {
    expect(formatDuration(15 * HOUR)).toBe('15h');
  });

  it('floors partial minutes rather than rounding up', () => {
    expect(formatDuration(59_999)).toBe('0m');
    expect(formatDuration(HOUR - 1)).toBe('59m');
  });
});

describe('formatTimerClock', () => {
  it('always pads to hours, minutes and seconds', () => {
    expect(formatTimerClock(0)).toBe('00:00:00');
    expect(formatTimerClock(7 * SECOND)).toBe('00:00:07');
    expect(formatTimerClock(HOUR + 24 * MINUTE + 17 * SECOND)).toBe('01:24:17');
  });

  it('keeps counting past 24 hours instead of wrapping', () => {
    expect(formatTimerClock(26 * HOUR)).toBe('26:00:00');
  });

  it('never renders a negative clock', () => {
    expect(formatTimerClock(-5_000)).toBe('00:00:00');
  });
});

describe('formatSessionDuration', () => {
  it('shows seconds for a session shorter than a minute', () => {
    // formatDuration would call this 0m, next to a total that moved.
    expect(formatSessionDuration(45 * SECOND)).toBe('45s');
    expect(formatSessionDuration(1)).toBe('0s');
    expect(formatSessionDuration(59_999)).toBe('59s');
  });

  it('pairs minutes with seconds below an hour', () => {
    expect(formatSessionDuration(2 * MINUTE + 30 * SECOND)).toBe('2m 30s');
    expect(formatSessionDuration(MINUTE + 3 * SECOND)).toBe('1m 3s');
  });

  it('drops seconds when there are none to show', () => {
    expect(formatSessionDuration(2 * MINUTE)).toBe('2m');
    expect(formatSessionDuration(HOUR)).toBe('1h');
  });

  it('drops seconds past an hour, where they are noise', () => {
    expect(formatSessionDuration(HOUR + 24 * MINUTE + 17 * SECOND)).toBe('1h 24m');
  });

  it('never goes negative', () => {
    expect(formatSessionDuration(-5000)).toBe('0s');
  });
});
