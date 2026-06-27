# Phase 2 Implementation Review

Review date: 2026-06-26

Reviewed branch: `feature/v0.1-phases-0-2`

Reviewed HEAD: `8424419 feat: add rope grapple controls and debug visualization`

Reviewer role: independent code and architecture reviewer. This document records findings only. It does not implement fixes.

---

# Summary

The implementation is a promising foundation for the movement prototype, but it is not yet ready to build Phase 3 on top of.

The project compiles, lints, tests, and builds successfully. The code structure is generally readable and modular. The implementation mostly stays within Phase 0 through Phase 2, with only light Phase 4 data scaffolding.

However, there are several issues that should be addressed before Phase 3 momentum work begins:

1. The required in-game live tuning panel is missing.
2. Grapple retargeting does not satisfy the "immediately reattach" design requirement.
3. Ground detection can likely misclassify walls as ground.
4. Config validation accepts unsafe gameplay values.
5. Movement and rope physics may conflict in ways that reduce swing momentum.
6. Some movement-affecting constants remain hard-coded.
7. Documentation has drifted from the implementation and from itself.

The biggest architectural risk is not build stability. The biggest risk is that Phase 3 playtesting will produce noisy or misleading feedback because the tuning loop is incomplete and some core physics behavior may be wrong.

---

# Review Scope

This review inspected:

- Recent commits
- Current branch
- Project structure
- Alignment with `README.md`, `AGENTS.md`, `DECISIONS.md`, and `docs/`
- Whether the implementation stopped at Phase 2
- Whether Phase 3+ systems were added prematurely
- Build, test, lint, and typecheck setup
- Code clarity and maintainability
- Phaser/Matter integration quality
- Config loading structure
- Whether gameplay values are configurable instead of hard-coded
- Movement implementation
- Grapple node placement
- Rope attach/release behavior
- W/S rope extension and retraction
- Debug visualization
- Potential physics architecture issues
- Missing or fragile tests
- Documentation drift

---

# Repository State

Current branch:

```text
feature/v0.1-phases-0-2
```

Recent commits:

```text
8424419 feat: add rope grapple controls and debug visualization
c556377 feat: add grapple node placement
a0da5a7 feat: add basic movement prototype
205b1e8 feat: add config loading and level format foundation
106b3a7 chore: scaffold phaser vite typescript project
6afb948 First commit
```

The worktree was clean at review time.

Commands run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Results:

- Typecheck passed.
- Lint passed.
- Unit tests passed: 39 tests across 4 test files.
- Production build passed.

---

# Overall Assessment

The implementation has good bones:

- TypeScript strictness is enabled.
- The project uses Phaser 3, Matter.js, Vite, Vitest, and ESLint as expected.
- Core systems are separated into small files.
- Movement logic is mostly decoupled from Phaser and unit tested.
- Config loading is pure and unit tested.
- Level validation is pure and unit tested.
- Grapple selection and rope length math are pure and unit tested.
- Placeholder visuals are appropriate for the prototype stage.
- The branch mostly stops at Phase 2.

The implementation is not yet a complete Phase 0 through Phase 2 foundation because the developer tuning panel is missing, and because several movement/physics behaviors need tightening before Phase 3 momentum work can be trusted.

---

# Readiness For Phase 3

Not ready yet.

Phase 3 is supposed to refine movement depth through bunny-hop timing, landing preservation, rope tuning, swing tuning, and recovery mechanics. Those systems depend on the Phase 0-2 foundation being reliable and easy to tune.

Before Phase 3 starts, this implementation should first address:

1. Live tuning panel.
2. Grapple retargeting.
3. Ground detection correctness.
4. Config range validation.
5. Rope/movement interaction review.

Without those fixes, Phase 3 risks building advanced momentum mechanics on top of ambiguous physics behavior.

---

# Biggest Risks

## 1. Tuning Loop Risk

The project philosophy repeatedly says movement feel must be discovered through live iteration, not speculation.

Relevant docs:

- `docs/02-v0.1-technical-spec.md` says Version 0.1 must include an in-game developer panel.
- `docs/06-development-roadmap.md` lists the developer tuning panel as a Phase 0 deliverable.
- `docs/04-physics-tuning.md` says the tuning system should allow live edits, save/load, restore defaults, and immediate observation.
- `DECISIONS.md` says configurable movement values require an in-game tuning system capable of modifying and saving gameplay values.

Current implementation:

