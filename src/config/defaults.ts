import type {
  PhysicsConfig,
  MovementConfig,
  GrappleConfig,
  WeaponsConfig,
  CameraConfig,
  DebugConfig,
  SurfaceDef,
} from './types';

// Documented baseline values.
//
// These are the canonical defaults used as fallbacks by resolveConfig(). The
// JSON files under src/config mirror these and are the values actually tuned
// during playtesting. Defaults must never be edited casually — they are the
// "restore defaults" target referenced in docs/04-physics-tuning.md.
//
// All starting numbers are first guesses to be validated through playtesting,
// NOT final values (see DECISIONS.md #004, #005).

export const DEFAULT_PHYSICS: PhysicsConfig = {
  gravityX: 0,
  gravityY: 1,
  gravityScale: 0.001,
  playerWidth: 28,
  playerHeight: 44,
  playerChamfer: 4,
  playerFriction: 0,
  playerFrictionStatic: 0,
  playerFrictionAir: 0,
  playerRestitution: 0,
};

export const DEFAULT_MOVEMENT: MovementConfig = {
  maxRunSpeed: 6.5,
  groundAcceleration: 45,
  airAcceleration: 25,
  groundFriction: 50,
  airDrag: 0,
  jumpVelocity: 11,
  maxFallSpeed: 20,
  coyoteTime: 0.1,
  jumpBufferTime: 0.12,
  bunnyHopWindow: 0.15,
  bunnyHopMinSpeed: 3.5,
  bunnyHopMomentumMultiplier: 1.0,
  landingMomentumPreservation: 0.9,
  swingControlMultiplier: 1.0,
};

export const DEFAULT_GRAPPLE: GrappleConfig = {
  minLength: 40,
  maxLength: 600,
  maxAttachDistance: 600, // == maxLength: reach as far as the rope, never further
  retractSpeed: 220,
  extendSpeed: 260,
  stiffness: 0.9,
  damping: 0.05,
  projectileSpeed: 16,
  projectileRadius: 6,
  projectileLifetime: 3,
};

export const DEFAULT_WEAPONS: WeaponsConfig = {
  explosiveProjectileSpeed: 14,
  explosiveProjectileRadius: 8,
  explosiveProjectileLifetime: 3,
  explosionRadius: 90,
  explosionPlayerForce: 0,
  defaultGrappleAmmo: 8,
  defaultExplosiveAmmo: 3,
};

export const DEFAULT_CAMERA: CameraConfig = {
  lerp: 0.12,
  deadzoneWidth: 120,
  deadzoneHeight: 90,
  zoom: 1,
};

export const DEFAULT_DEBUG: DebugConfig = {
  startEnabled: false,
  drawRope: true,
  drawNodes: true,
  drawVelocity: true,
  drawAttachTarget: true,
  showOverlay: true,
  matterDebug: false,
  velocityDrawScale: 8,
};

export const DEFAULT_SURFACES: Record<string, SurfaceDef> = {
  standard: { color: '#6b7280', collidable: true, canPlaceNode: true, destructible: false, killOnTouch: false },
  'no-node': { color: '#7c4a4a', collidable: true, canPlaceNode: false, destructible: false, killOnTouch: false },
  destructible: { color: '#8a6d3b', collidable: true, canPlaceNode: true, destructible: true, killOnTouch: false },
  killzone: { color: '#3a1f1f', collidable: false, canPlaceNode: false, destructible: false, killOnTouch: true },
};
