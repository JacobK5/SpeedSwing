import { describe, it, expect } from 'vitest';
import { rectsOverlap, rectOverlapsCircle, pointInCircle } from './regionChecks';

describe('rectsOverlap', () => {
  const base = { x: 0, y: 0, width: 10, height: 10 };

  it('detects overlapping rectangles', () => {
    expect(rectsOverlap(base, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
  });

  it('detects fully separate rectangles as not overlapping', () => {
    expect(rectsOverlap(base, { x: 20, y: 20, width: 5, height: 5 })).toBe(false);
  });

  it('counts edge contact as overlap', () => {
    expect(rectsOverlap(base, { x: 10, y: 0, width: 5, height: 10 })).toBe(true);
  });

  it('separates along a single axis', () => {
    // Overlaps in X but fully below in Y.
    expect(rectsOverlap(base, { x: 0, y: 11, width: 10, height: 5 })).toBe(false);
  });
});

describe('rectOverlapsCircle', () => {
  const rect = { x: 0, y: 0, width: 10, height: 10 };

  it('detects a circle centre inside the rect', () => {
    expect(rectOverlapsCircle(rect, { x: 5, y: 5, radius: 1 })).toBe(true);
  });

  it('detects a circle touching an edge', () => {
    expect(rectOverlapsCircle(rect, { x: 13, y: 5, radius: 3 })).toBe(true);
  });

  it('rejects a circle just out of reach of the nearest corner', () => {
    // Corner at (10,10); circle centre at (13,13) is dist ~4.24 > radius 3.
    expect(rectOverlapsCircle(rect, { x: 13, y: 13, radius: 3 })).toBe(false);
  });
});

describe('pointInCircle', () => {
  const circle = { x: 0, y: 0, radius: 5 };

  it('includes points within the radius', () => {
    expect(pointInCircle(3, 4, circle)).toBe(true); // exactly on the edge
    expect(pointInCircle(0, 0, circle)).toBe(true);
  });

  it('excludes points outside the radius', () => {
    expect(pointInCircle(4, 4, circle)).toBe(false);
  });
});