- Has static JSON config files.
- Has `resolveConfig`.
- Has debug visualization.
- Does not have an in-game tuning panel.
- Does not support runtime save/load/restore through a panel.
- `src/config/README.md` says the live tuning panel is intentionally deferred.

This is the highest priority issue because the game is movement-first. If values cannot be tuned quickly while playing, the project cannot efficiently answer whether movement feels good.

## 2. Physics Feedback Risk

Ground detection likely treats some wall overlaps as grounded. Rope/movement integration may also clamp swing energy. These issues can contaminate playtest feedback because players may feel bugs as if they were intended mechanics.

## 3. Phase 3 Foundation Risk

Phase 3 features like bunny-hop timing and landing momentum preservation require trustworthy ground state, velocity handling, and tuning support. Those systems should not be layered on top of fragile Phase 1/2 behavior.

---

# Findings

## P1: Missing Live Tuning Panel

The implementation does not include the required in-game developer tuning panel.

Evidence:

- `docs/02-v0.1-technical-spec.md` says Version 0.1 must include an in-game developer panel.
- `docs/02-v0.1-technical-spec.md` requires live value adjustment, save current configuration, load saved configuration, restore defaults, categories, and no recompilation.
- `docs/06-development-roadmap.md` lists `Developer tuning panel` as a Phase 0 deliverable.
- `docs/04-physics-tuning.md` defines the tuning system as central to rapid movement iteration.
- `src/config/README.md` says the live tuning panel is planned but intentionally deferred.

Why this matters:

The current milestone is Prototype / Feel First. Static JSON plus hot reload is useful, but it is not the same as live in-game tuning. The intended workflow is to adjust a value, immediately play, observe, save, reload, and continue.

Risk:

High. Phase 3 tuning will be slow and imprecise without this.

Recommended fix:

Implement a scoped in-game tuning panel for existing config categories:

- Movement
- Physics
- Grapple
- Camera
- Debug

Minimum expected behavior:

- Toggle panel in development builds.
- Edit numeric and boolean values while running.
- Apply changes live where feasible.
- Save active config to local storage.
- Load saved config.
- Restore defaults.
- Organize values by category.
- Avoid becoming a level editor or generic tool.

Tests:

- Add unit tests for save/load/default merge behavior if the storage layer is pure or isolated.
- Keep Phaser UI behavior manually smoke-tested if automated UI tests are too heavy right now.

---

## P1: Grapple Cannot Immediately Reattach To Another Node

The design says the grapple should allow release at any time and immediately reattach to another node.

Evidence:

- `docs/03-core-mechanics.md` says grappling should allow release at any time and immediately reattach to another node.
- `GrappleSystem.attachOrRelease` releases and returns immediately if a rope is already attached.

Current behavior:

If the player is attached and right-clicks near another valid node, the system releases but does not attach to the new node. The player must click a second time.

Why this matters:

This is a flow issue. The project values continuous movement and momentum. Requiring a release click followed by an attach click interrupts the intended rhythm and makes node chaining feel less fluid.

Recommended fix:

Update right-click behavior:

- If attached and a valid node is under/near the cursor, switch the rope to that node immediately.
- If attached and no valid node is available, release.
- If detached and a valid node is available, attach.
- Avoid adding new movement abilities or advanced mechanics.

Tests:

- Add pure tests around target selection if possible.
- Add unit tests around a small state-transition helper if the Phaser/Matter parts are hard to test directly.

---

## P2: Ground Detection Can Likely Treat Walls As Ground

`CollisionSystem.isGrounded` uses a rectangular overlap probe below the player and returns true for any terrain body it intersects.

Evidence:

- `src/systems/CollisionSystem.ts` probes a rectangle near the player's feet.
- It checks only whether the overlapped body has a terrain label.
- It does not check contact normal, surface direction, or whether the body is actually below the player.
- `docs/03-core-mechanics.md` explicitly excludes wall running and other wall movement.

Why this matters:

If a vertical wall overlaps the foot probe, the player may be considered grounded while touching a wall. That can enable accidental wall jumps, coyote refreshes, ground friction, or buffered jumps in situations that should be airborne.

This is especially important because Phase 3 will build bunny-hop and landing preservation on top of ground detection.

Recommended fix:

Use a more robust grounded check:

- Prefer collision/contact normals if practical.
- Or keep a downward probe but exclude surfaces whose top is not below the player's feet.
- Ensure vertical wall sides do not count as ground.
- Keep the solution simple and readable.

Tests:

