import Phaser from 'phaser';
import type { GameConfig } from '../config/types';
import type { Player } from '../entities/Player';
import { hexToInt } from '../core/color';
import { findNearestNode } from './grappleMath';

/** Everything the overlay needs to render one frame of debug visualisation. */
export interface DebugContext {
  player: Player;
  nodes: readonly { x: number; y: number }[];
  ropeAnchor: { x: number; y: number } | null;
  ropeLength: number | null;
  cursor: { x: number; y: number };
  grounded: boolean;
  fps: number;
}

/**
 * Toggleable developer visualisation (backtick key). Draws the rope, placed
 * nodes, a line to the node that a grab would target (nearest to the cursor) and
 * the player's velocity vector in world space, plus a fixed text panel of live
 * state — enough to understand grapple and movement behaviour while tuning
 * (docs/04-physics-tuning.md "Debug").
 */
export class DebugOverlay {
  enabled: boolean;

  private readonly config: GameConfig;
  private readonly gfx: Phaser.GameObjects.Graphics;
  private readonly text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, config: GameConfig) {
    this.config = config;
    this.enabled = config.debug.startEnabled;

    this.gfx = scene.add.graphics().setDepth(900);
    this.text = scene.add
      .text(12, 36, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#9ad1ff',
        backgroundColor: '#000000aa',
      })
      .setScrollFactor(0)
      .setPadding(6, 4, 6, 4)
      .setDepth(1001);

    this.applyVisibility();
  }

  toggle(): void {
    this.enabled = !this.enabled;
    this.applyVisibility();
  }

  update(ctx: DebugContext): void {
    this.gfx.clear();
    if (!this.enabled) {
      return;
    }

    const d = this.config.debug;
    const pos = ctx.player.position;

    if (d.drawNodes) {
      this.gfx.lineStyle(2, hexToInt('#ffd166'), 0.9);
      for (const node of ctx.nodes) {
        this.gfx.strokeCircle(node.x, node.y, 12);
      }
    }

    // The node a grab would target (nearest to the cursor) + a line to it.
    if (d.drawAttachTarget) {
      const target = findNearestNode(ctx.nodes, ctx.cursor);
      if (target) {
        this.gfx.lineStyle(1, hexToInt('#3a6ea5'), 0.7);
        this.gfx.lineBetween(ctx.cursor.x, ctx.cursor.y, target.x, target.y);
        this.gfx.lineStyle(2, hexToInt('#9ad1ff'), 0.9);
        this.gfx.strokeCircle(target.x, target.y, 16);
      }
    }

    if (d.drawRope && ctx.ropeAnchor) {
      this.gfx.lineStyle(2, hexToInt('#ffe39e'), 1);
      this.gfx.lineBetween(pos.x, pos.y, ctx.ropeAnchor.x, ctx.ropeAnchor.y);
    }

    if (d.drawVelocity) {
      const v = ctx.player.velocity;
      const scale = d.velocityDrawScale;
      this.gfx.lineStyle(2, hexToInt('#6ee7a8'), 1);
      this.gfx.lineBetween(pos.x, pos.y, pos.x + v.x * scale, pos.y + v.y * scale);
    }

    if (d.showOverlay) {
      const v = ctx.player.velocity;
      const speed = Math.hypot(v.x, v.y);
      this.text.setText([
        `fps:      ${ctx.fps.toFixed(0)}`,
        `pos:      ${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}`,
        `vel:      ${v.x.toFixed(2)}, ${v.y.toFixed(2)}`,
        `speed:    ${speed.toFixed(2)}`,
        `grounded: ${ctx.grounded}`,
        `nodes:    ${ctx.nodes.length}`,
        `rope:     ${ctx.ropeAnchor ? `attached (len ${ctx.ropeLength?.toFixed(0)})` : 'detached'}`,
      ]);
    }
  }

  private applyVisibility(): void {
    this.text.setVisible(this.enabled && this.config.debug.showOverlay);
    if (!this.enabled) {
      this.gfx.clear();
    }
  }
}
