import { describe, it, expect } from 'vitest';
import { findNearestNode, computeRopeLength, clamp, resolveImpactPoint } from './grappleMath';

describe('findNearestNode', () => {
  const nodes = [
    { x: 100, y: 0, id: 'a' },
    { x: 120, y: 0, id: 'b' },
    { x: 400, y: 0, id: 'c' },
  ];

  it('returns the node nearest the cursor', () => {
    const node = findNearestNode(nodes, { x: 118, y: 0 });
    expect(node?.id).toBe('b');
  });

  it('targets the nearest node no matter how far the cursor is (no radius gate)', () => {
    // Cursor is far from every node; it still selects the closest one (c).
    const node = findNearestNode(nodes, { x: 5000, y: 0 });
    expect(node?.id).toBe('c');
  });

  it('returns null only for an empty node list', () => {
    expect(findNearestNode([], { x: 0, y: 0 })).toBeNull();
  });
});

describe('computeRopeLength', () => {
  it('retracts toward minLength while W is held', () => {
    const next = computeRopeLength(300, true, false, 220, 260, 0.1, 40, 600);
    expect(next).toBeCloseTo(300 - 220 * 0.1, 5);
  });

  it('extends toward maxLength while S is held', () => {
    const next = computeRopeLength(300, false, true, 220, 260, 0.1, 40, 600);
    expect(next).toBeCloseTo(300 + 260 * 0.1, 5);
  });

  it('clamps retraction at minLength', () => {
    expect(computeRopeLength(50, true, false, 220, 260, 1, 40, 600)).toBe(40);
  });

  it('clamps extension at maxLength', () => {
    expect(computeRopeLength(590, false, true, 220, 260, 1, 40, 600)).toBe(600);
  });

  it('leaves length unchanged with no input', () => {
    expect(computeRopeLength(300, false, false, 220, 260, 0.1, 40, 600)).toBe(300);
  });

  it('nets the difference when both are held', () => {
    const next = computeRopeLength(300, true, true, 200, 260, 0.5, 40, 600);
    expect(next).toBeCloseTo(300 + (260 - 200) * 0.5, 5);
  });
});

describe('clamp', () => {
  it('bounds values to the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('resolveImpactPoint', () => {
  it('uses the collision contact point when provided', () => {
    const point = resolveImpactPoint({ x: 100, y: 100 }, { x: 16, y: 0 }, 6, { x: 110, y: 101 });
    expect(point).toEqual({ x: 110, y: 101 });
  });

  it('projects to the leading edge along travel direction when no contact is given', () => {
    const point = resolveImpactPoint({ x: 100, y: 0 }, { x: 16, y: 0 }, 6, null);
    expect(point.x).toBeCloseTo(106, 5); // centre + radius in the +x travel direction
    expect(point.y).toBeCloseTo(0, 5);
  });

  it('falls back to the centre when velocity is zero', () => {
    const point = resolveImpactPoint({ x: 50, y: 50 }, { x: 0, y: 0 }, 6, null);
    expect(point).toEqual({ x: 50, y: 50 });
  });

  it('ignores a non-finite contact point and uses the leading edge', () => {
    const point = resolveImpactPoint({ x: 0, y: 0 }, { x: 0, y: 10 }, 5, { x: NaN, y: 0 });
    expect(point.x).toBeCloseTo(0, 5);
    expect(point.y).toBeCloseTo(5, 5);
  });
});
