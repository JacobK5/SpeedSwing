import type { GameConfig } from '../config/types';
import type { InputAction } from '../core/InputManager';

/** Minimal input surface MovementSystem reads (satisfied by InputManager). */
export interface MovementControls {
  isDown(action: InputAction): boolean;
  justPressed(action: InputAction): boolean;
}

/** Minimal player surface MovementSystem mutates (satisfied by Player). */
export interface MovementTarget {
  readonly velocity: { x: number; y: number };
  isGrounded: boolean;
  facing: 1 | -1;
  coyoteTimer: number;
  jumpBufferTimer: number;
  setVelocity(x: number, y: number): void;
}

/** Move `current` toward `target` by at most `maxDelta`. */
function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) {
    return Math.min(current + maxDelta, target);
  }
  if (current > target) {
    return Math.max(current - maxDelta, target);
  }
  return current;
}

/**
 * Drives running, jumping and air control. Every value comes from
 * config.movement — nothing here is hard-coded (AGENTS.md "Configuration First").
 *
 * Momentum is treated as sacred (AGENTS.md): horizontal input accelerates toward
 * the target run speed but never brakes a body already moving faster in the same
 * direction (e.g. after a grapple swing), and there is no air drag by default.
 * Vertical velocity is left to Matter's gravity + the rope constraint, with only
 * a jump impulse and a terminal-fall clamp applied here.
 *
 * The terminal-fall clamp is skipped while grappling: a swing's downward arc can
 * legitimately exceed free-fall terminal velocity, and clamping it would bleed
 * off swing momentum (AGENTS.md "momentum is sacred"; docs/03 swing preservation).
 *
 * Ground/grapple state are supplied by the caller (CollisionSystem / GrappleSystem)
 * which keeps this system free of Phaser/Matter dependencies and trivially testable.
 */
export class MovementSystem {
  update(
    player: MovementTarget,
    input: MovementControls,
    config: GameConfig,
    deltaMs: number,
    isGrounded: boolean,
    isGrappling = false,
  ): void {
    const dt = deltaMs / 1000;
    const m = config.movement;
    const vx = player.velocity.x;
    const vy = player.velocity.y;

    player.isGrounded = isGrounded;

    // --- Horizontal movement ---
    const dir = (input.isDown('left') ? -1 : 0) + (input.isDown('right') ? 1 : 0);
    let newVx = vx;

    if (dir !== 0) {
      player.facing = dir as 1 | -1;
      const accel = isGrounded ? m.groundAcceleration : m.airAcceleration;
      const movingFasterThanMax = Math.sign(vx) === dir && Math.abs(vx) > m.maxRunSpeed;
      // Preserve hard-won momentum: only accelerate up to maxRunSpeed; never
      // actively slow a body already exceeding it in the input direction.
      newVx = movingFasterThanMax ? vx : approach(vx, dir * m.maxRunSpeed, accel * dt);
    } else {
      const decel = isGrounded ? m.groundFriction : m.airDrag;
      newVx = approach(vx, 0, decel * dt);
    }

    // --- Jump with coyote time + input buffering ---
    player.coyoteTimer = isGrounded ? m.coyoteTime : Math.max(0, player.coyoteTimer - dt);
    player.jumpBufferTimer = input.justPressed('jump')
      ? m.jumpBufferTime
      : Math.max(0, player.jumpBufferTimer - dt);

    let newVy = vy;
    if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
      newVy = -m.jumpVelocity;
      player.jumpBufferTimer = 0;
      player.coyoteTimer = 0;
    }

    // --- Terminal fall speed clamp (not while grappling: preserve swing energy) ---
    if (!isGrappling && newVy > m.maxFallSpeed) {
      newVy = m.maxFallSpeed;
    }

    player.setVelocity(newVx, newVy);
  }
}
