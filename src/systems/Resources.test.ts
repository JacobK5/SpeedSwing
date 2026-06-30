import { describe, it, expect } from 'vitest';
import { Resources } from './Resources';

describe('Resources', () => {
  it('reports starting counts', () => {
    const r = new Resources({ grappleNodes: 8, explosives: 3 });
    expect(r.get('grappleNodes')).toBe(8);
    expect(r.get('explosives')).toBe(3);
    expect(r.has('grappleNodes')).toBe(true);
  });

  it('consumes one unit per successful fire', () => {
    const r = new Resources({ grappleNodes: 2, explosives: 0 });
    expect(r.tryConsume('grappleNodes')).toBe(true);
    expect(r.get('grappleNodes')).toBe(1);
    expect(r.tryConsume('grappleNodes')).toBe(true);
    expect(r.get('grappleNodes')).toBe(0);
  });

  it('refuses to consume when empty and changes nothing', () => {
    const r = new Resources({ grappleNodes: 0, explosives: 1 });
    expect(r.tryConsume('grappleNodes')).toBe(false);
    expect(r.get('grappleNodes')).toBe(0);
    expect(r.has('grappleNodes')).toBe(false);
    // unrelated ammo untouched
    expect(r.get('explosives')).toBe(1);
  });

  it('floors and clamps negative or fractional starting ammo', () => {
    const r = new Resources({ grappleNodes: -5, explosives: 2.9 });
    expect(r.get('grappleNodes')).toBe(0);
    expect(r.get('explosives')).toBe(2);
  });

  it('snapshots current counts independently', () => {
    const r = new Resources({ grappleNodes: 3, explosives: 1 });
    const snap = r.snapshot();
    r.tryConsume('grappleNodes');
    expect(snap).toEqual({ grappleNodes: 3, explosives: 1 }); // unchanged copy
  });
});
