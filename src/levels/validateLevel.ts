import type { LevelData } from './types';

// Level validation (see docs/05-level-format.md "Level Validation").
//
// Validation is pure and returns structured errors rather than throwing, so the
// game can show a meaningful message and tests can assert on specific failures.

export interface LevelValidationResult {
  valid: boolean;
  errors: string[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Validate raw level data against the format rules.
 *
 * @param raw Untrusted parsed level JSON.
 * @param knownSurfaces Surface-type names considered valid (typically the keys
 *   of the configured surface table).
 */
export function validateLevel(raw: unknown, knownSurfaces: readonly string[]): LevelValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(raw)) {
    return { valid: false, errors: ['level must be an object'] };
  }

  if (!isFiniteNumber(raw.formatVersion)) {
    errors.push('level.formatVersion must be a number');
  }

  // Metadata: name is required.
  if (!isPlainObject(raw.metadata) || typeof raw.metadata.name !== 'string' || raw.metadata.name.length === 0) {
    errors.push('level.metadata.name must be a non-empty string');
  }

  // Exactly one spawn (object with numeric x/y).
  if (!isPlainObject(raw.spawn) || !isFiniteNumber(raw.spawn.x) || !isFiniteNumber(raw.spawn.y)) {
    errors.push('level.spawn must define numeric x and y');
  }

  // Exactly one goal (object with numeric x/y and positive radius).
  if (!isPlainObject(raw.goal) || !isFiniteNumber(raw.goal.x) || !isFiniteNumber(raw.goal.y)) {
    errors.push('level.goal must define numeric x and y');
  } else if (!isFiniteNumber(raw.goal.radius) || raw.goal.radius <= 0) {
    errors.push('level.goal.radius must be a positive number');
  }

  // Geometry: array of well-formed rectangles with known surface types.
  if (!Array.isArray(raw.geometry)) {
    errors.push('level.geometry must be an array');
  } else if (raw.geometry.length === 0) {
    errors.push('level.geometry must contain at least one piece');
  } else {
    raw.geometry.forEach((piece, index) => {
      if (!isPlainObject(piece)) {
        errors.push(`level.geometry[${index}] must be an object`);
        return;
      }
      if (!isFiniteNumber(piece.x) || !isFiniteNumber(piece.y)) {
        errors.push(`level.geometry[${index}] must define numeric x and y`);
      }
      if (!isFiniteNumber(piece.width) || piece.width <= 0) {
        errors.push(`level.geometry[${index}].width must be a positive number`);
      }
      if (!isFiniteNumber(piece.height) || piece.height <= 0) {
        errors.push(`level.geometry[${index}].height must be a positive number`);
      }
      if (typeof piece.surface !== 'string') {
        errors.push(`level.geometry[${index}].surface must be a string`);
      } else if (!knownSurfaces.includes(piece.surface)) {
        errors.push(
          `level.geometry[${index}].surface "${piece.surface}" is not a known surface type`,
        );
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Convenience wrapper that asserts validity, returning the typed level or
 * throwing with a combined message. Used by the runtime loader.
 */
export function assertValidLevel(raw: unknown, knownSurfaces: readonly string[]): LevelData {
  const result = validateLevel(raw, knownSurfaces);
  if (!result.valid) {
    throw new Error(`Invalid level:\n - ${result.errors.join('\n - ')}`);
  }
  return raw as LevelData;
}
