# Browser Grappling Game

*A movement-first browser speedrunning game built around grappling, momentum, and player creativity.*

---

# Vision

This project aims to create one of the most satisfying movement systems possible in a browser game.

The game is centered around:

* Movement mastery
* Momentum preservation
* Creative routing
* Speedrunning
* Player discovery

The core philosophy is simple:

> **Movement is the game.**

Everything else exists to support that.

---

# Current Status

Current milestone:

**Version 0.1 — Movement Prototype**

The project is currently focused on validating one question:

> **Is moving around fun enough that players naturally want to keep playing?**

Until that question is answered, no major gameplay systems should be added.

## Implementation status

The **Current Scope** list further down describes the *full* Version 0.1 target.
Development proceeds in phases (see [docs/06-development-roadmap.md](docs/06-development-roadmap.md));
not all of that scope is built yet.

Implemented so far (Phases 0–4):

- Project foundation, scenes, config + level loading and validation.
- Running, jumping, air control, gravity, collision, smooth-follow camera.
- Grappling: player-placed permanent nodes, rope swinging, W/S extend/retract.
- Momentum (Phase 3): bunny-hop timing window, landing momentum preservation,
  swing steering control — all configurable, with debug visibility.
- Prototype gameplay loop (Phase 4): speedrun timer, goal completion, instant
  restart, per-level personal best, kill-zone restart, explosives + destructible
  terrain, no-node terrain, and grapple-node / explosive ammunition limits.
- Functional flow screens: title, level select, in-run HUD, and run-complete /
  pause overlays.
- Developer tuning panel (press **T**) and debug overlay (press **`**).
- Developer-only greybox level editor (dev builds only): open with the `?editor`
  URL flag, e.g. `http://localhost:5173/?editor`.

Controls: **A/D** move, **Space** jump, **1/2** select weapon, **LMB** fire
selected weapon, **RMB** hold to grapple, **W/S** retract/extend rope, **R**
instant restart, **Esc** pause, **`** debug overlay, **T** tuning panel.

> **Important:** code existing is not the same as feel being validated. The
> Phase 3 momentum values and the Phase 4 loop / benchmark level have **not** yet
> been confirmed through human playtesting. Every feel-sensitive value is
> intentionally exposed in config / the tuning panel so it can be dialled in. See
> [docs/07-playtesting-notes.md](docs/07-playtesting-notes.md) for the open
> questions each system still needs a human to answer.

---

# Technology

* TypeScript
* Phaser 3
* Matter.js
* Vite

Target platform:

* Desktop browsers

Future release targets:

* itch.io
* CrazyGames
* Poki

---

# Running the Project

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run automated tests:

```bash
npm run test
```

Run linting:

```bash
npm run lint
```

Run type checking:

```bash
npm run typecheck
```

---

# Repository Structure

```text
docs/
    00-agent-brief.md
    01-design-bible.md
    02-v0.1-technical-spec.md
    03-core-mechanics.md
    04-physics-tuning.md
    05-level-format.md
    06-development-roadmap.md
    07-playtesting-notes.md
    08-dev-workflow.md
    09-phase-2-review.md
    10-level-editor.md

VISION.md
AGENTS.md
DECISIONS.md
README.md
```

---

# Documentation Reading Order

For a new developer or AI coding agent:

1. README.md
2. VISION.md
3. AGENTS.md
4. docs/00-agent-brief.md
5. docs/01-design-bible.md
6. docs/02-v0.1-technical-spec.md
7. docs/03-core-mechanics.md

The remaining documents should be referenced as needed.

---

# Guiding Principles

Before implementing any feature, ask:

* Does this improve movement?
* Does this preserve momentum?
* Does this create interesting player decisions?
* Does this increase player expression?
* Does this support flow?

If not, reconsider whether it belongs.

---

# Current Scope

Version 0.1 intentionally includes only:

* Running
* Jumping
* Air control
* Grappling
* Rope extension/retraction
* Grapple node placement
* Explosive projectiles
* Destructible terrain
* No-node terrain
* Speedrun timer
* Developer tuning tools

Everything else is intentionally deferred until movement has been validated.

---

# Development Philosophy

The project follows an iterative process:

Build.

Play.

Observe.

Adjust.

Repeat.

Gameplay feel is determined through playtesting, not speculation.

---

# Automated Testing

Automated testing is intentionally lightweight.

Tests should verify:

* correctness
* data validation
* configuration loading
* utility behavior

Movement quality is evaluated through human playtesting.

---

# Versioning

The project uses semantic-style versioning.

Examples:

```
0.1.0
0.1.1
0.2.0
1.0.0
```

GitHub Releases are used for preserving playable builds.

---

# Contributing

When contributing to the project:

* Keep systems modular.
* Prefer readability over cleverness.
* Keep gameplay values configurable.
* Avoid feature creep.
* Preserve player flow.
* Update documentation when making significant decisions.

Every important design decision should be recorded in `DECISIONS.md`.

Major gameplay discoveries should be documented in `docs/07-playtesting-notes.md`.

---

# Long-Term Goal

The goal is not simply to ship a browser game.

The goal is to build a movement system that players continue mastering because every run teaches them something new.

If players repeatedly think:

> "One more try."

then the project has succeeded.
