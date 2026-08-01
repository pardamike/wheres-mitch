# AGENTS.md

Instructions for coding agents working on Where's Mitch?.

## Read Order

Before planning or implementation, read:

1. `HANDOFF.md`
2. `.planning/PROJECT.md`
3. `docs/GAME-DESIGN.md`
4. `docs/TECHNICAL-SPEC.md`
5. `docs/UI-SPEC.md`
6. `docs/ART-BIBLE.md`
7. `docs/TEST-PLAN.md`
8. `.planning/REQUIREMENTS.md`
9. `.planning/ROADMAP.md`
10. The current phase's `CONTEXT.md`, `RESEARCH.md`, `UI-SPEC.md`, and `PLAN.md` files

When documents conflict, direct user instructions win, then `HANDOFF.md`, then canonical files
under `docs/`, then `.planning/` execution artifacts.

## Hard Product Constraints

- The shipped game is static. It has no backend, accounts, analytics, tracking, API calls,
  database, serverless functions, or required network access.
- The deployable `dist/` folder must work from both HTTP(S) and a direct `file://` URL.
- The runtime has no third-party dependencies. Development-only dependencies are allowed.
- Use vanilla TypeScript compiled to a classic browser IIFE, inline SVG for the game stage,
  ordinary HTML for controls, and CSS for presentation.
- Do not introduce React, Vue, Svelte, Phaser, PixiJS, a physics engine, or a component framework
  unless the user explicitly revises the technical specification.
- Do not use JavaScript modules, dynamic imports, `fetch()`, remote fonts, remote images, or CDN
  scripts in the deployable artifact.
- All game art, lettering, audio, and copy must be original or explicitly licensed and recorded
  in `docs/ART-BIBLE.md`.
- Do not copy Where's Waldo artwork, layouts, striped costume, logo treatment, or published copy.
- The game is unmistakably fictional political satire. It must never present the helicopter,
  cash, spouse, or foreign-influence imagery as a factual allegation.
- The disclaimer defined in `docs/GAME-DESIGN.md` must remain visible from the title screen.

## Engineering Rules

- Keep simulation and rules separate from SVG/DOM rendering.
- Drive animation with `requestAnimationFrame` timestamps; never make behavior frame-count based.
- Use a seeded PRNG for all gameplay-affecting randomness.
- Treat the state machine and event reducer as the source of truth. Renderers do not mutate game
  rules directly.
- Validate query parameters and persisted data before use.
- Pause simulation, timers, and audio when the page is hidden. Resume only if the player had not
  manually paused.
- Do not create DOM/SVG nodes in the animation hot path. Pool transient effects.
- The crowd has a hard performance ceiling; Mitch's effective difficulty continues increasing
  through speed and timing curves.
- Stable selectors and deterministic seeds may be exposed for tests, but tests must not require
  production-only behavior changes beyond those stable hooks.

## Verification Rules

- Run `npm run verify` before each implementation commit once tooling exists.
- Business rules require unit tests: click accounting, tenth-miss loss, last-click capture,
  round reset, difficulty monotonicity, seeded determinism, scene shuffle, and storage fallback.
- Each scene requires Playwright coverage for a successful catch and a ten-miss escape.
- The release gate includes a direct `file://` smoke test with zero network requests.
- Visual screenshots use fixed seeds and viewport sizes; do not snapshot random scenes.
- Do not create brittle tests for exact incidental SVG path strings or animation frame positions.

## Git And Identity

- Before the first commit, follow the identity gate in `HANDOFF.md` and confirm this repository
  uses the user's personal Git identity.
- Do not push from an Adelar Intel GitHub session or commit with an Adelar Intel author identity.
- Never add AI attribution, generated-by footers, or AI co-authors.
- Use Conventional Commits with concise subjects.
- Keep generated `dist/`, test reports, screenshots, and local caches out of commits unless a
  release process explicitly requires an artifact.
