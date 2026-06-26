import Phaser from 'phaser';
import type { GameConfig } from '../config/types';
import { CollisionFilter } from '../physics/CollisionCategories';
import { hexToInt } from '../core/color';

const PROJECTILE_COLOR = hexToInt('#ffe39e');

/**
 * The in-flight grapple-node projectile. Travels in a straight line
 * (`ignoreGravity`) toward where the player fired, and on contact with terrain
 * either places a node (valid surface) or is rejected (no-node surface).
 *
 * The `dead` flag lets the owning system defer body removal out of Matter's
 * collision callback, which is unsafe to mutate the world from directly.
 */
export class Projectile {
  readonly body: MatterJS.BodyType;
  readonly spawnTime: number;
  /** Marked by GrappleSystem on impact; destroyed on the next update tick. */
  dead = false;

  private readonly view: Phaser.GameObjects.Arc;
  private readonly matter: Phaser.Physics.Matter.MatterPhysics;

  constructor(scene: Phaser.Scene, x: number, y: number, vx: number, vy: number, config: GameConfig) {
    this.matter = scene.matter;
    const radius = config.grapple.projectileRadius;

    this.body = scene.matter.add.circle(x, y, radius, {
      label: 'projectile',
      ignoreGravity: true, // straight-line shot so node placement matches the aim
      frictionAir: 0,
      collisionFilter: { ...CollisionFilter.projectile },
    });
    scene.matter.body.setVelocity(this.body, { x: vx, y: vy });
    this.spawnTime = scene.time.now;

    this.view = scene.add.circle(x, y, radius, PROJECTILE_COLOR).setDepth(6);
  }

  sync(): void {
    this.view.setPosition(this.body.position.x, this.body.position.y);
  }

  destroy(): void {
    this.matter.world.remove(this.body);
    this.view.destroy();
  }
}
