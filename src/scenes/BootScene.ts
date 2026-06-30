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
    // Dev-only entry to the level editor via the `?editor` URL flag, so it stays
    // out of the normal player flow and out of release builds' reachable paths.
    if (import.meta.env.DEV && this.editorRequested()) {
      this.scene.start(SceneKeys.Editor);
      return;
    }
    this.scene.start(SceneKeys.Menu);
  }

  private editorRequested(): boolean {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.has('editor') || params.get('level') === 'editor';
    } catch {
      return false;
    }
  }
}
