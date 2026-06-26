import Phaser from 'phaser';
import type { GameConfig } from '../config/types';
import type { Player } from '../entities/Player';
import type { SurfaceInfo } from './LevelBuilder';
import { GrappleNode } from '../entities/GrappleNode';
import { Projectile } from '../entities/Projectile';
import { isTerrainLabel } from '../physics/CollisionCategories';
import { hexToInt } from '../core/color';

/**
 * Owns grapple-node projectiles and the permanent nodes they create.
 *
 * Firing (left mouse) launches a projectile toward the cursor. On terrain
 * contact it places a node on valid surfaces, or is rejected on no-node
 * surfaces (DECISIONS.md #003; docs/03-core-mechanics.md). Rope attachment and
 * length control are added on top of this in a later step.
 */
export class GrappleSystem {
  private readonly nodes: GrappleNode[] = [];
  private readonly projectiles: Projectile[] = [];
  private readonly projectileByBodyId = new Map<number, Projectile>();

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly config: GameConfig,
    private readonly surfaceByBodyId: Map<number, SurfaceInfo>,
  ) {
    scene.matter.world.on('collisionstart', this.handleCollision, this);
  }

  /** Read-only view of placed nodes (used by debug visualisation). */
  getNodes(): readonly GrappleNode[] {
    return this.nodes;
  }

  get nodeCount(): number {
    return this.nodes.length;
  }

  /** Fire a grapple-node projectile from the player toward a world point. */
  fire(targetX: number, targetY: number): void {
    const from = this.player.position;
    const angle = Math.atan2(targetY - from.y, targetX - from.x);
    const speed = this.config.grapple.projectileSpeed;
    const projectile = new Projectile(
      this.scene,
      from.x,
      from.y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      this.config,
    );
    this.projectiles.push(projectile);
    this.projectileByBodyId.set(projectile.body.id, projectile);
  }

  /** Place a permanent grapple node. Nodes are never auto-removed (DECISIONS.md #003). */
  placeNode(x: number, y: number): GrappleNode {
    const node = new GrappleNode(this.scene, x, y);
    this.nodes.push(node);
    return node;
  }

  update(): void {
    const now = this.scene.time.now;
    const lifetimeMs = this.config.grapple.projectileLifetime * 1000;

    for (const projectile of [...this.projectiles]) {
      if (projectile.dead || now - projectile.spawnTime > lifetimeMs) {
        this.destroyProjectile(projectile);
        continue;
      }
      projectile.sync();
    }
  }

  private handleCollision(event: Phaser.Physics.Matter.Events.CollisionStartEvent): void {
    for (const pair of event.pairs) {
      const projectile =
        this.projectileByBodyId.get(pair.bodyA.id) ?? this.projectileByBodyId.get(pair.bodyB.id);
      if (!projectile || projectile.dead) {
        continue;
      }

      const terrainBody = this.projectileByBodyId.has(pair.bodyA.id) ? pair.bodyB : pair.bodyA;
      if (!isTerrainLabel(terrainBody.label)) {
        continue;
      }

      // Resolve the hit but defer body removal to update(); mutating the Matter
      // world from inside a collision callback is unsafe.
      const info = this.surfaceByBodyId.get(terrainBody.id);
      const { x, y } = projectile.body.position;
      if (info && info.def.canPlaceNode) {
        this.placeNode(x, y);
      } else {
        this.flashReject(x, y);
      }
      projectile.dead = true;
    }
  }

  /** Brief red pulse showing a node could not be placed on this surface. */
  private flashReject(x: number, y: number): void {
    const marker = this.scene.add.circle(x, y, 10, hexToInt('#ff6b6b'), 0.6).setDepth(6);
    this.scene.tweens.add({
      targets: marker,
      alpha: 0,
      scale: 1.8,
      duration: 250,
      onComplete: () => marker.destroy(),
    });
  }

  private destroyProjectile(projectile: Projectile): void {
    projectile.destroy();
    this.projectileByBodyId.delete(projectile.body.id);
    const index = this.projectiles.indexOf(projectile);
    if (index >= 0) {
      this.projectiles.splice(index, 1);
    }
  }
}