- Add tests around a pure helper that classifies grounded contacts.
- Include cases for flat floor, ceiling, wall side, and edge contact.

---

## P2: Config Validation Is Too Permissive For Runtime Tuning

`resolveConfig` validates primitive type and finite numbers, but does not validate gameplay ranges or relationships.

Evidence:

- `src/config/resolveConfig.ts` accepts any finite number with the expected primitive type.
- `docs/04-physics-tuning.md` says every config value should document expected range and default value.
- Future tuning UI will make it easy to create invalid intermediate values.

Examples of unsafe values currently accepted:

- Negative `minLength`
- `minLength > maxLength`
- Negative `projectileRadius`
- Negative speeds
- `stiffness` outside `0..1`
- `damping` outside `0..1`
- Negative timings
- Invalid camera zoom

Why this matters:

Invalid config can cause broken physics, confusing playtests, or runtime instability. The more live tuning the project supports, the more important guardrails become.

Recommended fix:

Add range metadata or validation rules for config fields.

At minimum:

- Validate values against documented ranges.
- Validate relationships like `grapple.minLength <= grapple.maxLength`.
- Warn clearly when falling back or clamping.
- Keep defaults restorable.

Tests:

- Add tests for invalid ranges.
- Add tests for relationship validation.
- Add tests that warnings identify the exact field.

---

## P2: Rope And Movement Integration May Reduce Swing Momentum

`MovementSystem` clamps vertical velocity to `maxFallSpeed` every frame.

Evidence:

- `src/systems/MovementSystem.ts` applies terminal fall speed clamping without knowing whether the player is attached to a rope.
- `AGENTS.md` says momentum is sacred and mechanics should avoid unnecessarily stopping or resetting player movement.
- `docs/03-core-mechanics.md` says grappling should preserve momentum and swing naturally.

Why this matters:

Terminal velocity is reasonable for freefall, but while swinging it may flatten the lower part of a swing arc or cap energy that the rope should preserve. This may make grappling feel less satisfying or reduce mastery potential.

This is a likely issue, not a proven bug from automated tests.

Recommended fix:

Review movement update behavior while attached:

- Consider whether terminal fall clamping should be disabled, raised, or differently applied while grappling.
- Consider passing a movement context such as `isGrappling`.
- Avoid adding Phase 3 mechanics while doing this.
- Preserve predictable platforming when not attached.

Tests:

- Add unit tests for movement behavior with and without a grappling context if a context is introduced.
- Manual playtest rope swings before and after the change.

---

## P2: Projectile Node Placement May Not Use Actual Surface Contact Point

Grapple node placement uses the projectile body's current position when collision is detected.

Evidence:

- `GrappleSystem.handleCollision` places the node at `projectile.body.position`.

Why this matters:

The projectile center may be slightly inside terrain or offset from the actual hit point. This can make anchors appear embedded, floating, or inconsistent, especially at high projectile speed.

Recommended fix:

Use a more accurate contact point where practical:

- Matter collision pair contact/support data if available.
- Or project back along the shot direction by projectile radius.
- Keep implementation simple for the prototype.

Tests:

- This may be mostly visual/manual.
- If extraction is pure, test the hit-position helper.

---

## P3: Some Movement-Affecting Constants Are Hard-Coded

Most gameplay values are configurable, which is good. A few movement-affecting constants remain hard-coded.

Evidence:

- Player body chamfer radius is hard-coded as `4` in `src/entities/Player.ts`.
- Debug velocity vector draw scale is hard-coded in `src/systems/DebugOverlay.ts`.
- Grid spacing is hard-coded in `src/systems/LevelBuilder.ts`.
- Input bindings are hard-coded in `src/core/InputManager.ts`.

Why this matters:

Player chamfer can affect snagging, collision feel, and wall/edge behavior, so it should be configurable. Debug draw scale and grid spacing are less important. Input bindings are allowed to be configurable later according to the spec, so they are not urgent.

Recommended fix:

- Move player chamfer radius into `physics.json` and `PhysicsConfig`.
- Consider whether debug velocity scale belongs in debug config.
- Leave input binding configurability for later unless it blocks the current tuning workflow.

---

## P3: Documentation Drift

There are several documentation mismatches.

Issues:

1. `README.md` and `docs/00-agent-brief.md` reference `docs/01-design-bible.md`, but that file does not exist.
2. `src/config/README.md` says the live in-game tuning panel is intentionally deferred, but the main project docs say it is required for Version 0.1 and Phase 0.
3. `README.md` says Version 0.1 includes explosives, destructible terrain, timer, and developer tuning tools. The current branch only implements a subset of that. That is acceptable for Phase 2, but docs or handoff notes should be clear about current phase completion versus full V0.1 completion.

