import { describe, it, expect } from 'vitest';
import { formatTime, formatDelta } from './timeFormat';

describe('formatTime', () => {
  it('formats sub-minute times as SS.mmm', () => {
    expect(formatTime(7482)).toBe('7.482');
    expect(formatTime(0)).toBe('0.000');
    expect(formatTime(999)).toBe('0.999');
  });

  it('pads milliseconds to three digits', () => {
    expect(formatTime(7050)).toBe('7.050');
    expect(formatTime(7005)).toBe('7.005');
  });

  it('formats minute-plus times as M:SS.mmm with zero-padded seconds', () => {
    expect(formatTime(67482)).toBe('1:07.482');
    expect(formatTime(60000)).toBe('1:00.000');
    expect(formatTime(623456)).toBe('10:23.456');
  });

  it('floors sub-millisecond precision', () => {
    expect(formatTime(7482.9)).toBe('7.482');
  });

  it('treats negative or non-finite input as zero', () => {
    expect(formatTime(-100)).toBe('0.000');
    expect(formatTime(Number.NaN)).toBe('0.000');
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('0.000');
  });
});

describe('formatDelta', () => {
  it('shows an improvement as a negative delta', () => {
    expect(formatDelta(-512)).toBe('-0.512');
  });

  it('shows a regression as a positive delta', () => {
    expect(formatDelta(1204)).toBe('+1.204');
  });

  it('treats an exact tie as non-positive', () => {
    expect(formatDelta(0)).toBe('-0.000');
  });
});
