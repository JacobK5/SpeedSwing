import { describe, it, expect } from 'vitest';
import { resolveConfig } from './resolveConfig';
import { DEFAULT_MOVEMENT, DEFAULT_PHYSICS } from './defaults';

describe('resolveConfig', () => {
  it('returns documented defaults when given empty input', () => {
    const { config, warnings } = resolveConfig({});
    expect(config.movement).toEqual(DEFAULT_MOVEMENT);
    expect(config.physics).toEqual(DEFAULT_PHYSICS);
    expect(warnings).toHaveLength(0);
  });

  it('merges provided values over defaults, leaving others untouched', () => {
    const { config } = resolveConfig({ movement: { maxRunSpeed: 9 } });
    expect(config.movement.maxRunSpeed).toBe(9);
    expect(config.movement.jumpVelocity).toBe(DEFAULT_MOVEMENT.jumpVelocity);
  });

  it('falls back to the default and warns on a type mismatch', () => {
    const { config, warnings } = resolveConfig({ movement: { maxRunSpeed: 'fast' } });
    expect(config.movement.maxRunSpeed).toBe(DEFAULT_MOVEMENT.maxRunSpeed);
    expect(warnings.some((w) => w.includes('movement.maxRunSpeed'))).toBe(true);
  });

  it('falls back to the default and warns on a non-finite number', () => {
    const { config, warnings } = resolveConfig({
      physics: { gravityY: Number.POSITIVE_INFINITY },
    });
    expect(config.physics.gravityY).toBe(DEFAULT_PHYSICS.gravityY);
    expect(warnings.some((w) => w.includes('physics.gravityY'))).toBe(true);
  });

  it('warns about unknown keys', () => {
    const { warnings } = resolveConfig({ camera: { notAReal: 1 } });
    expect(warnings.some((w) => w.includes('unknown key "camera.notAReal"'))).toBe(true);
  });

  it('merges surface field overrides and warns on unknown surface types', () => {
    const { config, warnings } = resolveConfig({
      surfaces: {
        standard: { canPlaceNode: false },
        bogus: { color: '#ffffff' },
      },
    });
    expect(config.surfaces.standard.canPlaceNode).toBe(false);
    expect(config.surfaces.standard.collidable).toBe(true); // untouched field keeps default
    expect(warnings.some((w) => w.includes('unknown surface type "bogus"'))).toBe(true);
  });

  it('treats a non-object category as all-defaults with a warning', () => {
    const { config, warnings } = resolveConfig({ movement: 42 });
    expect(config.movement).toEqual(DEFAULT_MOVEMENT);
    expect(warnings.some((w) => w.includes('"movement" is not an object'))).toBe(true);
  });

  it('resolves boolean debug flags', () => {
    const { config } = resolveConfig({ debug: { startEnabled: true } });
    expect(config.debug.startEnabled).toBe(true);
  });
});
