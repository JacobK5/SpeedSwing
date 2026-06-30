import type { GrappleSystem } from './GrappleSystem';
import type { ExplosiveSystem } from './ExplosiveSystem';
import type { Resources, AmmoType } from './Resources';

export type WeaponType = 'grapple' | 'explosive';

/** Which ammo pool each weapon draws from. */
const AMMO_FOR: Record<WeaponType, AmmoType> = {
  grapple: 'grappleNodes',
  explosive: 'explosives',
};

/**
 * Routes the player's primary fire to the selected weapon and gates it on ammo.
 *
 * Weapon 1 (grapple node) and weapon 2 (explosive) are selected with the number
 * keys; left mouse fires the selected one. Ammo is consumed on firing (every
 * shot counts — DECISIONS.md #008, #013); when empty, firing is a no-op so the
 * player's flow is never interrupted by an error.
 */
export class WeaponSystem {
  private selected: WeaponType = 'grapple';

  constructor(
    private readonly grapple: GrappleSystem,
    private readonly explosives: ExplosiveSystem,
    private readonly resources: Resources,
  ) {}

  get selectedWeapon(): WeaponType {
    return this.selected;
  }

  select(weapon: WeaponType): void {
    this.selected = weapon;
  }

  /** Fire the selected weapon at a world point. Returns true if a shot was spent. */
  fire(worldX: number, worldY: number): boolean {
    if (!this.resources.tryConsume(AMMO_FOR[this.selected])) {
      return false;
    }
    if (this.selected === 'grapple') {
      this.grapple.fire(worldX, worldY);
    } else {
      this.explosives.fire(worldX, worldY);
    }
    return true;
  }
}
