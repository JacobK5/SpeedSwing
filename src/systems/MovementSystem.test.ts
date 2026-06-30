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
    wasGrounded: false,
    bunnyHopTimer: 0,
    landingPenaltyPending: false,
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

  it('does not clamp downward velocity while grappling (preserves swing energy)', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 50); // above maxFallSpeed (20)
    // isGrounded = false, isGrappling = true
    sys.update(player, makeInput({}), config(), STEP_MS, false, true);
    expect(player.velocity.y).toBe(50);
  });
});

describe('MovementSystem bunny hop', () => {
  it('preserves horizontal momentum when jumping in the window above min speed', () => {
    const sys = new MovementSystem();
    const player = makePlayer(8, 0); // above bunnyHopMinSpeed (3.5) and maxRunSpeed
    // Landing frame (wasGrounded=false -> grounded) with a buffered jump + right held.
    const t = sys.update(player, makeInput({ right: true }, { jump: true }), config(), STEP_MS, true);
    expect(t.performedBunnyHop).toBe(true);
    expect(t.performedJump).toBe(true);
    expect(player.velocity.x).toBe(8); // multiplier 1.0 -> pure preservation
    expect(player.velocity.y).toBe(-11); // normal jump impulse
  });

  it('applies the momentum multiplier on a successful bunny hop', () => {
    const sys = new MovementSystem();
    const player = makePlayer(8, 0);
    const t = sys.update(
      player,
      makeInput({ right: true }, { jump: true }),
      config({ bunnyHopMomentumMultiplier: 1.2 }),
      STEP_MS,
      true,
    );
    expect(t.performedBunnyHop).toBe(true);
    expect(player.velocity.x).toBeCloseTo(8 * 1.2, 5);
  });

  it('does not bunny hop below the minimum speed (still a normal jump)', () => {
    const sys = new MovementSystem();
    const player = makePlayer(2, 0); // below bunnyHopMinSpeed (3.5)
    const t = sys.update(player, makeInput({}, { jump: true }), config(), STEP_MS, true);
    expect(t.performedJump).toBe(true);
    expect(t.performedBunnyHop).toBe(false);
    expect(player.velocity.y).toBe(-11);
  });

  it('never grants a mid-air jump from the bunny-hop window (no double jump)', () => {
    const sys = new MovementSystem();
    const player = makePlayer(8, 0);
    // Frame 1: land and bunny hop.
    sys.update(player, makeInput({ right: true }, { jump: true }), config(), STEP_MS, true);
    expect(player.velocity.y).toBe(-11);
    // Frame 2: now airborne, press jump again -> must NOT jump.
    const t = sys.update(player, makeInput({ right: true }, { jump: true }), config(), STEP_MS, false);
    expect(t.performedJump).toBe(false);
  });
});

describe('MovementSystem landing momentum', () => {
  it('applies the landing penalty exactly once when the window lapses grounded', () => {
    const sys = new MovementSystem();
    const player = makePlayer(8, 0);
    // Disable friction so the penalty multiplier is the only horizontal change.
    const cfg = config({ groundFriction: 0 });

    let penaltyFrames = 0;
    let penaltyFrameSpeed = 0;
    for (let i = 0; i < 30; i++) {
      const t = sys.update(player, makeInput({}), cfg, STEP_MS, true);
      if (t.landingPenaltyApplied) {
        penaltyFrames++;
        penaltyFrameSpeed = player.velocity.x;
      }
    }
    expect(penaltyFrames).toBe(1);
    expect(penaltyFrameSpeed).toBeCloseTo(8 * 0.9, 5); // landingMomentumPreservation
    expect(player.velocity.x).toBeCloseTo(8 * 0.9, 5); // and it stays there
  });

  it('does not penalise speed when walking off a ledge before the window ends', () => {
    const sys = new MovementSystem();
    const player = makePlayer(8, 0);
    const cfg = config({ groundFriction: 0, airDrag: 0 });
    // Frame 1: land (opens window).
    sys.update(player, makeInput({}), cfg, STEP_MS, true);
    // Frames 2+: airborne (walked off) -> no penalty ever.
    let anyPenalty = false;
    for (let i = 0; i < 20; i++) {
      const t = sys.update(player, makeInput({}), cfg, STEP_MS, false);
      anyPenalty = anyPenalty || t.landingPenaltyApplied;
    }
    expect(anyPenalty).toBe(false);
    expect(player.velocity.x).toBe(8);
  });
});

describe('MovementSystem swing control', () => {
  it('scales air acceleration by swingControlMultiplier while grappling', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 0);
    sys.update(player, makeInput({ left: true }), config({ swingControlMultiplier: 2 }), STEP_MS, false, true);
    // airAcceleration (25) * multiplier (2) * dt
    expect(player.velocity.x).toBeCloseTo(-50 * STEP_S, 3);
  });

  it('does not scale air acceleration when not grappling', () => {
    const sys = new MovementSystem();
    const player = makePlayer(0, 0);
    sys.update(player, makeInput({ left: true }), config({ swingControlMultiplier: 2 }), STEP_MS, false, false);
    expect(player.velocity.x).toBeCloseTo(-25 * STEP_S, 3); // unscaled
  });
});
