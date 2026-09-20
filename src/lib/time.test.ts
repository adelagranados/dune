import { describe, expect, it } from 'vitest';

import { formatDuration } from './time';

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
