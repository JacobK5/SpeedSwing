import { describe, it, expect } from 'vitest';
import { validateLevel } from './validateLevel';
import testLevel from './test-level.json';

const SURFACES = ['standard', 'no-node', 'destructible', 'killzone'] as const;

/** Deep clone the test level as a mutable record so tests can corrupt fields. */
function cloneLevel(): Record<string, unknown> {
  return JSON.parse(JSON.stringify(testLevel));
}

describe('validateLevel', () => {
  it('accepts the bundled test level', () => {
    const result = validateLevel(testLevel, SURFACES);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('rejects a missing goal', () => {
    const level = cloneLevel();
    delete level.goal;
    const result = validateLevel(level, SURFACES);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('goal'))).toBe(true);
  });

  it('rejects a missing spawn', () => {
    const level = cloneLevel();
    delete level.spawn;
    const result = validateLevel(level, SURFACES);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('spawn'))).toBe(true);
  });

  it('rejects a non-positive goal radius', () => {
    const level = cloneLevel();
    level.goal = { x: 10, y: 10, radius: 0 };
    const result = validateLevel(level, SURFACES);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('radius'))).toBe(true);
  });

  it('rejects an unknown surface type', () => {
    const level = cloneLevel();
    level.geometry = [{ x: 0, y: 0, width: 10, height: 10, surface: 'lava' }];
    const result = validateLevel(level, SURFACES);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('lava'))).toBe(true);
  });

  it('rejects malformed geometry (non-positive width)', () => {
    const level = cloneLevel();
    level.geometry = [{ x: 0, y: 0, width: -5, height: 10, surface: 'standard' }];
    const result = validateLevel(level, SURFACES);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('width'))).toBe(true);
  });

  it('rejects an empty geometry array', () => {
    const level = cloneLevel();
    level.geometry = [];
    const result = validateLevel(level, SURFACES);
    expect(result.valid).toBe(false);
  });

  it('rejects non-object input', () => {
    expect(validateLevel(null, SURFACES).valid).toBe(false);
    expect(validateLevel('nope', SURFACES).valid).toBe(false);
  });
});
