import Phaser from 'phaser';
import { SceneKeys } from './keys';
import { loadGameConfig } from '../config/loadConfig';
import { loadLevel, DEFAULT_LEVEL, isKnownLevel } from '../levels/loadLevel';
import type { GameConfig } from '../config/types';
import type { LevelData } from '../levels/types';
import { Player } from '../entities/Player';
import { InputManager } from '../core/InputManager';
import { CollisionSystem } from '../systems/CollisionSystem';
import { MovementSystem } from '../systems/MovementSystem';
import { CameraSystem } from '../systems/CameraSystem';
import { GrappleSystem } from '../systems/GrappleSystem';
import { ExplosiveSystem } from '../systems/ExplosiveSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { Resources, type AmmoCounts } from '../systems/Resources';
import { TimerSystem } from '../systems/TimerSystem';
import { Hud } from '../systems/Hud';
import { CenterPanel } from '../systems/CenterPanel';
import { DebugOverlay } from '../systems/DebugOverlay';
import { TuningPanel } from '../systems/TuningPanel';
import { buildLevel, type BuiltLevel } from '../systems/LevelBuilder';
import { rectsOverlap, rectOverlapsCircle, type Rect } from '../systems/regionChecks';
import { formatTime, formatDelta } from '../systems/timeFormat';
import { loadBest, recordRun } from '../systems/personalBest';

interface LevelSceneData {
  levelId?: string;
}

type TriggerResult = 'none' | 'kill' | 'goal';

/**
 * The gameplay scene: loads config + level, builds the world, and runs the
 * full prototype loop — movement sandbox plus the Phase 4 systems (speedrun
 * timer, goal completion, kill-zone restart, ammo-limited weapons, explosives /
 * destructible terrain). Restart (R) re-runs create() for a clean, instant reset,
 * which also clears placed nodes and rebuilds destroyed terrain (DECISIONS.md #003).
 */
export class LevelScene extends Phaser.Scene {
  private levelId = DEFAULT_LEVEL;
  private config!: GameConfig;
  private level!: LevelData;
  private built!: BuiltLevel;
  private player!: Player;
  private inputManager!: InputManager;
  private collision!: CollisionSystem;
  private movement!: MovementSystem;
  private grapple!: GrappleSystem;
  private explosives!: ExplosiveSystem;
  private weapon!: WeaponSystem;
  private resources!: Resources;
  private timer!: TimerSystem;
  private hud!: Hud;
  private panel!: CenterPanel;
  private camera!: CameraSystem;
  private debug!: DebugOverlay;
  private tuning?: TuningPanel;

  private startAmmo!: AmmoCounts;
  private best: number | null = null;
  private finished = false;
  private paused = false;
  private pauseStartedAt = 0;
  private pausedAccumMs = 0;

  constructor() {
    super(SceneKeys.Level);
  }

  init(data: LevelSceneData): void {
    if (data.levelId && isKnownLevel(data.levelId)) {
      this.levelId = data.levelId;
    }
  }

  create(): void {
    this.config = loadGameConfig();
    this.level = loadLevel(this.levelId, this.config);

    this.finished = false;
    this.paused = false;
    this.pausedAccumMs = 0;
    this.matter.world.enabled = true;

    this.cameras.main.setBackgroundColor(this.level.theme?.background ?? '#14161c');

    const physics = this.config.physics;
    this.matter.world.setGravity(physics.gravityX, physics.gravityY, physics.gravityScale);

    this.built = buildLevel(this, this.level, this.config);

    this.startAmmo = {
      grappleNodes: this.level.resources?.grappleNodes ?? this.config.weapons.defaultGrappleAmmo,
      explosives: this.level.resources?.explosives ?? this.config.weapons.defaultExplosiveAmmo,
    };
    this.resources = new Resources(this.startAmmo);

    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y, this.config);
    this.inputManager = new InputManager(this);
    this.collision = new CollisionSystem(this);
    this.movement = new MovementSystem();
    this.grapple = new GrappleSystem(this, this.player, this.config, this.built.surfaceByBodyId);
    this.explosives = new ExplosiveSystem(
      this,
      this.player,
      this.config,
      this.built.destructibles,
      this.built.surfaceByBodyId,
    );
    this.weapon = new WeaponSystem(this.grapple, this.explosives, this.resources);
    this.timer = new TimerSystem();
    this.hud = new Hud(this);
    this.panel = new CenterPanel(this);
    this.debug = new DebugOverlay(this, this.config);
    this.camera = new CameraSystem(this, this.player, this.config, this.built.bounds);
    this.best = loadBest(this.levelId);

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

  /** Game clock with paused time removed, so pausing never inflates a run. */
  private gameNow(): number {
    return this.time.now - this.pausedAccumMs;
  }

