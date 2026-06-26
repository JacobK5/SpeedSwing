import Phaser from 'phaser';
import { SceneKeys } from './keys';

/**
 * The single gameplay scene. In Phase 0 this is only a placeholder that proves
 * scene management works; Phase 1 replaces the body with the movement sandbox.
 */
export class LevelScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Level);
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'Level Scene — gameplay arrives in Phase 1', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '22px',
        color: '#e8eaf0',
      })
      .setOrigin(0.5);
  }
}
