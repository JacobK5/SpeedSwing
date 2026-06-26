import { describe, it, expect } from 'vitest';
import { findNearestNode, computeRopeLength, clamp } from './grappleMath';

const PLAYER = { x: 0, y: 0 };

describe('findNearestNode', () => {
  const nodes = [
    { x: 100, y: 0, id: 'a' },
    { x: 120, y: 0, id: 'b' },
    { x: 400, y: 0, id: 'c' },
  ];

  it('returns the node nearest the cursor among those within the attach radius', () => {
    // Cursor near both a and b; b is closer to the cursor.
    const node = findNearestNode(nodes, { x: 118, y: 0 }, PLAYER, 90, 1000);
    expect(node?.id).toBe('b');
  });

  it('returns null when no node is within the attach radius of the cursor', () => {
    const node = findNearestNode(nodes, { x: 250, y: 0 }, PLAYER, 50, 1000);
    expect(node).toBeNull();
  });

  it('excludes nodes beyond maxAttachDistance from the player', () => {
    // Cursor sits on node c, but c is 400 from the player; cap at 300.
    const node = findNearestNode(nodes, { x: 400, y: 0 }, PLAYER, 90, 300);
    expect(node).toBeNull();
  });

  it('returns null for an empty node list', () => {
    expect(findNearestNode([], { x: 0, y: 0 }, PLAYER, 90, 1000)).toBeNull();
  });
});

describe('computeRopeLength', () => {
  it('retracts toward minLength while W is held', () => {
    const next = computeRopeLength(300, true, false, 220, 260, 0.1, 40, 600);
    expect(next).toBeCloseTo(300 - 220 * 0.1, 5);
  });

  it('extends toward maxLength while S is held', () => {
    const next = computeRopeLength(300, false, true, 220, 260, 0.1, 40, 600);
    expect(next).toBeCloseTo(300 + 260 * 0.1, 5);
  });

  it('clamps retraction at minLength', () => {
    expect(computeRopeLength(50, true, false, 220, 260, 1, 40, 600)).toBe(40);
  });

  it('clamps extension at maxLength', () => {
    expect(computeRopeLength(590, false, true, 220, 260, 1, 40, 600)).toBe(600);
  });

  it('leaves length unchanged with no input', () => {
    expect(computeRopeLength(300, false, false, 220, 260, 0.1, 40, 600)).toBe(300);
  });

  it('nets the difference when both are held', () => {
    const next = computeRopeLength(300, true, true, 200, 260, 0.5, 40, 600);
    expect(next).toBeCloseTo(300 + (260 - 200) * 0.5, 5);
  });
});

describe('clamp', () => {
  it('bounds values to the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});
