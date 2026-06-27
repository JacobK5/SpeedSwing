// Pure geometry/maths for the grapple system, kept free of Phaser so the
// targeting and rope-length rules can be unit tested deterministically.

export interface Point {
  x: number;
  y: number;
}

/**
 * Select the grapple node to attach to: the node nearest the cursor among those
 * within `maxReach` pixels of the player.
 *
 * Cursor distance is deliberately NOT gated (no forgiveness radius — that
 * playtested worse): aiming roughly toward a cluster always grabs the closest
 * node to the cursor. But a node physically out of the player's reach is never
 * targeted, which is what stops far/offscreen nodes from yanking the player.
 * Returns null when nothing is in reach.
 */
export function findAttachTarget<T extends Point>(
  nodes: readonly T[],
  cursor: Point,
  player: Point,
  maxReach: number,
): T | null {
  let best: T | null = null;
  let bestCursorDist = Infinity;

  for (const node of nodes) {
    const playerDist = Math.hypot(node.x - player.x, node.y - player.y);
    if (playerDist > maxReach) {
      continue;
    }
    const cursorDist = Math.hypot(node.x - cursor.x, node.y - cursor.y);
    if (cursorDist < bestCursorDist) {
      bestCursorDist = cursorDist;
      best = node;
    }
  }

  return best;
}

/** Clamp a value to the inclusive [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Resolve where a grapple node should be placed when a projectile hits terrain.
 * Prefers the actual collision contact point; otherwise projects the projectile
 * centre forward to its leading edge along the travel direction, so the node sits
 * on the surface rather than at the (slightly penetrated) body centre.
 */
export function resolveImpactPoint(
  center: Point,
  velocity: Point,
  radius: number,
  contact?: Point | null,
): Point {
  if (contact && Number.isFinite(contact.x) && Number.isFinite(contact.y)) {
    return { x: contact.x, y: contact.y };
  }
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed === 0) {
    return { x: center.x, y: center.y };
  }
  return {
    x: center.x + (velocity.x / speed) * radius,
    y: center.y + (velocity.y / speed) * radius,
  };
}

/**
 * Compute the next rope length given retract (W) / extend (S) input this frame,
 * clamped to [minLength, maxLength]. Holding both nets their difference.
 */
export function computeRopeLength(
  current: number,
  retract: boolean,
  extend: boolean,
  retractSpeed: number,
  extendSpeed: number,
  dtSeconds: number,
  minLength: number,
  maxLength: number,
): number {
  let length = current;
  if (retract) {
    length -= retractSpeed * dtSeconds;
  }
  if (extend) {
    length += extendSpeed * dtSeconds;
  }
  return clamp(length, minLength, maxLength);
}
