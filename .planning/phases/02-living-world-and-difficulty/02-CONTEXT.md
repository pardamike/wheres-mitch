# Phase 2 Context: Living World And Difficulty

## Boundary

Turn the Phase 1 Washington slice into a living hidden-object simulation. This phase owns actor
behavior, route graphs, true SVG occlusion, Turtle Mitch's hiding logic, difficulty escalation,
pause lifecycle, and measured crowd performance.

## Locked Decisions

- **D2-01 — Purposeful actors:** people choose destinations and short behavior routines; they do
  not wander through per-frame random jitter.
- **D2-02 — Lightweight model:** arrays of plain typed objects and batched SVG transforms are the
  default. Do not introduce an ECS library.
- **D2-03 — Scene-authored navigation:** each template exposes nodes, edges, hiding spots,
  occluders, and behavior anchors through one `SceneDefinition` contract.
- **D2-04 — Physical continuity:** Mitch moves along valid edges. Hiding changes visibility but
  never teleports him between unrelated points.
- **D2-05 — Real occlusion:** opaque foreground SVG elements remain above Mitch and accept pointer
  events, so clicks do not pass through them.
- **D2-06 — Early fairness:** the first rounds cap fully hidden time and guarantee readable
  transit/peek windows. Difficulty may later violate human comfort intentionally.
- **D2-07 — Formula-driven absurdity:** use the canonical monotonic curves in
  `docs/GAME-DESIGN.md`; do not hand-author a finite level table or cap the endgame at "fair."
- **D2-08 — Deterministic clocks:** simulation consumes clamped `requestAnimationFrame` deltas;
  seeded choices never use `Math.random()`.
- **D2-09 — Pause is time suspension:** manual pause and document invisibility stop simulation
  clocks, scheduled actions, and audio. Resume does not fast-forward elapsed wall time.
- **D2-10 — Measure before changing renderer:** preserve inline SVG unless the documented
  96-actor targets fail after simple batching/pooling improvements.

## Behavior Families

- Commuter: walk between entrances and transit anchors; pause to check a watch or phone.
- Conversational pair: approach, face one another, gesture, then separate.
- Queue participant: join a slot, advance when the lead actor leaves, then exit.
- Sitter: approach bench/seat, sit for a bounded duration, then depart.
- Prop user: interact with vendor, sign, kiosk, luggage, or crossing signal.
- Reactor: briefly points or turns after click feedback, then resumes its previous routine.

## Fairness Invariants

- A valid path always exists from Mitch's current node to at least one next hiding spot.
- Early-round fully hidden duration never exceeds the canonical difficulty output.
- Mitch's visible transit and peek states expose a clickable silhouette for the configured window.
- An occluder blocks clicks only where its visible geometry is opaque.
- Clicks during pause or outcome locks never decrement attempts.
- The same seed plus the same input sequence produces the same route/timing decisions.

## Performance Budget

- Desktop target: 60 FPS at 96 crowd actors on the documented reference profile.
- Mobile landscape floor: 30 FPS at 96 crowd actors on the documented reference profile.
- No DOM allocation in the steady-state animation loop.
- Write transforms/visibility in one render pass; avoid layout reads after writes.
- Hidden tabs perform no simulation work.

## Deferred

Final character art, cutscene motion, and audio remain Phase 3. New templates remain Phase 4.

