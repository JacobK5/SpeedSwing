import Phaser from 'phaser';
import type { Point } from '../systems/grappleMath';
import { seedRope, stepRope, straightenRope, type RopePoint, type RopeSimParams } from './ropeSim';

/**
 * Cosmetic Verlet rope rendering for the active grapple (DECISIONS.md #017).
 *
 * Owns a graphics object and a chain of points simulated by {@link stepRope}.
 * Purely visual: it shows the rope sag/swing that the limp-rope physics produces,
 * but never feeds back into the Matter constraint. Inactive (draws nothing) while
 * detached, matching the old straight-line behaviour of being shown only while
 * grappling.
 */
export class RopeVisual {
  private readonly gfx: Phaser.GameObjects.Graphics;
  private points: RopePoint[] = [];
  private active = false;

  // Cosmetic tuning. Not gameplay values (AGENTS "Configuration First" covers
  // gameplay); these shape how the rope looks and are kept local on purpose.
  private static readonly SEGMENTS = 18;
  private static readonly PARAMS: RopeSimParams = { gravity: 0.5, damping: 0.98, iterations: 18 };
  private static readonly COLOR = 0xe6dcc0;
  private static readonly WIDTH = 3;

  constructor(scene: Phaser.Scene, depth: number) {
    this.gfx = scene.add.graphics().setDepth(depth);
  }

  /** Seed a straight chain so the first simulated frame eases out of taut, not a snap. */
  attach(anchor: Point, player: Point): void {
    this.points = seedRope(anchor, player, RopeVisual.SEGMENTS);
    this.active = true;
  }

  detach(): void {
    this.active = false;
    this.points = [];
    this.gfx.clear();
  }

  /**
   * Step the sim with the live endpoints + rope length and redraw. No-op while
   * detached. When `goesLimp` is false the rope is a rigid rod with no slack to
   * show, so it is kept straight instead of sagging (mirrors the physics — see
   * DECISIONS.md #016/#017).
   */
  update(
    anchor: Point,
    player: Point,
    ropeLength: number,
    gravityX: number,
    gravityY: number,
    goesLimp: boolean,
  ): void {
    if (!this.active) {
      return;
    }
    if (goesLimp) {
      stepRope(this.points, anchor, player, ropeLength, gravityX, gravityY, RopeVisual.PARAMS);
    } else {
      straightenRope(this.points, anchor, player);
    }
    this.gfx.clear();
    this.gfx.lineStyle(RopeVisual.WIDTH, RopeVisual.COLOR, 1);
    this.gfx.strokePoints(this.points, false, false);
  }

  destroy(): void {
    this.gfx.destroy();
  }
}
