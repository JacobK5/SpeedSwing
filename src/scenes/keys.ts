// Central registry of Phaser scene keys.
// Keeping these as plain string constants avoids importing scene classes purely
// to reference their identifiers (which would create import cycles).
export const SceneKeys = {
  Boot: 'BootScene',
  Menu: 'MenuScene',
  Level: 'LevelScene',
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
