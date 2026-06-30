import type { LevelData, LevelGeometry } from '../levels/types';

// Pure model helpers for the developer level editor.
//
// All editor state mutations that have meaningful logic (snapping, rect
// normalisation, hit-testing, building a fresh level, serialising) live here,
// free of Phaser, so they can be unit tested. EditorScene owns only rendering
// and input and delegates to these. The editor is a dev-only tool and reuses the
// existing level format (docs/05-level-format.md) — it never invents new fields.

/** Surface types the editor can author (must exist in the surface table). */
export const EDITOR_SURFACES = ['standard', 'no-node', 'destructible', 'killzone'] as const;
export type EditorSurface = (typeof EDITOR_SURFACES)[number];

/** Round a value to the nearest grid step. A grid of 0 (or less) means no snap. */
export function snap(value: number, grid: number): number {
  return grid > 0 ? Math.round(value / grid) * grid : value;
}

/** Build a positive-dimension rect from two drag corners. */
export function normalizeRect(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): { x: number; y: number; width: number; height: number } {
  return {
    x: Math.min(x0, x1),
    y: Math.min(y0, y1),
    width: Math.abs(x1 - x0),
    height: Math.abs(y1 - y0),
  };
}

/** Whether a world point lies inside a geometry rectangle (top-left anchored). */
export function pointInGeometry(px: number, py: number, piece: LevelGeometry): boolean {
  return px >= piece.x && px <= piece.x + piece.width && py >= piece.y && py <= piece.y + piece.height;
}

/**
 * Index of the topmost geometry piece containing the point, or -1. "Topmost" =
 * last in the array (drawn last / on top), so clicking selects what you see.
 */
export function geometryAtPoint(geometry: readonly LevelGeometry[], px: number, py: number): number {
  for (let i = geometry.length - 1; i >= 0; i--) {
    if (pointInGeometry(px, py, geometry[i])) {
      return i;
    }
  }
  return -1;
}

/** A blank level with sane defaults, ready to author. */
export function createEmptyLevel(): LevelData {
  return {
    formatVersion: 1,
    metadata: { name: 'Untitled', author: 'editor' },
    spawn: { x: 120, y: 120, facing: 'right' },
    goal: { x: 640, y: 120, radius: 40 },
    geometry: [],
    resources: { grappleNodes: 6, explosives: 2 },
    theme: { background: '#14161c', grid: true },
  };
}

/** Pretty-print a level to the canonical JSON shape (2-space indent). */
export function levelToJson(level: LevelData): string {
  return JSON.stringify(level, null, 2);
}

/** Parse JSON text into an unknown value, or throw a friendly error. */
export function parseLevelJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON: ${(e as Error).message}`);
  }
}
