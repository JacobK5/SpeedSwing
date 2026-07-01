// Pure Verlet rope simulation for the *visual* grapple rope, kept free of Phaser
// so the sag/relaxation behaviour can be unit tested deterministically.
//
// This is purely cosmetic (DECISIONS.md #017): it does not feed back into the
// Matter constraint that actually swings the player. A chain of points is pinned
// at the anchor and the player and relaxed toward a rest length equal to the rope
// length, so when the rope has slack (player closer than the rope length) the
// extra length sags under gravity and visibly swings; when taut it pulls straight.

import type { Point } from '../systems/grappleMath';

export interface RopePoint {
  x: number;
  y: number;
  /** Previous position; the implicit velocity in Verlet integration is (x - prevX). */
  prevX: number;
  prevY: number;
}

/** Cosmetic sim parameters. Not gameplay values — tuned for how the rope looks. */
export interface RopeSimParams {
  /** Per-step sag acceleration applied along the gravity direction (pixels/step²). */
  gravity: number;
  /** Velocity retention per step (0..1; <1 lets the rope settle instead of swinging forever). */
  damping: number;
  /** Constraint-relaxation passes per step (more = stiffer/less stretchy chain). */
  iterations: number;
}

/** Seed a straight chain of `segments` points from anchor to player (zero velocity). */
export function seedRope(anchor: Point, player: Point, segments: number): RopePoint[] {
  const points: RopePoint[] = [];
  const last = segments - 1;
  for (let i = 0; i < segments; i++) {
    const t = last === 0 ? 0 : i / last;
    const x = anchor.x + (player.x - anchor.x) * t;
    const y = anchor.y + (player.y - anchor.y) * t;
    points.push({ x, y, prevX: x, prevY: y });
  }
  return points;
}

/**
 * Advance the rope one step: integrate interior points under gravity, pin the
 * endpoints to the live anchor/player, then relax each segment toward its rest
 * length (ropeLength split evenly across the chain). Mutates `points` in place.
 */
export function stepRope(
  points: RopePoint[],
  anchor: Point,
  player: Point,
  ropeLength: number,
  gravityX: number,
  gravityY: number,
  params: RopeSimParams,
): void {
  const n = points.length;
  if (n < 2) {
    return;
  }
  const restLength = ropeLength / (n - 1);
  const gx = gravityX * params.gravity;
  const gy = gravityY * params.gravity;

  // Verlet integration of the interior points (endpoints are pinned below).
  for (let i = 1; i < n - 1; i++) {
    const p = points[i];
    const vx = (p.x - p.prevX) * params.damping;
    const vy = (p.y - p.prevY) * params.damping;
    p.prevX = p.x;
    p.prevY = p.y;
    p.x += vx + gx;
    p.y += vy + gy;
  }

  pinEnds(points, anchor, player);

  for (let k = 0; k < params.iterations; k++) {
    for (let i = 0; i < n - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const diff = (dist - restLength) / dist;
      const aPinned = i === 0;
      const bPinned = i + 1 === n - 1;
      if (aPinned && bPinned) {
        continue;
      }
      if (!aPinned && !bPinned) {
        const ox = dx * 0.5 * diff;
        const oy = dy * 0.5 * diff;
        a.x += ox;
        a.y += oy;
        b.x -= ox;
        b.y -= oy;
      } else if (aPinned) {
        b.x -= dx * diff;
        b.y -= dy * diff;
      } else {
        a.x += dx * diff;
        a.y += dy * diff;
      }
    }
    // Re-pin after each pass so the ends never drift off the anchor/player.
    pinEnds(points, anchor, player);
  }
}

/**
 * Reset the chain to a straight, zero-velocity line from anchor to player, in
 * place. Used for the rigid rope (no slack to show) and cheap enough to run every
 * frame without allocating.
 */
export function straightenRope(points: RopePoint[], anchor: Point, player: Point): void {
  const last = points.length - 1;
  for (let i = 0; i < points.length; i++) {
    const t = last <= 0 ? 0 : i / last;
    const x = anchor.x + (player.x - anchor.x) * t;
    const y = anchor.y + (player.y - anchor.y) * t;
    const p = points[i];
    p.x = x;
    p.y = y;
    p.prevX = x;
    p.prevY = y;
  }
}

function pinEnds(points: RopePoint[], anchor: Point, player: Point): void {
  const last = points.length - 1;
  points[0].x = anchor.x;
  points[0].y = anchor.y;
  points[last].x = player.x;
  points[last].y = player.y;
}
