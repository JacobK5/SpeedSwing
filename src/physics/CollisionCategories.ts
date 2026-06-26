// Matter collision categories (bit flags) and the filter each entity type uses.
//
// Two bodies collide only when each includes the other's category in its mask.
// This keeps grapple-node projectiles from colliding with the player who fired
// them while still colliding with terrain.

export const CollisionCategory = {
  PLAYER: 0x0002,
  TERRAIN: 0x0004,
  PROJECTILE: 0x0008,
} as const;

export interface CollisionFilterSpec {
  category: number;
  mask: number;
}

export const CollisionFilter: Record<'player' | 'terrain' | 'projectile', CollisionFilterSpec> = {
  // Player collides with terrain only.
  player: {
    category: CollisionCategory.PLAYER,
    mask: CollisionCategory.TERRAIN,
  },
  // Terrain collides with the player and with projectiles.
  terrain: {
    category: CollisionCategory.TERRAIN,
    mask: CollisionCategory.PLAYER | CollisionCategory.PROJECTILE,
  },
  // Projectiles collide with terrain only (never the firing player or each other).
  projectile: {
    category: CollisionCategory.PROJECTILE,
    mask: CollisionCategory.TERRAIN,
  },
};

/** Body label prefix used to tag terrain so ground/surface queries can identify it. */
export const TERRAIN_LABEL_PREFIX = 'terrain:';

/** Build the label for a terrain body of a given surface type. */
export function terrainLabel(surface: string): string {
  return `${TERRAIN_LABEL_PREFIX}${surface}`;
}

/** Whether a Matter body label denotes terrain. */
export function isTerrainLabel(label: string | undefined): boolean {
  return typeof label === 'string' && label.startsWith(TERRAIN_LABEL_PREFIX);
}
