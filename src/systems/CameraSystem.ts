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
 */
export class CameraSystem {
  constructor(scene: Phaser.Scene, player: Player, config: GameConfig, bounds: CameraBounds) {
    const cam = scene.cameras.main;
    const c = config.camera;

    cam.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    cam.setZoom(c.zoom);
    cam.startFollow(player.view, false, c.lerp, c.lerp);
    cam.setDeadzone(c.deadzoneWidth, c.deadzoneHeight);
  }
}
