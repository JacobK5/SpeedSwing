import Phaser from 'phaser';
import type { GameConfig, SurfaceDef } from '../config/types';
import type { LevelData } from '../levels/types';
import type { Rect, Circle } from './regionChecks';
import { CollisionFilter, terrainLabel } from '../physics/CollisionCategories';
import { hexToInt, darken } from '../core/color';

export interface SurfaceInfo {
  type: string;
  def: SurfaceDef;
}

/** A destructible terrain piece the explosive system can remove at runtime. */
export interface DestructiblePiece {
  body: MatterJS.BodyType;
  view: Phaser.GameObjects.Rectangle;
  /** World-space top-left anchored AABB (for explosion overlap tests). */
  bounds: Rect;
  destroyed: boolean;
}

export interface BuiltLevel {
  /** World extents (padded) for the camera bounds. */
  bounds: { x: number; y: number; width: number; height: number };
  /** Lookup from a terrain body id to its surface info (used by the grapple system). */
  surfaceByBodyId: Map<number, SurfaceInfo>;
  /** Destructible pieces, removable by explosives; reset by rebuilding on restart. */
  destructibles: DestructiblePiece[];
  /** World AABBs of kill-on-touch surfaces (checked against the player each frame). */
  killzones: Rect[];
  /** The level goal as a world circle (touching it completes the run). */
  goal: Circle;
}

const GRID_SPACING = 200;

/**
 * Instantiates a level's static terrain (Matter bodies + placeholder visuals)
 * plus spawn/goal markers, and reports world bounds, a surface lookup, the
 * destructible pieces, the kill zones, and the goal trigger.
 *
 * Geometry is authored with top-left anchored rectangles; this converts each to
 * Matter's centre-anchored body. Destructible terrain is rebuilt fresh on every
 * scene restart, so explosions reset cleanly with no extra bookkeeping.
 */
export function buildLevel(scene: Phaser.Scene, level: LevelData, config: GameConfig): BuiltLevel {
  const surfaceByBodyId = new Map<number, SurfaceInfo>();
  const destructibles: DestructiblePiece[] = [];
  const killzones: Rect[] = [];
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
    const bounds: Rect = { x: piece.x, y: piece.y, width: piece.width, height: piece.height };

    const view = scene.add
      .rectangle(cx, cy, piece.width, piece.height, color)
      .setStrokeStyle(2, darken(color, 0.6));

    if (def.killOnTouch) {
      killzones.push(bounds);
    }

    if (def.collidable) {
      const body = scene.matter.add.rectangle(cx, cy, piece.width, piece.height, {
        isStatic: true,
        label: terrainLabel(piece.surface),
        friction: 0,
        frictionStatic: 0,
        collisionFilter: { ...CollisionFilter.terrain },
      });
      surfaceByBodyId.set(body.id, { type: piece.surface, def });
      if (def.destructible) {
        destructibles.push({ body, view, bounds, destroyed: false });
      }
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
    destructibles,
    killzones,
    goal: { x: level.goal.x, y: level.goal.y, radius: level.goal.radius },
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
