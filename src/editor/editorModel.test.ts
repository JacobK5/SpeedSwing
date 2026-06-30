import { describe, it, expect } from 'vitest';
import {
  snap,
  normalizeRect,
  pointInGeometry,
  geometryAtPoint,
  createEmptyLevel,
  levelToJson,
  parseLevelJson,
} from './editorModel';
import { validateLevel } from '../levels/validateLevel';
import { resolveConfig } from '../config/resolveConfig';
import type { LevelGeometry } from '../levels/types';

const surfaces = Object.keys(resolveConfig({}).config.surfaces);

describe('snap', () => {
  it('rounds to the nearest grid step', () => {
    expect(snap(23, 10)).toBe(20);
    expect(snap(26, 10)).toBe(30);
    expect(snap(-12, 10)).toBe(-10);
  });

  it('is a no-op when grid is 0 or negative', () => {
    expect(snap(23.7, 0)).toBe(23.7);
    expect(snap(23.7, -5)).toBe(23.7);
  });
});

describe('normalizeRect', () => {
  it('produces positive dimensions regardless of drag direction', () => {
    expect(normalizeRect(100, 100, 40, 30)).toEqual({ x: 40, y: 30, width: 60, height: 70 });
    expect(normalizeRect(40, 30, 100, 100)).toEqual({ x: 40, y: 30, width: 60, height: 70 });
  });
});

describe('geometry hit-testing', () => {
  const piece: LevelGeometry = { x: 10, y: 10, width: 100, height: 50, surface: 'standard' };

  it('detects points inside and on the edge', () => {
    expect(pointInGeometry(50, 30, piece)).toBe(true);
    expect(pointInGeometry(10, 10, piece)).toBe(true);
    expect(pointInGeometry(110, 60, piece)).toBe(true);
  });

  it('rejects points outside', () => {
    expect(pointInGeometry(5, 30, piece)).toBe(false);
    expect(pointInGeometry(200, 30, piece)).toBe(false);
  });

  it('returns the topmost (last) overlapping piece', () => {
    const geom: LevelGeometry[] = [
      { x: 0, y: 0, width: 100, height: 100, surface: 'standard' },
      { x: 20, y: 20, width: 40, height: 40, surface: 'no-node' },
    ];
    expect(geometryAtPoint(geom, 30, 30)).toBe(1); // inside both -> topmost
    expect(geometryAtPoint(geom, 90, 90)).toBe(0); // only the first
    expect(geometryAtPoint(geom, 500, 500)).toBe(-1);
  });
});

describe('level building / serialisation', () => {
  it('creates a level that validates once geometry is added', () => {
    const level = createEmptyLevel();
    // Empty geometry is intentionally invalid (a level needs at least one piece).
    expect(validateLevel(level, surfaces).valid).toBe(false);

    level.geometry.push({ x: 0, y: 200, width: 400, height: 40, surface: 'standard' });
    const result = validateLevel(level, surfaces);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('round-trips through JSON', () => {
    const level = createEmptyLevel();
    level.geometry.push({ x: 0, y: 200, width: 400, height: 40, surface: 'standard' });
    const json = levelToJson(level);
    expect(parseLevelJson(json)).toEqual(level);
  });

  it('throws a friendly error on malformed JSON', () => {
    expect(() => parseLevelJson('{ not valid')).toThrow(/Invalid JSON/);
  });
});
