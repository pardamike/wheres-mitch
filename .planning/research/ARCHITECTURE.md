# Architecture Research: Where's Mitch?

**Researched:** 2026-07-31

## Component Boundaries

| Component | Owns | Does Not Own |
|-----------|------|--------------|
| Game reducer | Legal state transitions, attempts, score, pause, outcomes | DOM, animation, random choices |
| Controller/clock | Event ordering, rAF, suspension, timelines | Drawing or rule branching outside events |
| Seed manager | Root/sub-seed derivation and deterministic streams | Browser record storage |
| Difficulty | Pure round → profile calculation | Mutating actors |
| Scene template | Authored static model, paths, props, spawn/hide slots | Global score/state |
| World simulation | Actor states, routes, target movement, snapshots | HUD and persistence |
| Stage renderer | Persistent SVG nodes, transforms, effects/layers | Attempts or outcome decisions |
| HUD renderer | Text/control state and dialogs | World simulation |
| Cutscene timelines | Semantic animation progress and cues | Deciding whether a win/loss occurred |
| Audio engine | Cue synthesis, master mute/suspend | State completion |
| Records adapter | Validated local records/settings | Live round serialization |

## Data Flow

```text
pointer/control/visibility event
  -> controller normalizes event
  -> pure reducer returns next GameState + semantic effects
  -> controller executes semantic effects (round build, records, audio cue)
  -> world advances from state + fixed seed + delta
  -> readonly snapshot
  -> SVG stage + HTML HUD render
```

Only the controller coordinates components. Renderers never import the reducer to dispatch hidden
mutations. Scene templates never read browser storage. Audio never delays state transitions.

## State Strategy

Use a plain immutable `GameState` and discriminated union `GameEvent`, not a state-management
library. The reducer handles coarse game mode and counters. World objects may be mutable internally
for hot-path efficiency but are owned by one `WorldSimulation` and exposed only as readonly
snapshots.

## Rendering Strategy

Use persistent SVG groups and discrete layers. Construct scene/background/actors once per round,
then update transforms/classes/opacity. Avoid React-style tree reconciliation and avoid rebuilding
SVG markup via `innerHTML`.

SVG pointer event order supplies hit testing. Opaque foreground props must intercept events so a
visually hidden target cannot be clicked through. Depth lanes avoid per-frame global DOM sorting.

## Scene Extensibility

A scene is an implementation of the same `SceneTemplate` contract, not a forked game. Shared actor,
Mitch, input, cutscene, UI, and difficulty systems receive scene-authored data. Each template owns:

- static geometry/model
- route graph
- depth lanes
- prop slots
- hiding spots and occluders
- actor spawn slots and supported behaviors
- palette variants and ambient systems

Automated validators reject disconnected paths, unknown layer IDs, duplicate asset IDs, invalid
hide spots, and actor counts above the configured ceiling.

## Build Order Implications

- The build/IIFE invariant precedes UI code so direct-file compatibility never becomes a late
  retrofit.
- The reducer/RNG/difficulty pure modules precede renderer complexity.
- Washington proves the complete vertical loop before general scene abstractions are extracted.
- Crowd and Mitch systems are stabilized before final art rigs/cutscenes depend on them.
- The scene contract is extracted from working Washington behavior, then applied to fair/airport.
- Browser/file/deployment hardening is final, but direct-file smoke begins in Phase 1.

## Architectural Risks

- SVG actor count can become expensive if each actor has excessive path/node complexity.
- Occlusion can visually disagree with event targeting if pointer behavior is not tested.
- Cutscene timelines can leak game logic if allowed to dispatch multiple completion paths.
- `file://` can fail late if any module/fetch/absolute path slips into output.
- Seed changes can make screenshots brittle if streams are not isolated by subsystem.

These risks map directly to Phase 1 build tests, Phase 2 performance/occlusion tests, and Phase 5
release gates.
