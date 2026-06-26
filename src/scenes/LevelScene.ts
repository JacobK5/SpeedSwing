import Phaser from 'phaser';
import { SceneKeys } from './keys';
import { loadGameConfig } from '../config/loadConfig';
import { loadLevel, DEFAULT_LEVEL } from '../levels/loadLevel';
import type { GameConfig } from '../config/types';
import type { LevelData } from '../levels/types';
import { Player } from '../entities/Player';
import { InputManager } from '../core/InputManager';
import { CollisionSystem } from '../systems/CollisionSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { CameraSystem } from '../systems/CameraSystem';
import { GrappleSystem } from '../systems/GrappleSystem';
import { buildLevel, type BuiltLevel } from '../systems/LevelBuilder';

/**
 * The gameplay scene: loads config + level, builds the world, and runs the
 * movement sandbox. Restart (R) re-runs create() for a clean, instant reset —
 * which also clears any grapple nodes placed during the run (DECISIONS.md #003).
 */
export class LevelScene extends Phaser.Scene {
  private config!: GameConfig;
  private level!: LevelData;
  private built!: BuiltLevel;
  private player!: Player;
  private inputManager!: InputManager;
  private collision!: CollisionSystem;
  private movement!: MovementSystem;
  private grapple!: GrappleSystem;

  constructor() {
    super(SceneKeys.Level);
  }

  create(): void {
    this.config = loadGameConfig();
    this.level = loadLevel(DEFAULT_LEVEL, this.config);

    this.cameras.main.setBackgroundColor(this.level.theme?.background ?? '#14161c');

    const physics = this.config.physics;
    this.matter.world.setGravity(physics.gravityX, physics.gravityY, physics.gravityScale);

    this.built = buildLevel(this, this.level, this.config);

    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y, this.config);
    this.inputManager = new InputManager(this);
    this.collision = new CollisionSystem(this);
    this.movement = new MovementSystem();
    this.grapple = new GrappleSystem(this, this.player, this.config, this.built.surfaceByBodyId);
    new CameraSystem(this, this.player, this.config, this.built.bounds);

    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', this.handlePointerDown, this);

    this.drawControlsHint();
  }

  update(_time: number, delta: number): void {
    if (this.inputManager.justPressed('restart')) {
      this.scene.restart();
      return;
    }

    const grounded = this.collision.isGrounded(this.player);
    this.movement.update(this.player, this.inputManager, this.config, delta, grounded);
    this.player.sync();
    this.grapple.update();
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const world = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    if (pointer.leftButtonDown()) {
      this.grapple.fire(world.x, world.y);
    }
  }

  private drawControlsHint(): void {
    this.add
      .text(12, 12, 'A / D  move    SPACE  jump    LMB  place node    R  restart', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#8a93a6',
      })
      .setScrollFactor(0)
      .setDepth(1000);
  }
}