  update(_time: number, delta: number): void {
    const input = this.inputManager;

    // Restart always works, from any state, for an instant retry loop.
    if (input.justPressed('restart')) {
      this.scene.restart({ levelId: this.levelId });
      return;
    }

    // Developer toggles are allowed in any state.
    if (input.justPressed('debugToggle')) {
      this.debug.toggle();
    }
    if (input.justPressed('tuningToggle')) {
      this.tuning?.toggle();
    }

    if (this.finished) {
      if (input.justPressed('pause')) {
        this.exitToLevelSelect();
      }
      return;
    }

    if (input.justPressed('pause')) {
      this.togglePause();
    }
    if (this.paused) {
      return;
    }

    if (input.justPressed('selectGrapple')) {
      this.weapon.select('grapple');
    }
    if (input.justPressed('selectExplosive')) {
      this.weapon.select('explosive');
    }

    this.startTimerIfMoving();

    const grounded = this.collision.isGrounded(this.player);
    const grappling = this.grapple.isAttached();
    const telemetry = this.movement.update(this.player, input, this.config, delta, grounded, grappling);
    this.player.sync();
    this.grapple.update(input, delta);
    this.explosives.update();

    const trigger = this.evaluateTriggers();
    if (trigger === 'kill') {
      this.scene.restart({ levelId: this.levelId });
      return;
    }
    if (trigger === 'goal') {
      this.complete();
    }

    this.hud.update({
      timeMs: this.timer.elapsed(this.gameNow()),
      best: this.best,
      ammo: this.resources.snapshot(),
      selected: this.weapon.selectedWeapon,
    });

    const cursor = input.pointerWorld();
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

  /** Player's world-space axis-aligned bounding box for trigger overlap tests. */
  private playerRect(): Rect {
    const b = this.player.body.bounds;
    return { x: b.min.x, y: b.min.y, width: b.max.x - b.min.x, height: b.max.y - b.min.y };
  }

  /** Check goal and kill-zone overlap this frame. */
  private evaluateTriggers(): TriggerResult {
    const rect = this.playerRect();
    for (const kz of this.built.killzones) {
      if (rectsOverlap(rect, kz)) {
        return 'kill';
      }
    }
    if (rectOverlapsCircle(rect, this.built.goal)) {
      return 'goal';
    }
    return 'none';
  }

  /** Begin timing as soon as the player first commits to moving. */
  private startTimerIfMoving(): void {
    if (this.timer.started) {
      return;
    }
    const i = this.inputManager;
    if (i.isDown('left') || i.isDown('right') || i.justPressed('jump')) {
      this.timer.start(this.gameNow());
    }
  }

  private complete(): void {
    this.timer.stop(this.gameNow());
    this.finished = true;
    this.matter.world.enabled = false; // freeze the world behind the panel

    const finalMs = this.timer.elapsed(this.gameNow());
    const previousBest = this.best;
    const result = recordRun(this.levelId, finalMs);
    this.best = result.best;

    const usedNodes = this.startAmmo.grappleNodes - this.resources.get('grappleNodes');
    const usedExpl = this.startAmmo.explosives - this.resources.get('explosives');
    const bestLine =
      previousBest === null
        ? `best   ${formatTime(result.best)}   (first run)`
        : `best   ${formatTime(result.best)}   (${formatDelta(finalMs - previousBest)})`;

    this.panel.show({
      title: result.isNewBest ? 'NEW BEST!' : 'FINISHED',
      titleColor: result.isNewBest ? '#6ee7a8' : '#e8eaf0',
      lines: [
        `time   ${formatTime(finalMs)}`,
        bestLine,
        `nodes used ${usedNodes}    explosives used ${usedExpl}`,
      ],
      hint: 'R restart    ESC level select',
    });
  }

  private togglePause(): void {
    if (!this.paused) {
      this.paused = true;
      this.pauseStartedAt = this.time.now;
      this.matter.world.enabled = false;
      this.panel.show({
        title: 'PAUSED',
        lines: ['', 'The run clock is paused.'],
        hint: 'ESC resume    R restart    1/2 weapon',
      });
    } else {
      this.pausedAccumMs += this.time.now - this.pauseStartedAt;
      this.paused = false;
      this.matter.world.enabled = true;
      this.panel.hide();
    }
  }

  private exitToLevelSelect(): void {
    this.scene.start(SceneKeys.LevelSelect);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.paused || this.finished) {
      return;
    }
    const world = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    if (pointer.leftButtonDown()) {
      // Fire the selected weapon (consumes ammo; no-op when empty).
      if (this.weapon.fire(world.x, world.y)) {
        this.timer.start(this.gameNow());
      }
    } else if (pointer.rightButtonDown()) {
      // Hold-to-grapple: press attaches to the node nearest the cursor.
      this.grapple.attachToNearest(world.x, world.y);
      this.timer.start(this.gameNow());
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
        'A/D move  SPACE jump  1/2 weapon  LMB fire  RMB hold grapple  W/S rope  R restart  ESC pause  ` debug  T tune',
        {
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#8a93a6',
        },
      )
      .setScrollFactor(0)
      .setDepth(1000);
  }
}
