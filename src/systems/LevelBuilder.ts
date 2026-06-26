import Phaser from 'phaser';
import type { GameConfig, SurfaceDef } from '../config/types';
import type { LevelData } from '../levels/types';
import { CollisionFilter, terrainLabel } from '../physics/CollisionCategories';
import { hexToInt, darken } from '../core/color';

export interface SurfaceInfo {
  type: string;
  def: SurfaceDef;
}

export interface BuiltLevel {
  /** World extents (padded) for the camera bounds. */
  bounds: { x: number; y: number; width: number; height: number };
  /** Lookup from a terrain body id to its surface info (used by the grapple system). */
  surfaceByBodyId: Map<number, SurfaceInfo>;
}

const GRID_SPACING = 200;

/**
 * Instantiates a level's static terrain (Matter bodies + placeholder visuals)
 * plus spawn/goal markers, and reports world bounds and a surface lookup.
 *
 * Geometry is authored with top-left anchored rectangles; this converts each to
 * Matter's centre-anchored body. The goal marker is currently non-functional —
 * completion/timer logic is intentionally deferred to Phase 4.
 */
export function buildLevel(scene: Phaser.Scene, level: LevelData, config: GameConfig): BuiltLevel {
  const surfaceByBodyId = new Map<number, SurfaceInfo>();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const piece of level.geometry) {
    minX = Math.min(minX, piece.x);
    minY = Math.min(minY, piece.y);
    maxX = Math.max(maxX, piece.x + piece.width);
    maxY = Math.max(maxY, piece.y + piece.height);
  }

  if (level.theme?.grid) {
    drawGrid(scene, minX, minY, maxX, maxY);
  }

  for (const piece of level.geometry) {
    const def = config.surfaces[piece.surface];
    const cx = piece.x + piece.width / 2;
    const cy = piece.y + piece.height / 2;
    const color = hexToInt(def.color);

    scene.add
      .rectangle(cx, cy, piece.width, piece.height, color)
      .setStrokeStyle(2, darken(color, 0.6));

    if (def.collidable) {
      const body = scene.matter.add.rectangle(cx, cy, piece.width, piece.height, {
        isStatic: true,
        label: terrainLabel(piece.surface),
        friction: 0,
        frictionStatic: 0,
        collisionFilter: { ...CollisionFilter.terrain },
      });
      surfaceByBodyId.set(body.id, { type: piece.surface, def });
    }
  }

  drawGoal(scene, level);
  drawSpawn(scene, level);

  const pad = 240;
  return {
    bounds: {
      x: minX - pad,
      y: minY - pad,
      width: maxX - minX + pad * 2,
      height: maxY - minY + pad * 2,
    },
    surfaceByBodyId,
  };
}

function drawGrid(scene: Phaser.Scene, minX: number, minY: number, maxX: number, maxY: number): void {
  const grid = scene.add.graphics().setDepth(-10);
  grid.lineStyle(1, hexToInt('#222630'), 0.6);
  for (let x = Math.floor(minX / GRID_SPACING) * GRID_SPACING; x <= maxX; x += GRID_SPACING) {
    grid.lineBetween(x, minY, x, maxY);
  }
  for (let y = Math.floor(minY / GRID_SPACING) * GRID_SPACING; y <= maxY; y += GRID_SPACING) {
    grid.lineBetween(minX, y, maxX, y);
  }
}

function drawGoal(scene: Phaser.Scene, level: LevelData): void {
  const color = hexToInt('#6ee7a8');
  scene.add
    .circle(level.goal.x, level.goal.y, level.goal.radius, color, 0.2)
    .setStrokeStyle(2, color)
    .setDepth(1);
  scene.add
    .text(level.goal.x, level.goal.y - level.goal.radius - 16, 'GOAL', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#6ee7a8',
    })
    .setOrigin(0.5)
    .setDepth(1);
}

function drawSpawn(scene: Phaser.Scene, level: LevelData): void {
  scene.add
    .circle(level.spawn.x, level.spawn.y, 6, hexToInt('#9ecbff'), 0.8)
    .setDepth(1);
}
