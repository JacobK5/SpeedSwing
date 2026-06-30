import type { GameConfig } from './types';
import { resolveConfig } from './resolveConfig';
import { applyConfigInto, loadTuning } from './tuningStore';

import physics from './physics.json';
import movement from './movement.json';
import grapple from './grapple.json';
import weapons from './weapons.json';
import camera from './camera.json';
import debug from './debug.json';
import surfaces from './surfaces.json';

// Runtime entry point for configuration.
//
// JSON files are imported (and therefore validated + hot-reloaded by Vite during
// development). They are intentionally treated as untrusted input and passed
// through resolveConfig() so a malformed edit degrades gracefully to defaults
// instead of crashing the game.

/**
 * Load, validate and resolve the full game configuration.
 * Warnings (unknown keys, type fallbacks) are logged but never fatal.
 */
export function loadGameConfig(): GameConfig {
  const { config, warnings } = resolveConfig({
    physics,
    movement,
    grapple,
    weapons,
    camera,
    debug,
    surfaces,
  });

  for (const warning of warnings) {
    console.warn(warning);
  }

  // Overlay any tuning the developer saved via the in-game panel so it persists
  // across restarts and reloads (docs/04-physics-tuning.md). Saved values were
  // already validated when stored, and are re-validated on load.
  const saved = loadTuning();
  if (saved) {
    applyConfigInto(config, saved);
  }

  return config;
}
