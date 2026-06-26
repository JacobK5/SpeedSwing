import Phaser from 'phaser';
import { hexToInt, darken } from '../core/color';

const NODE_COLOR = hexToInt('#ffd166');

/**
 * A permanently placed grapple anchor. Once created it stays for the rest of the
 * level — nodes are never auto-removed (DECISIONS.md #003). They are cleared only
 * when the level restarts (which rebuilds the scene).
 *
 * A node is pure data + a marker: the rope attaches to its world coordinate via a
 * Matter world-constraint, so the node needs no physics body of its own.
 */
export class GrappleNode {
  readonly x: number;
  readonly y: number;
  private readonly marker: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;
    this.marker = scene.add
      .circle(x, y, 7, NODE_COLOR)
      .setStrokeStyle(2, darken(NODE_COLOR, 0.5))
      .setDepth(5);
  }

  destroy(): void {
    this.marker.destroy();
  }
}
