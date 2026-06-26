import Phaser from 'phaser';
import { SceneKeys } from './keys';
import { GAME_VERSION } from '../core/version';

/**
 * Minimal title screen. Movement is the game, so the menu deliberately gets out
 * of the way: a single key/click drops the player straight into the level.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    this.add
      .text(centerX, height * 0.4, 'BROWSER GRAPPLING GAME', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '40px',
        color: '#e8eaf0',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, height * 0.5, 'Movement Prototype', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        color: '#8a93a6',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, height * 0.62, 'Press SPACE or click to start', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: '#9ecbff',
      })
      .setOrigin(0.5);

    this.add
      .text(width - 12, height - 12, `v${GAME_VERSION}`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#5b6477',
      })
      .setOrigin(1, 1);

    const start = () => this.scene.start(SceneKeys.Level);
    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);
  }
}
