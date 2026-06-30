import Phaser from 'phaser';
import type { GameConfig } from '../config/types';
import { CollisionFilter } from '../physics/CollisionCategories';
import { hexToInt } from '../core/color';

const EXPLOSIVE_COLOR = hexToInt('#ff8c42');

/**
 * An in-flight explosive projectile. Like the grapple projectile it flies in a
 * straight line (`ignoreGravity`) toward the aim point; on terrain contact (or at
 * end of life) the ExplosiveSystem detonates it, destroying nearby destructible
 * terrain. Explosives exist for routing/terrain, not combat (DECISIONS.md #013).
 */
export class Explosive {
  readonly body: MatterJS.BodyType;
  readonly spawnTime: number;
  /** Marked by ExplosiveSystem on detonation; cleaned up on the next update tick. */
  dead = false;

  private readonly view: Phaser.GameObjects.Arc;
  private readonly matter: Phaser.Physics.Matter.MatterPhysics;

  constructor(scene: Phaser.Scene, x: number, y: number, vx: number, vy: number, config: GameConfig) {
    this.matter = scene.matter;
    const radius = config.weapons.explosiveProjectileRadius;

    this.body = scene.matter.add.circle(x, y, radius, {
      label: 'explosive',
      ignoreGravity: true,
      frictionAir: 0,
      collisionFilter: { ...CollisionFilter.projectile },
    });
    scene.matter.body.setVelocity(this.body, { x: vx, y: vy });
    this.spawnTime = scene.time.now;

    this.view = scene.add.circle(x, y, radius, EXPLOSIVE_COLOR).setDepth(6);
  }

  sync(): void {
    this.view.setPosition(this.body.position.x, this.body.position.y);
  }

  destroy(): void {
    this.matter.world.remove(this.body);
    this.view.destroy();
  }
}
