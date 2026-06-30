import { describe, it, expect } from 'vitest';
import { loadLevel, listLevels, isKnownLevel, LEVEL_ORDER } from './loadLevel';
import { validateLevel } from './validateLevel';
import { resolveConfig } from '../config/resolveConfig';

// Guards that every level shipped in the registry actually validates against the
// configured surface table — catches JSON authoring mistakes (bad surface names,
// missing goal/spawn, malformed geometry) at test time instead of at runtime.

const config = resolveConfig({}).config;
const knownSurfaces = Object.keys(config.surfaces);

describe('level registry', () => {
  it('lists levels in the declared order with names', () => {
    const summaries = listLevels();
    expect(summaries.map((s) => s.id)).toEqual([...LEVEL_ORDER]);
    for (const summary of summaries) {
      expect(summary.name.length).toBeGreaterThan(0);
    }
  });

  it('recognises known and unknown level ids', () => {
    expect(isKnownLevel('benchmark-01')).toBe(true);
    expect(isKnownLevel('does-not-exist')).toBe(false);
  });

  it('throws a clear error for an unknown level', () => {
    expect(() => loadLevel('nope', config)).toThrow(/Unknown level/);
  });

  it.each(LEVEL_ORDER)('validates and loads level "%s"', (id) => {
    const level = loadLevel(id, config);
    const result = validateLevel(level, knownSurfaces);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
    // Exactly one spawn and goal are implied by the schema; sanity-check goal.
    expect(level.goal.radius).toBeGreaterThan(0);
    expect(level.geometry.length).toBeGreaterThan(0);
  });

  it('benchmark-01 declares both ammo resources for the prototype loop', () => {
    const level = loadLevel('benchmark-01', config);
    expect(level.resources?.grappleNodes).toBeGreaterThan(0);
    expect(level.resources?.explosives).toBeGreaterThan(0);
  });
});
