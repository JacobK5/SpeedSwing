import Phaser from 'phaser';
import type { GameConfig } from '../config/types';
import type { Player } from '../entities/Player';

export interface CameraBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Configures a smooth-follow main camera from config.camera. Phaser handles the
 * per-frame interpolation once `startFollow` + lerp are set, so there is no
 * manual update step. The dead zone keeps the camera still during small
 * movements, which reads as calmer during precise platforming.
 *
 * `applyConfig()` re-reads the (mutable) config so the tuning panel can adjust
 * zoom / smoothing / dead zone live.
 */
export class CameraSystem {
  private readonly scene: Phaser.Scene;
  private readonly config: GameConfig;

  constructor(scene: Phaser.Scene, player: Player, config: GameConfig, bounds: CameraBounds) {
    this.scene = scene;
    this.config = config;

    const cam = scene.cameras.main;
    cam.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    cam.startFollow(player.view, false, config.camera.lerp, config.camera.lerp);
    this.applyConfig();
  }

  /** Re-apply zoom, follow smoothing and dead zone from the current config. */
  applyConfig(): void {
    const cam = this.scene.cameras.main;
    const c = this.config.camera;
    cam.setZoom(c.zoom);
    cam.setLerp(c.lerp, c.lerp);
    cam.setDeadzone(c.deadzoneWidth, c.deadzoneHeight);
  }
}
