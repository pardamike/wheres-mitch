# Phase 2 Research: Living World And Difficulty

## Recommendation

Build a small deterministic simulation around authored scene graphs. Update plain actor records on
each clamped animation-frame delta, then batch SVG transform and visibility writes. Navigation and
behavior are data, but scene art remains authored SVG.

## Simulation Model

Each actor has a stable ID, role, current routine, route position, speed, pose, depth band, and a
seeded decision stream. A behavior changes only at discrete checkpoints; walking interpolates
between graph nodes. The model never reads layout in its update phase.

Recommended update order:

1. Clamp frame delta to avoid a hidden-tab catch-up burst.
2. Advance the game clock only when `playing` and visible.
3. Resolve completed actor behaviors and choose seeded next actions.
4. Advance actor and Mitch route interpolation.
5. Compute pose/depth/visibility output records.
6. Apply DOM writes in a render pass.

## Occlusion

Use explicit SVG layer groups: background, rear actors, structures, mid actors, Mitch, front actors,
foreground occluders, effects. Occluding shapes that visually cover Mitch retain pointer events;
transparent decoration uses `pointer-events="none"`. Validate edge cases at each hiding spot rather
than calculating pixel masks.

## Difficulty

Treat completed rounds as a zero-based index and evaluate the formulas in `docs/GAME-DESIGN.md`.
Return a typed `DifficultyProfile`; test monotonic properties over at least rounds 0–100. Never
feed wall-clock jitter into a seeded decision. The intentionally impossible tail is a product rule,
not a bug to smooth away.

## Performance Method

- Pool actor DOM nodes and update attributes/styles rather than replacing markup.
- Prefer a single `transform="translate(...) scale(...)"` per actor root.
- Measure p50/p95 frame time over a stable 30-second, 96-actor debug scenario.
- Record hardware, browser, viewport, reduced-motion setting, and build mode.
- First simplify SVG paths, reduce writes, and remove layout reads. Consider Canvas only after a
  recorded failure and a separate architecture decision.

## Testing

- Unit: route connectivity, behavior transitions, seed determinism, pause clock, difficulty
  monotonicity, fairness bounds, max-hidden timing.
- Integration: occluder intercepts pointer activation while an exposed target catches.
- E2E: pause and page-visibility clock suspension, fixed-seed route, maximum-crowd scenario.

## Primary References

The animation-frame, page-visibility, SVG pointer-event, and reduced-motion sources are indexed in
`.planning/research/STACK.md`. Renderer and architecture tradeoffs are in
`.planning/research/ARCHITECTURE.md` and pitfalls in `.planning/research/PITFALLS.md`.

