import type { GameConfig } from './types';
import { resolveConfig } from './resolveConfig';

// Persistence + merge helpers for the developer tuning panel.
//
// The pure functions (serialize / deserialize / applyConfigInto) carry the
// testable logic; the localStorage wrappers are a thin, guarded I/O layer so the
// game degrades gracefully where storage is unavailable.

export const TUNING_STORAGE_KEY = 'speedswing.tuning.v1';

/** Serialize a config to a JSON string for storage. */
export function serializeConfig(config: GameConfig): string {
  return JSON.stringify(config);
}

/**
 * Parse a stored JSON string back into a validated config. Never throws: invalid
 * JSON or values fall back to defaults (and are range-clamped) via resolveConfig.
 */
export function deserializeConfig(raw: string): GameConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }
  return resolveConfig(parsed as Record<string, unknown>).config;
}

/**
 * Copy every category's values from `source` into `target` in place, preserving
 * `target`'s object identity so systems holding a reference see the new values.
 */
export function applyConfigInto(target: GameConfig, source: GameConfig): void {
  Object.assign(target.physics, source.physics);
  Object.assign(target.movement, source.movement);
  Object.assign(target.grapple, source.grapple);
  Object.assign(target.camera, source.camera);
  Object.assign(target.debug, source.debug);
  for (const key of Object.keys(target.surfaces)) {
    if (source.surfaces[key]) {
      Object.assign(target.surfaces[key], source.surfaces[key]);
    }
  }
}

function getStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

/** Persist the active config to local storage (best effort). */
export function saveTuning(config: GameConfig): boolean {
  const storage = getStorage();
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(TUNING_STORAGE_KEY, serializeConfig(config));
    return true;
  } catch {
    return false;
  }
}

/** Load a previously saved config, or null if none/unavailable. */
export function loadTuning(): GameConfig | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  const raw = storage.getItem(TUNING_STORAGE_KEY);
  return raw ? deserializeConfig(raw) : null;
}

/** Forget any saved tuning (used by "restore defaults"). */
export function clearTuning(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(TUNING_STORAGE_KEY);
  } catch {
    // ignore
  }
}
