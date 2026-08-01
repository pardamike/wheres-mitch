# Phase 4 Context: Scene Deck And Variety

## Boundary

Generalize the proven Washington scene contract just enough to ship two additional deep templates:
a Kentucky county fair and an airport concourse. Add seeded procedural variation and shuffle-bag
selection without turning scenes into arbitrary generated worlds.

## Locked Decisions

- **D4-01 — Three deep templates:** ship Washington, Kentucky fair, and airport. Prefer authored
  density and readable jokes over many shallow backdrops.
- **D4-02 — Shared contract, bespoke composition:** routes, actors, hiding spots, and variations
  share types; SVG composition and scene-specific behaviors remain local to each scene.
- **D4-03 — Curated procedural variation:** seeds select from validated palettes, props, actors,
  paths, and hiding spots. They do not place arbitrary geometry.
- **D4-04 — Shuffle bag:** every template appears once per bag, the new bag avoids repeating the
  prior scene first, and deterministic seed controls bag order.
- **D4-05 — Template identity:** Washington feels civic/urban, the fair feels busy/outdoor/rural,
  and the airport feels layered/indoor/transit-oriented at a glance.
- **D4-06 — Equivalent rules:** every scene supports the same ten-click accounting, target
  accessibility, cutscenes, pause behavior, debug seeds, and early-round fairness.
- **D4-07 — Stable screenshots:** canonical seeds are reserved and changes to them require explicit
  visual approval, not automatic snapshot regeneration.

## Scene Signatures

### Kentucky County Fair

Ferris wheel, midway tents, livestock/pavilion edge, stage or contest area, picnic/queue zones,
hay bales and signs as occluders, families and vendors performing authored routines, warm late-day
palette, and multiple lateral/looping routes.

### Airport Concourse

Gate windows, moving walkway, seating banks, cafe/kiosk, departures board, luggage flow, columns
and queue dividers as occluders, travelers/gate agents/cleaners performing routines, cool indoor
palette, and layered near/far transit lanes.

## Variation Invariants

- Seed changes at least crowd identities, palette accents, prop variants, route choices, and Mitch
  hiding choices.
- All selected hiding spots connect to the route graph.
- Foreground occluders preserve at least one fair early-round reveal path.
- HUD contrast and target silhouette remain readable under every allowed palette.
- No randomly selected text, flag, or prop changes the satire's factual framing.

## Deferred

Additional scenes, daily seeds, and user-generated content remain v2 ideas and are not scaffolding
requirements for this phase.

