// Pure geometry/maths for the grapple system, kept free of Phaser so the
// targeting and rope-length rules can be unit tested deterministically.

export interface Point {
  x: number;
  y: number;
}

/**
 * Select the grapple node to attach to: the one nearest the cursor, within
 * `attachRadius` of the cursor (forgiveness) and within `maxAttachDistance` of
 * the player. Returns null if no node qualifies.
 */
export function findNearestNode<T extends Point>(
  nodes: readonly T[],
  cursor: Point,
  player: Point,
  attachRadius: number,
  maxAttachDistance: number,
): T | null {
  let best: T | null = null;
  let bestCursorDist = Infinity;

  for (const node of nodes) {
    const cursorDist = Math.hypot(node.x - cursor.x, node.y - cursor.y);
    if (cursorDist > attachRadius) {
      continue;
    }
    const playerDist = Math.hypot(node.x - player.x, node.y - player.y);
    if (playerDist > maxAttachDistance) {
      continue;
    }
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
