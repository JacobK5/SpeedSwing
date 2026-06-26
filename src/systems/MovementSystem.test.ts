import { describe, it, expect } from 'vitest';
import { MovementSystem, type MovementControls, type MovementTarget } from './MovementSystem';
import { resolveConfig } from '../config/resolveConfig';
import type { GameConfig } from '../config/types';
import type { InputAction } from '../core/InputManager';

// MovementSystem is intentionally decoupled from Phaser, so it can be exercised
// with plain fakes. These tests validate the movement *logic* (acceleration,
// momentum preservation, friction, jump/coyote/buffer, terminal velocity).
// Movement *feel* is validated by human playtesting (docs/08-dev-workflow.md).

const STEP_MS = 16.7; // ~one 60fps frame
const STEP_S = STEP_MS / 1000;

function config(movement: Record<string, number> = {}): GameConfig {
  return resolveConfig({ movement }).config;
}

function makePlayer(vx = 0, vy = 0): MovementTarget {
  let velocity = { x: vx, y: vy };
  return {
    get velocity() {
      return velocity;
    },
    isGrounded: false,
    facing: 1,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    setVelocity(x: number, y: number) {
      velocity = { x, y };
    },
  };
}

function makeInput(down: Partial<Record<InputAction, boolean>>, pressed: Partial<Record<InputAction, boolean>> = {}): MovementControls {
  return {
    isDown: (a) => down[a] === true,
    justPressed: (a) => pressed[a] === true,
  };
}

describe('MovementSystem horizontal movement', () => {
  it('accelerates toward maxRunSpeed from rest on the ground', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 0);
    sys.update(player, makeInput({ right: true }), config(), STEP_MS, true);

    // groundAcceleration (45) * dt, capped below maxRunSpeed.
    expect(player.velocity.x).toBeCloseTo(45 * STEP_S, 3);
    expect(player.facing).toBe(1);
  });

  it('never exceeds maxRunSpeed when accelerating under input', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 0);
    for (let i = 0; i < 60; i++) {
      sys.update(player, makeInput({ right: true }), config(), STEP_MS, true);
    }
    expect(player.velocity.x).toBeCloseTo(6.5, 5);
  });

  it('preserves momentum above maxRunSpeed (does not brake while holding the same direction)', () => {
    const sys = new MovementSystem();
    const player = makePlayer(10, 0); // faster than max from, e.g., a swing
    sys.update(player, makeInput({ right: true }), config(), STEP_MS, true);
    expect(player.velocity.x).toBe(10);
  });

  it('applies ground friction when no horizontal input is held', () => {
    const sys = new MovementSystem();
    const player = makePlayer(5, 0);
    sys.update(player, makeInput({}), config(), STEP_MS, true);
    // groundFriction (50) * dt of deceleration.
    expect(player.velocity.x).toBeCloseTo(5 - 50 * STEP_S, 3);
  });

  it('preserves air momentum with no input when airDrag is zero (default)', () => {
    const sys = new MovementSystem();
    const player = makePlayer(5, 0);
    sys.update(player, makeInput({}), config(), STEP_MS, false);
    expect(player.velocity.x).toBe(5);
  });

  it('uses air acceleration (weaker) while airborne', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 0);
    sys.update(player, makeInput({ left: true }), config(), STEP_MS, false);
    expect(player.velocity.x).toBeCloseTo(-25 * STEP_S, 3); // airAcceleration 25
    expect(player.facing).toBe(-1);
  });
});

describe('MovementSystem jumping', () => {
  it('jumps when grounded and jump was just pressed', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 0);
    sys.update(player, makeInput({}, { jump: true }), config(), STEP_MS, true);
    expect(player.velocity.y).toBe(-11); // jumpVelocity
    expect(player.jumpBufferTimer).toBe(0);
    expect(player.coyoteTimer).toBe(0);
  });

  it('allows a jump within the coyote window after leaving the ground', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 0);
    // Frame 1: grounded, no jump -> arms coyote timer.
    sys.update(player, makeInput({}), config(), STEP_MS, true);
    expect(player.coyoteTimer).toBeGreaterThan(0);
    // Frame 2: airborne, jump pressed -> still allowed via coyote time.
    sys.update(player, makeInput({}, { jump: true }), config(), STEP_MS, false);
    expect(player.velocity.y).toBe(-11);
  });

  it('does not jump in mid-air with no coyote time or buffered press', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 3);
    sys.update(player, makeInput({}, { jump: true }), config(), STEP_MS, false);
    expect(player.velocity.y).toBe(3); // unchanged (still < maxFallSpeed)
  });

  it('buffers a jump pressed just before landing', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 4);
    // Frame 1: airborne, jump pressed -> buffered (no coyote yet, no jump).
    sys.update(player, makeInput({}, { jump: true }), config(), STEP_MS, false);
    expect(player.velocity.y).toBe(4);
    // Frame 2: lands, no new press -> buffered jump fires.
    sys.update(player, makeInput({}), config(), STEP_MS, true);
    expect(player.velocity.y).toBe(-11);
  });
});

describe('MovementSystem terminal velocity', () => {
  it('clamps downward velocity to maxFallSpeed', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 50); // far above maxFallSpeed (20)
    sys.update(player, makeInput({}), config(), STEP_MS, false);
    expect(player.velocity.y).toBe(20);
  });

  it('respects a configured maxFallSpeed override', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 50);
    sys.update(player, makeInput({}), config({ maxFallSpeed: 12 }), STEP_MS, false);
    expect(player.velocity.y).toBe(12);
  });
});