Why this matters:

This project is explicitly designed for AI-agent-assisted development. Drifted docs make it more likely that future agents will implement the wrong scope.

Recommended fix:

- Either add `docs/01-design-bible.md` or remove/update references to it.
- Update `src/config/README.md` after implementing the tuning panel.
- Keep a short phase status note somewhere obvious if work is being reviewed phase-by-phase.

---

# Scope Review

Claude Code mostly stopped at Phase 2.

Implemented Phase 0-2 areas:

- Project setup
- TypeScript/Vite/Phaser/Matter
- Basic scene management
- Config JSON loading and defaults
- Level JSON loading and validation
- Basic player movement
- Camera follow
- Grapple node projectile placement
- No-node rejection
- Rope attach/release
- W/S rope extension/retraction
- Debug visualization

Not implemented, correctly deferred:

- Timer
- Goal completion
- Explosives
- Destructible terrain behavior
- Resource limits
- Bunny-hop / landing preservation
- Progression
- Enemies
- Collectibles
- Multiplayer
- UI/audio polish

Possible premature scaffolding:

- Level resources include grapple/explosive counts, but they are marked as forward-compatible and not enforced.
- Surface config includes destructible and killzone data, but behavior is not implemented.
- Goal is drawn but non-functional.

This scaffolding is acceptable if kept as data only. It should not expand into Phase 4 gameplay until explicitly requested.

---

# Testing Review

Existing tests are useful and lightweight:

- Config resolution tests
- Level validation tests
- Movement logic tests
- Grapple targeting and rope length math tests

Missing or fragile coverage:

- Grounded detection edge cases
- Grapple state transitions, especially retargeting
- Config range and relationship validation
- Restart/lifecycle behavior with active rope/projectiles/nodes
- Runtime Phaser/Matter smoke behavior
- Tuning save/load/default behavior

Recommended test additions:

1. Pure helper tests for grounded classification.
2. Tests for config range validation.
3. Tests for grapple retarget state transitions through a small pure helper or testable state machine.
4. Tests for tuning storage merge/default behavior if a storage abstraction is added.

Do not overbuild the test suite. Keep automated tests focused on deterministic logic. Movement feel still belongs to manual playtesting.

---

# Recommended Fix Order

1. Implement the required live tuning panel.
2. Fix grapple retargeting so one right-click can switch nodes.
3. Fix grounded detection so walls do not count as ground.
4. Add config range and relationship validation.
5. Review rope/movement interaction, especially terminal fall speed while attached.
6. Move player chamfer radius into config.
7. Tighten tests around the above deterministic behaviors.
8. Update docs to remove drift.

Do not add Phase 3+ features while fixing these issues.

---

# Suggested Prompt For Claude Code

```text
Please read docs/09-phase-2-review.md and address all review findings in priority order.

Important constraints:
- Do not add Phase 3+ mechanics yet.
- Do not add bunny-hop, landing momentum preservation, timer, explosives, destructible terrain behavior, goal completion, progression, enemies, collectibles, cosmetics, or UI/audio polish unless specifically required by the review.
- Keep the project movement-first and tuning-first.
- Prefer small, focused, maintainable changes.
- Keep gameplay values configurable.
- Add focused tests for deterministic logic.

Required fixes:
1. Implement the required in-game developer tuning panel for the existing config categories: movement, physics, grapple, camera, and debug. It must support live edits where feasible, save/load through local storage, restore defaults, and category organization.
2. Fix grapple right-click behavior so an attached player can immediately retarget to another valid node near the cursor. If no valid node is available, right-click may release.
3. Fix grounded detection so vertical walls cannot count as ground.
4. Add range and relationship validation for config values, especially rope min/max, stiffness/damping, speeds, sizes, gravity scale, timings, and camera zoom.
5. Review rope plus movement velocity interaction so terminal fall-speed clamping does not unnecessarily kill swing momentum while attached.
6. Move player chamfer radius into physics config.
7. Update docs that drifted from the actual project state, including the missing or referenced docs/01-design-bible.md issue and the tuning-panel note in src/config/README.md.

After changes, run:
npm run typecheck
npm run lint
npm run test
npm run build

Report what changed, why, how it was tested, and whether any Phase 3+ work was intentionally left untouched.
```

