// Pure geometry/maths for the grapple system, kept free of Phaser so the
// targeting and rope-length rules can be unit tested deterministically.

export interface Point {
  x: number;
  y: number;
}

/**
 * Select the grapple node nearest the cursor. There is no radius or distance
 * gate: grabbing always targets the closest node to the cursor, which playtested
 * as far smoother than requiring the cursor to be within a forgiveness radius.
 * Returns null only when there are no nodes.
 */
export function findNearestNode<T extends Point>(nodes: readonly T[], cursor: Point): T | null {
  let best: T | null = null;
  let bestDist = Infinity;

  for (const node of nodes) {
    const dist = Math.hypot(node.x - cursor.x, node.y - cursor.y);
    if (dist < bestDist) {
      bestDist = dist;
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
