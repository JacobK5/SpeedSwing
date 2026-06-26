import Phaser from 'phaser';
import { SceneKeys } from './keys';

/**
 * Boot is the first scene. It exists as a dedicated, minimal entry point so that
 * future asset/config preloading has a natural home that runs before any
 * gameplay scene. For now it simply transitions to the menu.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  create(): void {
    this.scene.start(SceneKeys.Menu);
  }
}
