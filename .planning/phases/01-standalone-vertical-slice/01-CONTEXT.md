# Phase 1 Context: Standalone Vertical Slice

## Boundary

Build one complete, deterministic Washington round and the static toolchain beneath it. The phase
ends with a playable title-to-restart loop; final art, advanced movement, audio, and the other two
scenes remain placeholders or later work.

## Locked Decisions

- **D1-01 — Static first:** production is `dist/index.html`, `dist/styles.css`, and one classic
  IIFE `dist/game.js`; relative paths and `file://` are mandatory.
- **D1-02 — No framework/runtime dependencies:** use strict TypeScript, native DOM/SVG APIs,
  esbuild, Vitest, and Playwright. A development dependency is acceptable; shipped code has none.
- **D1-03 — Ten means ten:** every round starts with exactly ten attempts. The tenth click can
  catch Mitch. Only the tenth miss causes loss.
- **D1-04 — One input boundary:** the stage owns a single `pointerdown` handler. Controls stop event
  propagation. Target resolution happens from the event's composed path, not coordinates.
- **D1-05 — Explicit state machine:** use the canonical `GameMode` states in
  `docs/TECHNICAL-SPEC.md`; outcome transitions lock input synchronously.
- **D1-06 — Seeded from day one:** a run seed and round seed are visible in debug mode so later
  scenes and animation remain reproducible.
- **D1-07 — Honest prototype art:** Phase 1 uses original simple SVG placeholders that already
  read as a turtle-bodied caricature, not copied franchise imagery.
- **D1-08 — Disclaimer before play:** the title screen includes the final fictional-satire and
  non-affiliation framing, even while visuals are provisional.

## Player Flow

1. Open the document and see title, premise, ten-click rule, controls, records statement, and
   disclaimer.
2. Press **Start the Search** (or activate the focused button by keyboard).
3. Search a Washington street. HUD shows round 1, ten clicks, zero caught, and local best.
4. A stage miss removes exactly one attempt and shows a short click marker.
5. Clicking visible Mitch freezes input and shows a temporary success transition.
6. Catching increments completed rounds and begins a new Washington round with ten attempts.
7. Ten misses freeze input and show a temporary escape transition followed by game over.
8. **Search Again** resets run-scoped state to round 1 while retaining only allowed local records.

## Scope Guardrails

- Do not build generalized ECS, scene editor, asset pipeline, plugin system, or framework wrapper.
- Do not implement final cutscene choreography in this phase.
- Do not add analytics, remote fonts, CDNs, fetches, service workers, or a backend.
- Do not claim browser-local storage is reliable under `file://`; use an injectable in-memory
  adapter now and finalize storage behavior in Phase 5.
- Do not commit or push until personal Git identity is explicitly verified on the new machine.

## Acceptance Conversation

The human should be able to double-click `dist/index.html`, play both outcomes, confirm exactly ten
attempts, resize the window, inspect an intentionally simple Washington scene, and approve the
basic humor/readability before the team invests in final art and motion.

## Deferred

- Routed crowd and Mitch behaviors: Phase 2.
- Final character rigs, audio, and both signature cutscenes: Phase 3.
- Fair and airport templates: Phase 4.
- Durable storage, reduced-motion override, browser matrix, and deployment: Phase 5.
