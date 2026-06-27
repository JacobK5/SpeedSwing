import { describe, it, expect } from 'vitest';
import { terrainCountsAsGround } from './groundCheck';

const TOL = 6;

describe('terrainCountsAsGround', () => {
  it('counts a floor whose top is exactly at the feet', () => {
    expect(terrainCountsAsGround(1500, 1500, TOL)).toBe(true);
  });

  it('counts a floor with slight penetration (feet just below the top)', () => {
    expect(terrainCountsAsGround(1503, 1500, TOL)).toBe(true);
  });

  it('counts a floor a couple pixels below the feet (about to rest)', () => {
    expect(terrainCountsAsGround(1498, 1500, TOL)).toBe(true);
  });

  it('does NOT count a tall wall whose top edge is far above the feet', () => {
    expect(terrainCountsAsGround(1500, 0, TOL)).toBe(false);
  });

  it('does NOT count a wall side whose top is well above the feet', () => {
    expect(terrainCountsAsGround(1500, 1450, TOL)).toBe(false);
  });

  it('counts standing on top of a wall (feet at the wall top)', () => {
    expect(terrainCountsAsGround(300, 300, TOL)).toBe(true);
  });
});
