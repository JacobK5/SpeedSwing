# 08-dev-workflow.md

# Development Workflow

## Purpose

This document defines the project’s development workflow, versioning conventions, build process, release process, and testing philosophy.

The goal is to keep the project lightweight, reliable, and easy to iterate on.

This is a prototype-first game project, not an enterprise software product.

Process should support fast movement tuning and frequent playable builds without creating unnecessary overhead.

---

# Versioning Philosophy

The project uses simple semantic-style versioning:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
0.1.0
```

## Version Meaning

### MAJOR

Large breaking changes or full release milestones.

Example:

```text
1.0.0
```

First public complete release.

---

### MINOR

Meaningful gameplay milestones.

Examples:

```text
0.1.0
```

First movement prototype.

```text
0.2.0
```

First playable speedrun level.

```text
0.3.0
```

First internal playtest build.

---

### PATCH

Bug fixes, tuning changes, small improvements.

Examples:

```text
0.1.1
0.1.2
0.1.3
```

Patch versions may include physics tuning changes.

---

# Pre-1.0 Expectations

Before `1.0.0`, breaking changes are expected.

The game is still experimental.

Version numbers should communicate playable milestones, not production stability.

---

# Build Types

The project should support the following build types.

## Development Build

Used while actively coding.

Characteristics:

* hot reload
* tuning panel enabled
* debug overlays available
* verbose logging allowed

Command example:

```bash
npm run dev
```

---

## Preview Build

Used for local testing of the production bundle.

Characteristics:

* production-like build
* still local
* useful before creating a release

Command example:

```bash
npm run build
npm run preview
```

---

## Release Build

Used for sharing with testers or uploading to browser game portals.

Characteristics:

* optimized
* static files
* no unnecessary debug output
* version number visible somewhere in the game
* packaged as a `.zip`

Command example:

```bash
npm run build
npm run package
```

---

# GitHub Releases

Playable builds should be attached to GitHub Releases.

Each release should include:

* version number
* short summary
* important changes
* known issues
* downloadable `.zip` build

Release artifact naming convention:

```text
grapple-game-v0.1.0-web.zip
```

Example:

```text
grapple-game-v0.1.3-web.zip
```

The `.zip` should contain the built static site.

At minimum:

```text
index.html
assets/
```

A tester should be able to download the zip and run it locally through a simple static server.

---

# Git Tags

Each GitHub Release should correspond to a git tag.

Tag format:

```text
v0.1.0
v0.1.1
v0.2.0
```

Tags should be created only for builds worth preserving.

Not every commit needs a tag.

---

# Branching

Keep branching simple.

Recommended branches:

```text
main
```

Stable project history.

```text
feature/*
```

Feature work.

```text
fix/*
```

Bug fixes.

```text
tuning/*
```

Physics or gameplay tuning experiments.

Avoid complicated branching models.

This project benefits from speed and clarity.

---

# Commit Style

Commits should be small and descriptive.

Preferred format:

```text
type: short description
```

Examples:

```text
feat: add grapple node projectile
fix: prevent rope from attaching to invalid surfaces
tune: reduce air acceleration
docs: update physics tuning notes
refactor: separate weapon selection from firing
```

Suggested types:

```text
feat
fix
tune
docs
refactor
test
chore
```

The `tune` type is important because physics and movement tuning will be frequent.

---

# Pull Requests

For solo development, pull requests are optional.

For AI-agent-assisted development, pull requests can be useful when reviewing larger changes.

A pull request should explain:

* what changed
* why it changed
* how it was tested
* whether gameplay feel changed

If a change affects movement feel, mention that clearly.

---

# Automated Checks

Every meaningful code change should pass:

```bash
npm run typecheck
npm run lint
npm run build
```

These commands should eventually be run automatically in GitHub Actions.

---

# Testing Philosophy

This project should not aim for heavy automated testing.

The most important quality measure is playtesting.

However, automated tests are still valuable for systems where correctness matters.

Use automated tests for stable logic.

Use playtesting for feel.

---

# Good Candidates for Automated Tests

Automated tests are useful for:

* level validation
* config loading
* config saving
* weapon ammo accounting
* timer formatting
* personal best comparison
* collision category rules
* surface type validation
* input mapping utilities
* save/load helpers

These systems have clear expected behavior.

---

# Poor Candidates for Automated Tests

Automated tests are less useful for:

* whether movement feels good
* whether grappling feels satisfying
* whether camera smoothing feels right
* whether rope physics are fun
* whether a level is enjoyable

These should be evaluated through playtesting.

---

# Recommended Test Stack

Use a lightweight TypeScript-friendly test runner.

Suggested:

```text
Vitest
```

Testing should remain fast and low-friction.

If tests become annoying to maintain, the test suite is too heavy.

---

# Minimum Testing Standard

Version 0.1 should include automated tests for:

* level format validation
* configuration loading
* configuration default fallback behavior
* basic ammo consumption rules

No large test suite is required.

---

# Manual Playtest Checklist

Before creating a release build, manually verify:

* game loads
* player can move
* player can jump
* grapple nodes can be placed
* rope can attach and detach
* W/S rope length controls work
* explosives destroy destructible terrain
* no-node terrain rejects grapple nodes
* timer starts and stops correctly
* restart works instantly
* tuning panel opens
* tuning values can be saved
* saved values persist after reload

---

# Release Checklist

Before publishing a GitHub Release:

1. Update version number.

2. Run automated checks.

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

3. Run manual playtest checklist.

4. Package release build.

5. Create git tag.

6. Create GitHub Release.

7. Attach zipped web build.

8. Write release notes.

---

# Release Notes Format

Each release should use this format:

```markdown
# v0.1.0

## Summary

Short description of the release.

## Added

- New features.

## Changed

- Gameplay, tuning, or technical changes.

## Fixed

- Bug fixes.

## Known Issues

- Current known problems.

## Playtesting Focus

What testers should pay attention to.
```

---

# Version Display

The current version should be visible in development builds.

Prefer displaying it in:

* pause menu
* debug overlay
* tuning panel

This makes screenshots and playtest feedback easier to interpret.

---

# Save Data Compatibility

During pre-1.0 development, save data compatibility is not guaranteed.

If config formats change, old local saved tuning data may be invalidated.

When this happens, document it in release notes.

---

# GitHub Actions

Eventually add basic CI.

Minimum CI workflow:

On pull request or push to main:

* install dependencies
* typecheck
* lint
* test
* build

Do not overcomplicate CI during early prototyping.

---

# Deployment

Early development should prioritize GitHub Releases and local builds.

Later deployment targets may include:

* itch.io
* CrazyGames
* Poki
* personal website

Portal-specific SDK integration is out of scope for Version 0.1.

---

# Out of Scope

Do not implement yet:

* automatic deployment
* portal SDK upload automation
* cloud save
* user accounts
* analytics
* crash reporting
* multiplayer infrastructure
* anti-cheat
* complex release channels

These may become relevant later.

---

# Success Criteria

This workflow is successful if:

* playable builds are easy to create
* testers can quickly try specific versions
* important builds are preserved
* tuning changes are traceable
* automated checks catch obvious mistakes
* process does not slow down experimentation

The workflow should support creative iteration, not replace it.
