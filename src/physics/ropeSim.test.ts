import { describe, it, expect } from 'vitest';
import { seedRope, stepRope, type RopeSimParams } from './ropeSim';

const PARAMS: RopeSimParams = { gravity: 0.5, damping: 0.98, iterations: 20 };

describe('seedRope', () => {
  it('places points evenly on the straight line between anchor and player', () => {
    const points = seedRope({ x: 0, y: 0 }, { x: 100, y: 0 }, 5);
    expect(points).toHaveLength(5);
    expect(points[0]).toMatchObject({ x: 0, y: 0 });
    expect(points[4]).toMatchObject({ x: 100, y: 0 });
    expect(points[2].x).toBeCloseTo(50, 5);
    expect(points[2].y).toBeCloseTo(0, 5);
  });

  it('seeds zero velocity (prev == current)', () => {
    const points = seedRope({ x: 10, y: 20 }, { x: 30, y: 60 }, 4);
    for (const p of points) {
      expect(p.prevX).toBe(p.x);
      expect(p.prevY).toBe(p.y);
    }
  });
});

describe('stepRope', () => {
  const anchor = { x: 0, y: 0 };
  const player = { x: 100, y: 0 };

  it('keeps the endpoints pinned to the anchor and player', () => {
    const points = seedRope(anchor, player, 10);
    for (let i = 0; i < 30; i++) {
      stepRope(points, anchor, player, 200, 0, 1, PARAMS);
    }
    expect(points[0].x).toBeCloseTo(0, 5);
    expect(points[0].y).toBeCloseTo(0, 5);
    expect(points[9].x).toBeCloseTo(100, 5);
    expect(points[9].y).toBeCloseTo(0, 5);
  });

  it('sags downward under gravity when the rope has slack', () => {
    const points = seedRope(anchor, player, 11);
    // Rope length 200 over a 100px chord: lots of slack to droop.
    for (let i = 0; i < 60; i++) {
      stepRope(points, anchor, player, 200, 0, 1, PARAMS);
    }
    expect(points[5].y).toBeGreaterThan(20); // down is +y
  });

  it('sags along the gravity direction (up when gravity is inverted)', () => {
    const points = seedRope(anchor, player, 11);
    for (let i = 0; i < 60; i++) {
      stepRope(points, anchor, player, 200, 0, -1, PARAMS);
    }
    expect(points[5].y).toBeLessThan(-20);
  });

  it('pulls straight when taut (player at/beyond rope length, so the rope is stretched)', () => {
    const points = seedRope(anchor, player, 11);
    // Rope length 80 under an 80<100 chord: stretched, so tension beats gravity sag.
    for (let i = 0; i < 60; i++) {
      stepRope(points, anchor, player, 80, 0, 1, PARAMS);
    }
    const maxSag = Math.max(...points.map((p) => Math.abs(p.y)));
    expect(maxSag).toBeLessThan(2);
  });

  it('is a no-op for a degenerate chain shorter than two points', () => {
    const points = seedRope(anchor, player, 1);
    expect(() => stepRope(points, anchor, player, 100, 0, 1, PARAMS)).not.toThrow();
  });
});
