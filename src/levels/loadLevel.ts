import type { GameConfig } from '../config/types';
import type { LevelData } from './types';
import { assertValidLevel } from './validateLevel';
import testLevel from './test-level.json';
import benchmark01 from './benchmark-01.json';

// Level registry + runtime loader.
//
// Levels are bundled JSON. Each is validated against the configured surface
// table before use, so a malformed level fails loudly with a clear message
// rather than producing broken geometry at runtime. The registry order is the
// order shown in the level-select screen.

const LEVELS: Record<string, unknown> = {
  'benchmark-01': benchmark01,
  'test-level': testLevel,
};

/** Ids in the order they should appear in the level-select screen. */
export const LEVEL_ORDER: readonly string[] = ['benchmark-01', 'test-level'];

export type LevelName = keyof typeof LEVELS;

/** The level loaded by default (the Phase 4 benchmark loop). */
export const DEFAULT_LEVEL = 'benchmark-01';

export interface LevelSummary {
  id: string;
  name: string;
  description?: string;
}

/** Lightweight metadata for the level-select screen (no surface validation). */
export function listLevels(): LevelSummary[] {
  return LEVEL_ORDER.map((id) => {
    const raw = LEVELS[id] as { metadata?: { name?: string; description?: string } };
    return {
      id,
      name: raw.metadata?.name ?? id,
      description: raw.metadata?.description,
    };
  });
}

/** Whether a level id exists in the registry. */
export function isKnownLevel(name: string): boolean {
  return name in LEVELS;
}

/** Load and validate a level by name. Throws if the level is unknown or invalid. */
export function loadLevel(name: string, config: GameConfig): LevelData {
  const raw = LEVELS[name];
  if (raw === undefined) {
    throw new Error(`Unknown level "${name}". Known levels: ${Object.keys(LEVELS).join(', ')}`);
  }
  return assertValidLevel(raw, Object.keys(config.surfaces));
}
