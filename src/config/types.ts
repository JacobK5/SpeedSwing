// Typed shape of all gameplay configuration.
//
// Every gameplay value the game reads at runtime is declared here and supplied
// from JSON (see the sibling *.json files). Systems must read these values
// rather than hard-coding constants (see AGENTS.md "Configuration First").

/** World physics + the player's Matter body material properties. */
export interface PhysicsConfig {
  /** Horizontal world gravity (Matter units). Default 0. */
  gravityX: number;
  /** Vertical world gravity (Matter units, positive = down). */
  gravityY: number;
  /** Matter gravity scale multiplier (acceleration = gravityY * gravityScale). */
  gravityScale: number;
  /** Player placeholder body width in pixels. */
  playerWidth: number;
  /** Player placeholder body height in pixels. */
  playerHeight: number;
  /** Matter kinetic friction of the player body (0 = frictionless; movement is code-driven). */
  playerFriction: number;
  /** Matter static friction of the player body. */
  playerFrictionStatic: number;
  /** Matter air friction of the player body (0 preserves air momentum; drag is code-driven). */
  playerFrictionAir: number;
  /** Player body bounciness (0 = no bounce). */
  playerRestitution: number;
}

/** Movement feel. The highest-priority tuning surface in the project. */
export interface MovementConfig {
  /** Target horizontal run speed (Matter velocity units, ~px per 16.7ms step). */
  maxRunSpeed: number;
  /** Horizontal acceleration toward target speed while grounded (units/second). */
  groundAcceleration: number;
  /** Horizontal acceleration toward target speed while airborne (units/second). */
  airAcceleration: number;
  /** Deceleration applied when no horizontal input is held on the ground (units/second). */
  groundFriction: number;
  /** Deceleration applied when no horizontal input is held in the air (units/second; 0 preserves momentum). */
  airDrag: number;
  /** Upward velocity applied on jump (Matter velocity units). */
  jumpVelocity: number;
  /** Terminal downward velocity clamp (Matter velocity units). */
  maxFallSpeed: number;
  /** Grace period after leaving a ledge during which a jump still works (seconds). */
  coyoteTime: number;
  /** Window during which a jump pressed before landing is remembered (seconds). */
  jumpBufferTime: number;
}

/** Grapple node projectile, rope simulation and attach forgiveness. */
export interface GrappleConfig {
  /** Shortest the rope can be retracted to (pixels). */
  minLength: number;
  /** Longest the rope can be extended to (pixels). */
  maxLength: number;
  /** Rope retraction speed while holding W (pixels/second). */
  retractSpeed: number;
  /** Rope extension speed while holding S (pixels/second). */
  extendSpeed: number;
  /** Matter constraint stiffness (0..1; nearer 1 = more rope-like / rigid). */
  stiffness: number;
  /** Matter constraint damping (0..1). */
  damping: number;
  /** Cursor forgiveness radius when selecting the nearest node to attach to (pixels). */
  attachRadius: number;
  /** Maximum player-to-node distance allowed when attaching (pixels). */
  maxAttachDistance: number;
  /** Speed of the fired grapple-node projectile (Matter velocity units). */
  projectileSpeed: number;
  /** Radius of the placeholder projectile body (pixels). */
  projectileRadius: number;
  /** Seconds before an un-landed projectile despawns. */
  projectileLifetime: number;
}

/** Smooth-follow camera. */
export interface CameraConfig {
  /** Follow interpolation factor per frame (0..1; lower = smoother/laggier). */
  lerp: number;
  /** Horizontal dead zone half-extent the player can move within before the camera tracks (pixels). */
  deadzoneWidth: number;
  /** Vertical dead zone half-extent (pixels). */
  deadzoneHeight: number;
  /** Camera zoom factor (1 = no zoom). */
  zoom: number;
}

/** Developer debug-visualisation toggles. Not intended for release builds. */
export interface DebugConfig {
  /** Whether debug visualisation is on when the level starts. */
  startEnabled: boolean;
  /** Draw the active rope line. */
  drawRope: boolean;
  /** Draw placed grapple nodes. */
  drawNodes: boolean;
  /** Draw the player's velocity vector. */
  drawVelocity: boolean;
  /** Draw the cursor attach-radius circle. */
  drawAttachRadius: boolean;
  /** Draw the textual state overlay (speed, grounded, rope length, fps). */
  showOverlay: boolean;
  /** Enable Matter's built-in physics-body debug rendering. */
  matterDebug: boolean;
}

/** Properties of a single terrain surface type. */
export interface SurfaceDef {
  /** Placeholder fill colour as a hex string, e.g. "#6b7280". */
  color: string;
  /** Whether the surface physically collides. */
  collidable: boolean;
  /** Whether a grapple node may be placed on this surface. */
  canPlaceNode: boolean;
  /** Whether explosives destroy this surface (Phase 4 behaviour; data only for now). */
  destructible: boolean;
}

/** The fully-resolved configuration consumed by gameplay systems. */
export interface GameConfig {
  physics: PhysicsConfig;
  movement: MovementConfig;
  grapple: GrappleConfig;
  camera: CameraConfig;
  debug: DebugConfig;
  /** Terrain surface table keyed by surface-type name. */
  surfaces: Record<string, SurfaceDef>;
}
