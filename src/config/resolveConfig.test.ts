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

describe('resolveConfig range validation', () => {
  it('clamps negative rope minLength to 0 and warns about the exact field', () => {
    const { config, warnings } = resolveConfig({ grapple: { minLength: -50 } });
    expect(config.grapple.minLength).toBe(0);
    expect(warnings.some((w) => w.includes('grapple.minLength'))).toBe(true);
  });

  it('clamps stiffness above 1 down to 1', () => {
    const { config, warnings } = resolveConfig({ grapple: { stiffness: 2 } });
    expect(config.grapple.stiffness).toBe(1);
    expect(warnings.some((w) => w.includes('grapple.stiffness'))).toBe(true);
  });

  it('clamps damping below 0 up to 0', () => {
    const { config } = resolveConfig({ grapple: { damping: -0.5 } });
    expect(config.grapple.damping).toBe(0);
  });

  it('clamps a negative run speed to 0', () => {
    const { config } = resolveConfig({ movement: { maxRunSpeed: -3 } });
    expect(config.movement.maxRunSpeed).toBe(0);
  });

  it('clamps camera zoom of 0 up to the minimum', () => {
    const { config, warnings } = resolveConfig({ camera: { zoom: 0 } });
    expect(config.camera.zoom).toBeGreaterThan(0);
    expect(warnings.some((w) => w.includes('camera.zoom'))).toBe(true);
  });

  it('clamps a negative gravity scale to 0', () => {
    const { config } = resolveConfig({ physics: { gravityScale: -1 } });
    expect(config.physics.gravityScale).toBe(0);
  });

  it('fixes minLength > maxLength by clamping minLength to maxLength', () => {
    const { config, warnings } = resolveConfig({ grapple: { minLength: 500, maxLength: 200 } });
    expect(config.grapple.minLength).toBe(200);
    expect(config.grapple.maxLength).toBe(200);
    expect(warnings.some((w) => w.includes('minLength') && w.includes('maxLength'))).toBe(true);
  });

  it('leaves in-range defaults untouched with no warnings', () => {
    const { warnings } = resolveConfig({});
    expect(warnings).toHaveLength(0);
  });
});
