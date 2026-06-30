import Phaser from 'phaser';
import type { GameConfig } from '../config/types';
import type { Player } from '../entities/Player';
import type { InputManager } from '../core/InputManager';
import type { SurfaceInfo } from './LevelBuilder';
import { GrappleNode } from '../entities/GrappleNode';
import { Projectile } from '../entities/Projectile';
import { Rope } from '../physics/Rope';
import { isTerrainLabel } from '../physics/CollisionCategories';
import { hexToInt } from '../core/color';
import { findAttachTarget, computeRopeLength, clamp, resolveImpactPoint } from './grappleMath';

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

  private rope: Rope | null = null;
  private attachedNode: GrappleNode | null = null;
  /** Always-on rope line so the player can see what they are swinging from. */
  private readonly ropeGfx: Phaser.GameObjects.Graphics;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: Player,
    private readonly config: GameConfig,
    private readonly surfaceByBodyId: Map<number, SurfaceInfo>,
  ) {
    // Depth 8: above nodes/projectiles, below the player (depth 10), so the rope
    // reads as attaching at the node and running under the player box.
    this.ropeGfx = scene.add.graphics().setDepth(8);
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

  update(input: InputManager, deltaMs: number): void {
    const now = this.scene.time.now;
    const lifetimeMs = this.config.grapple.projectileLifetime * 1000;

    for (const projectile of [...this.projectiles]) {
      if (projectile.dead || now - projectile.spawnTime > lifetimeMs) {
        this.destroyProjectile(projectile);
        continue;
      }
      projectile.sync();
    }

    if (this.rope) {
      const g = this.config.grapple;
      this.rope.length = computeRopeLength(
        this.rope.length,
        input.isDown('ropeRetract'),
        input.isDown('ropeExtend'),
        g.retractSpeed,
        g.extendSpeed,
        deltaMs / 1000,
        g.minLength,
        g.maxLength,
      );
      // Re-evaluate tension after any length change: a limp rope exerts no force
      // while slack and only pulls once taut (DECISIONS.md #016).
      this.rope.update(g.ropeGoesLimp);
    }

    this.drawRope();
  }

  /**
   * Draw the rope line whenever attached, regardless of debug state — you must be
   * able to see what you are swinging from to control rope length and arcs. The
   * debug overlay's rope is a separate diagnostic; this is the gameplay visual.
   */
  private drawRope(): void {
    this.ropeGfx.clear();
    if (this.rope && this.attachedNode) {
      const from = this.player.position;
      this.ropeGfx.lineStyle(3, hexToInt('#e6dcc0'), 1);
      this.ropeGfx.lineBetween(from.x, from.y, this.attachedNode.x, this.attachedNode.y);
    }
  }

  // --- Rope attachment ---

  /**
   * The node a grab would attach to from the given cursor position, or null if
   * nothing is in reach. Shared by attachToNearest and the debug preview so they
   * always agree.
   */
  getAttachTarget(cursorX: number, cursorY: number): GrappleNode | null {
    const g = this.config.grapple;
    // Cap the reach at the rope's max length: attaching to a node farther than
    // maxLength would force a rope shorter than the current distance and yank the
    // player. Validation also enforces maxAttachDistance <= maxLength, so this is
    // a belt-and-braces guard for live tuning.
    const reach = Math.min(g.maxAttachDistance, g.maxLength);
    return findAttachTarget(this.nodes, { x: cursorX, y: cursorY }, this.player.position, reach);
  }

  /**
   * Attach to the node nearest the cursor that is within reach (hold-to-grapple:
   * called on right-mouse press). Any existing rope is replaced.
   */
  attachToNearest(cursorX: number, cursorY: number): void {
    const target = this.getAttachTarget(cursorX, cursorY);
    if (!target) {
      return;
    }
    if (this.rope) {
      this.release();
    }
    this.attach(target);
  }

  release(): void {
    if (!this.rope) {
      return;
    }
    this.rope.destroy();
    this.rope = null;
    this.attachedNode = null;
  }

  isAttached(): boolean {
    return this.rope !== null;
  }

  /** World position of the current rope anchor, or null when detached (debug viz). */
  getActiveAnchor(): { x: number; y: number } | null {
    return this.attachedNode ? { x: this.attachedNode.x, y: this.attachedNode.y } : null;
  }

  getRopeLength(): number | null {
    return this.rope ? this.rope.length : null;
  }

  private attach(node: GrappleNode): void {
    const g = this.config.grapple;
    const from = this.player.position;
    const distance = Math.hypot(node.x - from.x, node.y - from.y);
    // Start at the current distance so attaching never yanks. Targets are always
    // within reach (<= maxLength), so the clamp resolves to max(minLength,
    // distance) and is never shorter than the current distance.
    const length = clamp(distance, g.minLength, g.maxLength);
    this.rope = new Rope(this.scene, this.player.body, node.x, node.y, length, g.stiffness, g.damping);
    this.attachedNode = node;
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
      const contact = pair.contacts && pair.contacts.length > 0 ? pair.contacts[0] : null;
      const impact = resolveImpactPoint(
        projectile.body.position,
        projectile.body.velocity,
        this.config.grapple.projectileRadius,
        contact,
      );
      if (info && info.def.canPlaceNode) {
        this.placeNode(impact.x, impact.y);
      } else {
        this.flashReject(impact.x, impact.y);
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
