# Phase 4 Research: Scene Deck And Variety

## Recommendation

Extract the smallest scene-definition interface proven by Washington, then implement fair and
airport as separate modules. Share runtime systems and typed validation; do not force visual markup
into one universal component or procedural scene generator.

## Scene Contract

A scene provides a stable ID, SVG factory, logical view box, route graph, depth bands, behavior
anchors, hiding spots, variant tables, allowed palettes, actor role weights, and debug landmarks.
Creation receives one scene seed and returns a validated immutable instance. Runtime systems never
branch on scene ID for ordinary navigation or click behavior.

## Variation

Derive named RNG streams from the round seed (`scene`, `crowd`, `mitch`, `cosmetic`) so adding a
cosmetic choice cannot silently change Mitch's route. Select only from authored, tested options.
Persist the selected variant identifiers in debug state for screenshot diagnosis.

## Shuffle Bag

Use a seeded Fisher–Yates shuffle over all scene IDs. When refilling, if the first item equals the
last scene, swap it with the next item. The bag is run-scoped and resets on Search Again. Unit-test
determinism, complete coverage, and no boundary repeat.

## Scene Validation

At build/test time, validate unique node/spot IDs, edge endpoints, connected Mitch graph, nonempty
variant tables, hiding-spot reachability, and canonical viewport bounds. At runtime, invalid scene
data should fail loudly in development; production ships only validated bundled definitions.

## Testing

- One contract test suite runs against all three definitions.
- Fixed seeds exercise catch and ten-miss loss in each scene.
- Canonical screenshots cover title-scale desktop, gameplay desktop, and mobile landscape.
- Variation tests assert meaningful output changes without asserting incidental actor ordering.
- Human visual review checks crowd diversity, target readability, layering, and scene identity.

## Avoid

- No dynamic import or network-loaded scene packs.
- No random pixel placement.
- No common mega-file containing all SVG markup.
- No scene-specific conditionals in the core controller when contract data can express behavior.
