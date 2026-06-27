import type { GameConfig, SurfaceDef } from './types';
import {
  DEFAULT_PHYSICS,
  DEFAULT_MOVEMENT,
  DEFAULT_GRAPPLE,
  DEFAULT_CAMERA,
  DEFAULT_DEBUG,
  DEFAULT_SURFACES,
} from './defaults';
import { RANGES, clampToRange, type CategoryRanges } from './ranges';

// Pure configuration resolution.
//
// `resolveConfig` takes raw (untrusted) JSON-shaped input and merges it over the
// documented defaults, validating types along the way. It never throws: invalid
// or missing values fall back to defaults and are reported as warnings. Keeping
// this pure (no Phaser, no I/O) makes it trivial to unit test.

type Primitive = number | boolean;

/** Raw, unvalidated config input — typically parsed JSON. */
export interface RawConfigInput {
  physics?: unknown;
  movement?: unknown;
  grapple?: unknown;
  camera?: unknown;
  debug?: unknown;
  surfaces?: unknown;
}

export interface ResolveResult {
  config: GameConfig;
  /** Human-readable validation notes (unknown keys, type mismatches, fallbacks). */
  warnings: string[];
}

/**
 * Merge a single flat category of primitive values over its defaults.
 * Unknown keys and type mismatches are reported but never fatal.
 */
function resolveCategory<T extends object>(
  defaults: T,
  raw: unknown,
  categoryName: string,
  warnings: string[],
): T {
  const result = { ...defaults } as T;

  // Record views let us iterate/mutate the flat primitive fields generically
  // without burdening every config interface with an index signature.
  const defs = defaults as unknown as Record<string, Primitive>;
  const out = result as unknown as Record<string, Primitive>;

  if (raw === undefined) {
    return result;
  }
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    warnings.push(`config: "${categoryName}" is not an object; using all defaults.`);
    return result;
  }

  const rawObj = raw as Record<string, unknown>;

  for (const key of Object.keys(defs)) {
    const defVal = defs[key];
    const rawVal = rawObj[key];

    if (rawVal === undefined) {
      continue; // Missing value: silently keep the default baseline.
    }

    const typesMatch = typeof rawVal === typeof defVal;
    const numberIsFinite = typeof rawVal !== 'number' || Number.isFinite(rawVal);

    if (typesMatch && numberIsFinite) {
      out[key] = rawVal as Primitive;
    } else {
      warnings.push(
        `config: "${categoryName}.${key}" expected ${typeof defVal}, ` +
          `got ${typeof rawVal}; using default (${String(defVal)}).`,
      );
    }
  }

  for (const key of Object.keys(rawObj)) {
    if (!(key in defs)) {
      warnings.push(`config: unknown key "${categoryName}.${key}" ignored.`);
    }
  }

  return result;
}

/** Clamp a resolved category's numeric fields into their documented ranges. */
function clampCategory(
  values: Record<string, Primitive>,
  ranges: CategoryRanges,
  categoryName: string,
  warnings: string[],
): void {
  for (const [key, range] of Object.entries(ranges)) {
    const value = values[key];
    if (typeof value !== 'number') {
      continue;
    }
    const clamped = clampToRange(value, range);
    if (clamped !== value) {
      const lo = range.min ?? '-inf';
      const hi = range.max ?? 'inf';
      warnings.push(
        `config: "${categoryName}.${key}" value ${value} is out of range [${lo}, ${hi}]; clamped to ${clamped}.`,
      );
      values[key] = clamped;
    }
  }
}

/** Enforce cross-field relationships that individual ranges cannot express. */
function enforceRelationships(config: GameConfig, warnings: string[]): void {
  const g = config.grapple;
  if (g.minLength > g.maxLength) {
    warnings.push(
      `config: grapple.minLength (${g.minLength}) exceeds grapple.maxLength (${g.maxLength}); ` +
        `clamping minLength to maxLength.`,
    );
    g.minLength = g.maxLength;
  }
  if (g.maxAttachDistance > g.maxLength) {
    warnings.push(
      `config: grapple.maxAttachDistance (${g.maxAttachDistance}) exceeds grapple.maxLength ` +
        `(${g.maxLength}); clamping maxAttachDistance to maxLength so attaching never yanks.`,
    );
    g.maxAttachDistance = g.maxLength;
  }
}

/** Merge the surface table, validating each known surface's fields. */
function resolveSurfaces(raw: unknown, warnings: string[]): Record<string, SurfaceDef> {
  const result: Record<string, SurfaceDef> = {};
  for (const [name, def] of Object.entries(DEFAULT_SURFACES)) {
    result[name] = { ...def };
  }

  if (raw === undefined) {
    return result;
  }
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    warnings.push('config: "surfaces" is not an object; using all defaults.');
    return result;
  }

  const rawObj = raw as Record<string, unknown>;
  for (const [name, rawDef] of Object.entries(rawObj)) {
    if (!(name in result)) {
      warnings.push(`config: unknown surface type "${name}" ignored.`);
      continue;
    }
    if (rawDef === null || typeof rawDef !== 'object' || Array.isArray(rawDef)) {
      warnings.push(`config: surface "${name}" is not an object; using default.`);
      continue;
    }

    const base = result[name];
    const rawSurface = rawDef as Record<string, unknown>;
    result[name] = {
      color: typeof rawSurface.color === 'string' ? rawSurface.color : base.color,
      collidable: typeof rawSurface.collidable === 'boolean' ? rawSurface.collidable : base.collidable,
      canPlaceNode:
        typeof rawSurface.canPlaceNode === 'boolean' ? rawSurface.canPlaceNode : base.canPlaceNode,
      destructible:
        typeof rawSurface.destructible === 'boolean' ? rawSurface.destructible : base.destructible,
    };
  }

  return result;
}

/**
 * Resolve raw config input into a fully-populated, type-safe {@link GameConfig}.
 * Always succeeds; problems are surfaced via the returned `warnings` array.
 */
export function resolveConfig(raw: RawConfigInput = {}): ResolveResult {
  const warnings: string[] = [];

  const config: GameConfig = {
    physics: resolveCategory(DEFAULT_PHYSICS, raw.physics, 'physics', warnings),
    movement: resolveCategory(DEFAULT_MOVEMENT, raw.movement, 'movement', warnings),
    grapple: resolveCategory(DEFAULT_GRAPPLE, raw.grapple, 'grapple', warnings),
    camera: resolveCategory(DEFAULT_CAMERA, raw.camera, 'camera', warnings),
    debug: resolveCategory(DEFAULT_DEBUG, raw.debug, 'debug', warnings),
    surfaces: resolveSurfaces(raw.surfaces, warnings),
  };

  // Clamp numeric values into their documented ranges, then fix cross-field
  // relationships (e.g. minLength must not exceed maxLength).
  clampCategory(config.physics as unknown as Record<string, Primitive>, RANGES.physics, 'physics', warnings);
  clampCategory(config.movement as unknown as Record<string, Primitive>, RANGES.movement, 'movement', warnings);
  clampCategory(config.grapple as unknown as Record<string, Primitive>, RANGES.grapple, 'grapple', warnings);
  clampCategory(config.camera as unknown as Record<string, Primitive>, RANGES.camera, 'camera', warnings);
  clampCategory(config.debug as unknown as Record<string, Primitive>, RANGES.debug, 'debug', warnings);
  enforceRelationships(config, warnings);

  return { config, warnings };
}
