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
  wasGrounded: boolean;
  bunnyHopTimer: number;
  landingPenaltyPending: boolean;
  setVelocity(x: number, y: number): void;
}

/**
 * Per-frame movement telemetry, returned for debug visualisation and tests.
 * None of this drives gameplay; it just reports what the system decided so the
 * debug overlay can show the bunny-hop window, momentum state, etc.
 */
export interface MovementTelemetry {
  grounded: boolean;
  /** Air->ground transition happened this frame. */
  justLanded: boolean;
  /** The post-landing bunny-hop window is currently open. */
  bunnyHopWindowActive: boolean;
  /** Seconds remaining in the bunny-hop window (0 when inactive). */
  bunnyHopWindowRemaining: number;
  /** A jump was performed this frame. */
  performedJump: boolean;
  /** The jump this frame qualified as a (momentum-preserving) bunny hop. */
  performedBunnyHop: boolean;
  /** The landing momentum penalty was applied this frame (missed bunny hop). */
  landingPenaltyApplied: boolean;
  /** Resulting horizontal speed magnitude after this frame's update. */
  horizontalSpeed: number;
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
 * Drives running, jumping, air control, and the Phase 3 momentum mechanics
 * (bunny-hop timing, landing momentum, swing steering). Every value comes from
 * config.movement — nothing here is hard-coded (AGENTS.md "Configuration First").
 *
 * Momentum is treated as sacred (AGENTS.md): horizontal input accelerates toward
 * the target run speed but never brakes a body already moving faster in the same
 * direction (e.g. after a grapple swing), and there is no air drag by default.
 * Vertical velocity is left to Matter's gravity + the rope constraint, with only
 * a jump impulse and a terminal-fall clamp applied here.
 *
 * Bunny hop: landing opens a short window (bunnyHopWindow). Jumping within it,
 * with enough horizontal speed (bunnyHopMinSpeed), preserves (and optionally
 * boosts via bunnyHopMomentumMultiplier) horizontal momentum. Letting the window
 * lapse while staying grounded instead applies landingMomentumPreservation once.
 * The jump itself always still requires being grounded / within coyote time, so
 * this can never auto-jump or become a mid-air double jump (docs/03-core-mechanics.md).
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
  ): MovementTelemetry {
    const dt = deltaMs / 1000;
    const m = config.movement;
    const vx = player.velocity.x;
    const vy = player.velocity.y;

    const justLanded = isGrounded && !player.wasGrounded;
    player.isGrounded = isGrounded;

    // --- Horizontal movement ---
    const dir = (input.isDown('left') ? -1 : 0) + (input.isDown('right') ? 1 : 0);
    let newVx = vx;

    if (dir !== 0) {
      player.facing = dir as 1 | -1;
      // While grappling, swing steering is scaled by swingControlMultiplier so
      // input can pump/steer a swing more or less than normal air control.
      const baseAccel = isGrounded ? m.groundAcceleration : m.airAcceleration;
      const accel = !isGrounded && isGrappling ? baseAccel * m.swingControlMultiplier : baseAccel;
      const movingFasterThanMax = Math.sign(vx) === dir && Math.abs(vx) > m.maxRunSpeed;
      // Preserve hard-won momentum: only accelerate up to maxRunSpeed; never
      // actively slow a body already exceeding it in the input direction.
      newVx = movingFasterThanMax ? vx : approach(vx, dir * m.maxRunSpeed, accel * dt);
    } else {
      const decel = isGrounded ? m.groundFriction : m.airDrag;
      newVx = approach(vx, 0, decel * dt);
    }

    // --- Bunny-hop window bookkeeping ---
    let landingPenaltyApplied = false;
    if (justLanded) {
      // Open the window; defer any momentum change until either a bunny hop or
      // the window lapsing, so a hop launches from full landing speed.
      player.bunnyHopTimer = m.bunnyHopWindow;
      player.landingPenaltyPending = true;
    } else if (!isGrounded) {
      // Airborne (incl. immediately after a jump, or walking off a ledge): the
      // window only applies on the ground, and flowing off a ledge keeps full
      // speed, so clear any pending penalty.
      player.bunnyHopTimer = 0;
      player.landingPenaltyPending = false;
    } else {
      // Grounded, not the landing frame: decay the window.
      player.bunnyHopTimer = Math.max(0, player.bunnyHopTimer - dt);
      if (player.bunnyHopTimer === 0 && player.landingPenaltyPending) {
        // Missed the bunny hop: pay the landing momentum penalty exactly once.
        newVx *= m.landingMomentumPreservation;
        player.landingPenaltyPending = false;
        landingPenaltyApplied = true;
      }
    }

    // --- Jump with coyote time + input buffering ---
    player.coyoteTimer = isGrounded ? m.coyoteTime : Math.max(0, player.coyoteTimer - dt);
    player.jumpBufferTimer = input.justPressed('jump')
      ? m.jumpBufferTime
      : Math.max(0, player.jumpBufferTimer - dt);

    let newVy = vy;
    let performedJump = false;
    let performedBunnyHop = false;
    if (player.jumpBufferTimer > 0 && player.coyoteTimer > 0) {
      newVy = -m.jumpVelocity;
      performedJump = true;
      player.jumpBufferTimer = 0;
      player.coyoteTimer = 0;

      // Bunny hop: jumping inside the window with enough speed preserves (and
      // optionally boosts) horizontal momentum instead of paying the penalty.
      if (player.bunnyHopTimer > 0 && Math.abs(newVx) >= m.bunnyHopMinSpeed) {
        newVx *= m.bunnyHopMomentumMultiplier;
        performedBunnyHop = true;
      }
      player.landingPenaltyPending = false;
      player.bunnyHopTimer = 0;
    }

    // --- Terminal fall speed clamp (not while grappling: preserve swing energy) ---
    if (!isGrappling && newVy > m.maxFallSpeed) {
      newVy = m.maxFallSpeed;
    }

    player.setVelocity(newVx, newVy);
    player.wasGrounded = isGrounded;

    return {
      grounded: isGrounded,
      justLanded,
      bunnyHopWindowActive: player.bunnyHopTimer > 0,
      bunnyHopWindowRemaining: player.bunnyHopTimer,
      performedJump,
      performedBunnyHop,
      landingPenaltyApplied,
      horizontalSpeed: Math.abs(newVx),
    };
  }
}
