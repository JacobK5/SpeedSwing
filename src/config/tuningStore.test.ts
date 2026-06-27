import { describe, it, expect } from 'vitest';
import { serializeConfig, deserializeConfig, applyConfigInto } from './tuningStore';
import { resolveConfig } from './resolveConfig';
import { DEFAULT_MOVEMENT } from './defaults';

function defaultsConfig() {
  return resolveConfig({}).config;
}

describe('tuningStore', () => {
  it('round-trips a config through serialize/deserialize', () => {
    const config = defaultsConfig();
    config.movement.maxRunSpeed = 9;
    config.debug.startEnabled = true;

    const restored = deserializeConfig(serializeConfig(config));

    expect(restored.movement.maxRunSpeed).toBe(9);
    expect(restored.debug.startEnabled).toBe(true);
    expect(restored.physics.gravityY).toBe(config.physics.gravityY);
  });

  it('falls back to defaults on invalid JSON', () => {
    const restored = deserializeConfig('not json {');
    expect(restored.movement).toEqual(DEFAULT_MOVEMENT);
  });

  it('clamps out-of-range stored values on load', () => {
    const restored = deserializeConfig(JSON.stringify({ grapple: { stiffness: 5 } }));
    expect(restored.grapple.stiffness).toBe(1);
  });

  it('applyConfigInto mutates the target in place, preserving object identity', () => {
    const target = defaultsConfig();
    const movementRef = target.movement;
    const source = defaultsConfig();
    source.movement.jumpVelocity = 20;
    source.physics.gravityY = 2;

    applyConfigInto(target, source);

    expect(target.movement.jumpVelocity).toBe(20);
    expect(target.physics.gravityY).toBe(2);
    expect(target.movement).toBe(movementRef); // same reference, updated fields
  });
});
