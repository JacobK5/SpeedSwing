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
import { DebugOverlay } from '../systems/DebugOverlay';
import { TuningPanel } from '../systems/TuningPanel';
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
  private camera!: CameraSystem;
  private debug!: DebugOverlay;
  private tuning?: TuningPanel;

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
    this.debug = new DebugOverlay(this, this.config);
    this.camera = new CameraSystem(this, this.player, this.config, this.built.bounds);

    this.applyMatterDebug();

    // Developer tuning panel (dev builds only). Edits mutate the live config;
    // gravity/camera/matter-debug are re-applied via applyLiveConfig.
    if (import.meta.env.DEV) {
      this.tuning = new TuningPanel(this.config, { onChange: () => this.applyLiveConfig() });
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.tuning?.destroy();
        this.tuning = undefined;
      });
    }

    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointerup', this.handlePointerUp, this);

    this.drawControlsHint();
  }

  /** Re-apply config values that are only read at setup (so the tuning panel is live). */
  private applyLiveConfig(): void {
    const p = this.config.physics;
    this.matter.world.setGravity(p.gravityX, p.gravityY, p.gravityScale);
    this.camera.applyConfig();
    this.applyMatterDebug();
  }

  /** Toggle Matter's body debug rendering to match config.debug.matterDebug (live). */
  private applyMatterDebug(): void {
    const world = this.matter.world;
    if (this.config.debug.matterDebug) {
      if (!world.debugGraphic) {
        world.createDebugGraphic();
      }
      world.drawDebug = true;
    } else {
      world.drawDebug = false;
      world.debugGraphic?.clear();
    }
  }

  update(_time: number, delta: number): void {
    if (this.inputManager.justPressed('restart')) {
      this.scene.restart();
      return;
    }

    if (this.inputManager.justPressed('debugToggle')) {
      this.debug.toggle();
    }

    if (this.inputManager.justPressed('tuningToggle')) {
      this.tuning?.toggle();
    }

    const grounded = this.collision.isGrounded(this.player);
    const grappling = this.grapple.isAttached();
    const telemetry = this.movement.update(
      this.player,
      this.inputManager,
      this.config,
      delta,
      grounded,
      grappling,
    );
    this.player.sync();
    this.grapple.update(this.inputManager, delta);

    const cursor = this.inputManager.pointerWorld();
    this.debug.update({
      player: this.player,
      nodes: this.grapple.getNodes(),
      ropeAnchor: this.grapple.getActiveAnchor(),
      ropeLength: this.grapple.getRopeLength(),
      cursor,
      attachTarget: this.grapple.getAttachTarget(cursor.x, cursor.y),
      grounded,
      fps: this.game.loop.actualFps,
      now: this.time.now,
      movement: telemetry,
      grappling,
    });
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const world = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    if (pointer.leftButtonDown()) {
      this.grapple.fire(world.x, world.y);
    } else if (pointer.rightButtonDown()) {
      // Hold-to-grapple: press attaches to the node nearest the cursor.
      this.grapple.attachToNearest(world.x, world.y);
    }
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    // Hold-to-grapple: releasing the right button detaches.
    if (pointer.rightButtonReleased()) {
      this.grapple.release();
    }
  }

  private drawControlsHint(): void {
    this.add
      .text(
        12,
        12,
        'A/D move   SPACE jump   LMB place node   RMB hold to grapple   W/S rope   R restart   ` debug   T tune',
        {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#8a93a6',
        },
      )
      .setScrollFactor(0)
      .setDepth(1000);
  }
}
