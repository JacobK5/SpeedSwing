// Per-run ammunition accounting (DECISIONS.md #008).
//
// A level starts with a fixed amount of grapple-node and explosive ammo that
// never regenerates during a run. Restarting rebuilds the scene and a fresh
// Resources instance, so counts reset cleanly. Kept Phaser-free and unit tested.

export type AmmoType = 'grappleNodes' | 'explosives';

export interface AmmoCounts {
  grappleNodes: number;
  explosives: number;
}

/**
 * Tracks remaining ammo for a single run. `tryConsume` is the only way to spend:
 * it returns false (consuming nothing) when empty, so callers can no-op a fire.
 *
 * Ammo is consumed on *firing* (committing the shot), not on a successful
 * placement/hit — every shot counts, which is what makes the resource create
 * routing decisions (DECISIONS.md #008; #013).
 */
export class Resources {
  private remaining: AmmoCounts;

  constructor(starting: AmmoCounts) {
    this.remaining = {
      grappleNodes: Math.max(0, Math.floor(starting.grappleNodes)),
      explosives: Math.max(0, Math.floor(starting.explosives)),
    };
  }

  get(type: AmmoType): number {
    return this.remaining[type];
  }

  has(type: AmmoType): boolean {
    return this.remaining[type] > 0;
  }

  /** Spend one unit of `type`. Returns true if it was available and consumed. */
  tryConsume(type: AmmoType): boolean {
    if (this.remaining[type] <= 0) {
      return false;
    }
    this.remaining[type] -= 1;
    return true;
  }

  /** Snapshot of current counts (for HUD rendering). */
  snapshot(): AmmoCounts {
    return { ...this.remaining };
  }
}
