import Phaser from 'phaser';
import { SceneKeys } from './keys';
import { loadGameConfig } from '../config/loadConfig';
import { loadLevel, DEFAULT_LEVEL } from '../levels/loadLevel';

/**
 * The single gameplay scene.
 *
 * Phase 0: proves the configuration and level pipelines load end-to-end and
 * renders a summary. Phase 1 replaces this body with the actual movement
 * sandbox, reusing the same config/level loading shown here.
 */
export class LevelScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Level);
  }

  create(): void {
    const { width, height } = this.scale;

    try {
      const config = loadGameConfig();
      const level = loadLevel(DEFAULT_LEVEL, config);

      const lines = [
        'CONFIG + LEVEL LOADED',
        '',
        `level: ${level.metadata.name} (format v${level.formatVersion})`,
        `geometry pieces: ${level.geometry.length}`,
        `surface types: ${Object.keys(config.surfaces).join(', ')}`,
        `gravityY: ${config.physics.gravityY}   maxRunSpeed: ${config.movement.maxRunSpeed}`,
        `jumpVelocity: ${config.movement.jumpVelocity}   rope: ${config.grapple.minLength}..${config.grapple.maxLength}`,
        '',
        'Movement sandbox arrives in Phase 1.',
      ];

      this.add
        .text(width / 2, height / 2, lines, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#e8eaf0',
          align: 'center',
          lineSpacing: 6,
        })
        .setOrigin(0.5);
    } catch (error) {
      this.add
        .text(width / 2, height / 2, `Failed to load level:\n${(error as Error).message}`, {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#ff8a8a',
          align: 'center',
        })
        .setOrigin(0.5);
    }
  }
}
