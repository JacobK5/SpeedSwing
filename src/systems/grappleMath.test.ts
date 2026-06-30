import { describe, it, expect } from 'vitest';
import { findAttachTarget, computeRopeLength, clamp, resolveImpactPoint, isRopeTaut } from './grappleMath';

describe('findAttachTarget', () => {
  const player = { x: 0, y: 0 };
  const nodes = [
    { x: 100, y: 0, id: 'near' },
    { x: 120, y: 0, id: 'near2' },
    { x: 800, y: 0, id: 'far' },
  ];

  it('targets the node nearest the cursor among those within reach', () => {
    const node = findAttachTarget(nodes, { x: 118, y: 0 }, player, 1000);
    expect(node?.id).toBe('near2');
  });

  it('does not gate on cursor distance (aiming roughly still grabs the closest in-reach node)', () => {
    // Cursor far to the right; with all three nodes in reach, the one closest to
    // the cursor ('far') is selected — there is no cursor forgiveness radius.
    const node = findAttachTarget(nodes, { x: 5000, y: 0 }, player, 1000);
    expect(node?.id).toBe('far');
  });

  it('ignores a node out of the player reach even when the cursor sits on it', () => {
    // Cursor on the far node (800 from player) but reach is 300; pick in-reach.
    const node = findAttachTarget(nodes, { x: 800, y: 0 }, player, 300);
    expect(node?.id).toBe('near2');
  });

  it('returns null when every node is out of reach', () => {
    expect(findAttachTarget(nodes, { x: 0, y: 0 }, player, 50)).toBeNull();
  });

  it('returns null for an empty node list', () => {
    expect(findAttachTarget([], { x: 0, y: 0 }, player, 1000)).toBeNull();
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

describe('isRopeTaut', () => {
  it('is always taut when the rope cannot go limp (rigid rod)', () => {
    expect(isRopeTaut(50, 300, false)).toBe(true); // slack distance, still taut
    expect(isRopeTaut(300, 300, false)).toBe(true);
    expect(isRopeTaut(400, 300, false)).toBe(true);
  });

  it('is limp (not taut) when there is slack', () => {
    expect(isRopeTaut(50, 300, true)).toBe(false);
    expect(isRopeTaut(299.9, 300, true)).toBe(false);
  });

  it('is taut at or beyond the rope length when it can go limp', () => {
    expect(isRopeTaut(300, 300, true)).toBe(true); // exactly taut
    expect(isRopeTaut(450, 300, true)).toBe(true); // stretched
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
