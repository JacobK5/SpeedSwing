import Phaser from 'phaser';
import type { GameConfig } from '../config/types';
import type { Player } from '../entities/Player';
import type { DestructiblePiece, SurfaceInfo } from './LevelBuilder';
import { Explosive } from '../entities/Explosive';
import { isTerrainLabel } from '../physics/CollisionCategories';
import { hexToInt } from '../core/color';
import { rectOverlapsCircle, type Circle } from './regionChecks';

/**
 * Owns explosive projectiles and their detonation. Firing launches a projectile
 * toward the cursor; on terrain contact (or at end of life) it detonates,
 * removing destructible terrain within the configured radius and optionally
 * knocking the player back (explosionPlayerForce, default 0 = off).
 *
 * Destroyed terrain stays gone for the rest of the run; restarting rebuilds the
 * level fresh, so destruction resets cleanly with no per-run bookkeeping
 * (docs/05-level-format.md). Ammo is gated by the caller (WeaponSystem).
 */
export class ExplosiveSystem {
  private readonly explosives: Explosive[] = [];
  private readonly explosiveByBodyId = new Map<number, Explosive>();
  private readonly pendingDetonations: { x: number; y: number }[] = [];

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly config: GameConfig,
    private readonly destructibles: DestructiblePiece[],
    private readonly surfaceByBodyId: Map<number, SurfaceInfo>,
  ) {
    scene.matter.world.on('collisionstart', this.handleCollision, this);
  }

  /** Launch an explosive projectile from the player toward a world point. */
  fire(targetX: number, targetY: number): void {
    const from = this.player.position;
    const angle = Math.atan2(targetY - from.y, targetX - from.x);
    const speed = this.config.weapons.explosiveProjectileSpeed;
    const explosive = new Explosive(
      this.scene,
      from.x,
      from.y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      this.config,
    );
    this.explosives.push(explosive);
    this.explosiveByBodyId.set(explosive.body.id, explosive);
  }

  update(): void {
    const now = this.scene.time.now;
    const lifetimeMs = this.config.weapons.explosiveProjectileLifetime * 1000;

    // Process detonations queued from collision callbacks (safe to mutate world here).
    for (const point of this.pendingDetonations) {
      this.detonate(point.x, point.y);
    }
    this.pendingDetonations.length = 0;

    for (const explosive of [...this.explosives]) {
      if (explosive.dead) {
        this.cleanup(explosive);
        continue;
      }
      if (now - explosive.spawnTime > lifetimeMs) {
        // Air burst at end of life.
        this.detonate(explosive.body.position.x, explosive.body.position.y);
        explosive.dead = true;
        this.cleanup(explosive);
        continue;
      }
      explosive.sync();
    }
  }

  /** Destroy destructible terrain within range, flash, and optionally knock back the player. */
  private detonate(x: number, y: number): void {
    const w = this.config.weapons;
    const blast: Circle = { x, y, radius: w.explosionRadius };

    for (const piece of this.destructibles) {
      if (piece.destroyed) {
        continue;
      }
      if (rectOverlapsCircle(piece.bounds, blast)) {
        piece.destroyed = true;
        this.surfaceByBodyId.delete(piece.body.id);
        this.scene.matter.world.remove(piece.body);
        piece.view.destroy();
      }
    }

    if (w.explosionPlayerForce > 0) {
      this.applyKnockback(blast);
    }

    this.flash(x, y, w.explosionRadius);
  }

  /** Push the player away from the blast, scaled by closeness (0 at the edge). */
  private applyKnockback(blast: Circle): void {
    const pos = this.player.position;
    const dx = pos.x - blast.x;
    const dy = pos.y - blast.y;
    const dist = Math.hypot(dx, dy);
    if (dist > blast.radius) {
      return;
    }
    const falloff = blast.radius > 0 ? 1 - dist / blast.radius : 1;
    const impulse = this.config.weapons.explosionPlayerForce * falloff;
    // Straight up when standing exactly on the blast, otherwise radially outward.
    const nx = dist === 0 ? 0 : dx / dist;
    const ny = dist === 0 ? -1 : dy / dist;
    const v = this.player.velocity;
    this.player.setVelocity(v.x + nx * impulse, v.y + ny * impulse);
  }

  private flash(x: number, y: number, radius: number): void {
    const ring = this.scene.add.circle(x, y, radius, hexToInt('#ff8c42'), 0.35).setDepth(7);
    this.scene.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.25,
      duration: 220,
      onComplete: () => ring.destroy(),
    });
  }

  private handleCollision(event: Phaser.Physics.Matter.Events.CollisionStartEvent): void {
    for (const pair of event.pairs) {
      const explosive =
        this.explosiveByBodyId.get(pair.bodyA.id) ?? this.explosiveByBodyId.get(pair.bodyB.id);
      if (!explosive || explosive.dead) {
        continue;
      }
      const other = this.explosiveByBodyId.has(pair.bodyA.id) ? pair.bodyB : pair.bodyA;
      if (!isTerrainLabel(other.label)) {
        continue;
      }
      // Defer the actual detonation to update(): mutating the Matter world from
      // inside a collision callback is unsafe.
      const contact = pair.contacts && pair.contacts.length > 0 ? pair.contacts[0] : null;
      const point = contact ?? explosive.body.position;
      this.pendingDetonations.push({ x: point.x, y: point.y });
      explosive.dead = true;
    }
  }

  private cleanup(explosive: Explosive): void {
    explosive.destroy();
    this.explosiveByBodyId.delete(explosive.body.id);
    const index = this.explosives.indexOf(explosive);
    if (index >= 0) {
      this.explosives.splice(index, 1);
    }
  }
}
