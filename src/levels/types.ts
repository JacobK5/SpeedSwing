// Level data format (see docs/05-level-format.md).
//
// A level describes *what exists*, never *how the game behaves*. Geometry uses
// top-left anchored axis-aligned rectangles (x, y = top-left corner) for easy
// human authoring; gameplay code converts these to Matter centre coordinates.

export interface LevelMetadata {
  name: string;
  author?: string;
  description?: string;
}

export interface LevelSpawn {
  x: number;
  y: number;
  /** Optional initial facing; purely cosmetic for now. */
  facing?: 'left' | 'right';
}

export interface LevelGoal {
  x: number;
  y: number;
  /** Trigger radius in pixels. */
  radius: number;
}

export interface LevelGeometry {
  /** Top-left corner X in world pixels. */
  x: number;
  /** Top-left corner Y in world pixels. */
  y: number;
  width: number;
  height: number;
  /** Surface-type name; must exist in the configured surface table. */
  surface: string;
}

/**
 * Starting ammunition. Declared by levels for forward compatibility with the
 * Phase 4 resource system; NOT enforced yet (no resource system in Phases 0-2).
 */
export interface LevelResources {
  grappleNodes?: number;
  explosives?: number;
}

export interface LevelTheme {
  /** Background colour hex string, e.g. "#14161c". */
  background?: string;
  /** Whether to draw a reference grid. */
  grid?: boolean;
}

export interface LevelData {
  /** Level format version (see docs/05-level-format.md "Versioning"). */
  formatVersion: number;
  metadata: LevelMetadata;
  spawn: LevelSpawn;
  goal: LevelGoal;
  geometry: LevelGeometry[];
  resources?: LevelResources;
  theme?: LevelTheme;
}
