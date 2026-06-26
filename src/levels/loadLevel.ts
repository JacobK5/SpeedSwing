import type { GameConfig } from '../config/types';
import type { LevelData } from './types';
import { assertValidLevel } from './validateLevel';
import testLevel from './test-level.json';

// Level registry + runtime loader.
//
// Levels are bundled JSON. Each is validated against the configured surface
// table before use, so a malformed level fails loudly with a clear message
// rather than producing broken geometry at runtime.

const LEVELS: Record<string, unknown> = {
  'test-level': testLevel,
};

export type LevelName = keyof typeof LEVELS;

export const DEFAULT_LEVEL = 'test-level';

/** Load and validate a level by name. Throws if the level is unknown or invalid. */
export function loadLevel(name: string, config: GameConfig): LevelData {
  const raw = LEVELS[name];
  if (raw === undefined) {
    throw new Error(`Unknown level "${name}". Known levels: ${Object.keys(LEVELS).join(', ')}`);
  }
  return assertValidLevel(raw, Object.keys(config.surfaces));
}
