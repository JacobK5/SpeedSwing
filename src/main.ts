import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { LevelScene } from './scenes/LevelScene';
import { EditorScene } from './editor/EditorScene';

// Top-level Phaser bootstrap.
//
// Only engine-level concerns live here (renderer, scaling, physics engine).
// All *gameplay* values are loaded from JSON config at runtime (see
// src/config) — nothing tunable should be hard-coded in this file.
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#14161c',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: '100%',
    height: '100%',
  },
  physics: {
    default: 'matter',
    matter: {
      // World gravity is intentionally zero here; LevelScene applies the
      // configured gravity once physics.json has been loaded.
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, LevelSelectScene, LevelScene, EditorScene],
};

export const game = new Phaser.Game(config);

// Expose the running game during development for debugging and automated checks.
if (import.meta.env.DEV) {
  (globalThis as typeof globalThis & { __GAME__?: Phaser.Game }).__GAME__ = game;
}
