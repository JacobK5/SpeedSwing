// Documented valid ranges for numeric config values.
//
// resolveConfig clamps incoming values to these ranges (warning on the exact
// field), and the tuning panel uses them to bound its inputs. This keeps live
// tuning from producing physically broken values (negative sizes/speeds,
// stiffness/damping outside 0..1, zero zoom, etc.) — see docs/04-physics-tuning.md.

export interface NumericRange {
  min?: number;
  max?: number;
}

export type CategoryRanges = Record<string, NumericRange>;

export type RangedCategory = 'physics' | 'movement' | 'grapple' | 'camera' | 'debug';

export const RANGES: Record<RangedCategory, CategoryRanges> = {
  physics: {
    // gravityX / gravityY are intentionally unconstrained (direction + strength
    // are both legitimately tunable, including zero or negative).
    gravityScale: { min: 0, max: 1 },
    playerWidth: { min: 1 },
    playerHeight: { min: 1 },
    playerChamfer: { min: 0 },
    playerFriction: { min: 0 },
    playerFrictionStatic: { min: 0 },
    playerFrictionAir: { min: 0 },
    playerRestitution: { min: 0, max: 1 },
  },
  movement: {
    maxRunSpeed: { min: 0 },
    groundAcceleration: { min: 0 },
    airAcceleration: { min: 0 },
    groundFriction: { min: 0 },
    airDrag: { min: 0 },
    jumpVelocity: { min: 0 },
    maxFallSpeed: { min: 0 },
    coyoteTime: { min: 0 },
    jumpBufferTime: { min: 0 },
  },
  grapple: {
    minLength: { min: 0 },
    maxLength: { min: 1 },
    maxAttachDistance: { min: 0 },
    retractSpeed: { min: 0 },
    extendSpeed: { min: 0 },
    stiffness: { min: 0, max: 1 },
    damping: { min: 0, max: 1 },
    projectileSpeed: { min: 0 },
    projectileRadius: { min: 0.5 },
    projectileLifetime: { min: 0 },
  },
  camera: {
    lerp: { min: 0, max: 1 },
    deadzoneWidth: { min: 0 },
    deadzoneHeight: { min: 0 },
    zoom: { min: 0.1, max: 10 },
  },
  debug: {
    velocityDrawScale: { min: 0 },
  },
};

/** Clamp a value into the given range (no-op when the range is undefined). */
export function clampToRange(value: number, range: NumericRange | undefined): number {
  if (!range) {
    return value;
  }
  let result = value;
  if (range.min !== undefined && result < range.min) {
    result = range.min;
  }
  if (range.max !== undefined && result > range.max) {
    result = range.max;
  }
  return result;
}
