import Phaser from 'phaser';
import type { GameConfig } from '../config/types';
import type { Player } from '../entities/Player';
import { hexToInt } from '../core/color';

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

const VELOCITY_DRAW_SCALE = 8;

/**
 * Toggleable developer visualisation (backtick key). Draws the rope, placed
 * nodes, the cursor attach radius and the player's velocity vector in world
 * space, plus a fixed text panel of live state — enough to understand grapple
 * and movement behaviour while tuning (docs/04-physics-tuning.md "Debug").
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

    if (d.drawAttachRadius) {
      this.gfx.lineStyle(1, hexToInt('#3a6ea5'), 0.8);
      this.gfx.strokeCircle(ctx.cursor.x, ctx.cursor.y, this.config.grapple.attachRadius);
    }

    if (d.drawNodes) {
      this.gfx.lineStyle(2, hexToInt('#ffd166'), 0.9);
      for (const node of ctx.nodes) {
        this.gfx.strokeCircle(node.x, node.y, 12);
      }
    }

    if (d.drawRope && ctx.ropeAnchor) {
      this.gfx.lineStyle(2, hexToInt('#ffe39e'), 1);
      this.gfx.lineBetween(pos.x, pos.y, ctx.ropeAnchor.x, ctx.ropeAnchor.y);
    }

    if (d.drawVelocity) {
      const v = ctx.player.velocity;
      this.gfx.lineStyle(2, hexToInt('#6ee7a8'), 1);
      this.gfx.lineBetween(pos.x, pos.y, pos.x + v.x * VELOCITY_DRAW_SCALE, pos.y + v.y * VELOCITY_DRAW_SCALE);
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
