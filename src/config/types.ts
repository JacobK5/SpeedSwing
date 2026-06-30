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
  /** Corner rounding (chamfer) radius of the player body; reduces edge snagging. Applied on (re)spawn. */
  playerChamfer: number;
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
  /**
   * Bunny-hop timing window (seconds). After landing, a jump performed within
   * this window counts as a bunny hop and its horizontal momentum is preserved
   * (and optionally boosted). Miss the window while staying grounded and the
   * landing momentum penalty applies instead. 0 disables the mechanic.
   * Rewards intentional rhythm; never auto-jumps and never grants a mid-air jump
   * (the jump still requires being grounded / within coyote time).
   */
  bunnyHopWindow: number;
  /**
   * Minimum horizontal speed (velocity units) required for a jump in the
   * bunny-hop window to qualify as a bunny hop. Slow landings just jump normally.
   */
  bunnyHopMinSpeed: number;
  /**
   * Horizontal velocity multiplier applied on a successful bunny hop. 1.0 = pure
   * preservation (the reward is dodging the landing penalty); >1 adds a small
   * speed boost. Keep modest — large values cause runaway speed.
   */
  bunnyHopMomentumMultiplier: number;
  /**
   * Horizontal velocity multiplier applied once when a landing's bunny-hop
   * window expires while the player is still grounded (i.e. they did not bunny
   * hop). 1.0 = no penalty (momentum sacred); lower bleeds speed off sloppy
   * landings so timing matters. Walking off a ledge before the window ends keeps
   * full speed (no penalty) — only "land and stay" pays it.
   */
  landingMomentumPreservation: number;
  /**
   * Multiplier on air acceleration applied while grappling, so horizontal input
   * steers a swing more (>1) or less (<1) than free-fall air control. 1.0 leaves
   * swing steering identical to normal air control.
   */
  swingControlMultiplier: number;
}

/** Grapple node projectile, rope simulation and attach reach. */
export interface GrappleConfig {
  /** Shortest the rope can be retracted to (pixels). */
  minLength: number;
  /** Longest the rope can be extended to (pixels). */
  maxLength: number;
  /**
   * Maximum player-to-node distance at which a grab can attach (pixels).
   * Should be <= maxLength (validation clamps it); the effective reach is always
   * capped at maxLength so attaching never creates a rope shorter than the
   * current distance (which would yank the player toward a far node).
   */
  maxAttachDistance: number;
  /** Rope retraction speed while holding W (pixels/second). */
  retractSpeed: number;
  /** Rope extension speed while holding S (pixels/second). */
  extendSpeed: number;
  /** Matter constraint stiffness (0..1; nearer 1 = more rope-like / rigid). */
  stiffness: number;
  /** Matter constraint damping (0..1). */
  damping: number;
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
  /** Draw a line to the node a grab would target (nearest to the cursor). */
  drawAttachTarget: boolean;
  /** Draw the textual state overlay (speed, grounded, rope length, fps). */
  showOverlay: boolean;
  /** Enable Matter's built-in physics-body debug rendering. */
  matterDebug: boolean;
  /** Pixels drawn per unit of velocity for the debug velocity vector. */
  velocityDrawScale: number;
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
