# Phase 4 UI Contract: Scene Deck And Variety

The shell and HUD remain constant. Each scene uses the same logical stage box and interaction
semantics while presenting a distinct authored world.

## Kentucky County Fair

- Palette: late-day sky, barn red, corn/gold, grass green, canvas cream, midway accents.
- Back layer: horizon, wheel, distant barns/pavilion.
- Activity layer: midway walkers, food queue, seated picnic group, livestock/contest visitors,
  vendor exchanges, stage spectators.
- Occluders: hay stacks, booth skirts, signs, fence rails, passing foreground visitors.
- Motion signatures: slow Ferris wheel, pennants, steam/puffs, stage gestures, queue advancement.
- Do not use stereotypes of Kentucky residents; crowd roles and bodies should be varied and warm.

## Airport Concourse

- Palette: cool window blue, steel gray, navy, warm cafe amber, restrained airline accents.
- Back layer: windows/runway silhouettes, gate walls, departures board.
- Activity layer: walkway travelers, seating, gate queue, cafe users, cleaner, luggage flow.
- Occluders: columns, kiosk, seating backs, luggage carts, foreground travelers.
- Motion signatures: moving walkway, rolling luggage, board flip/fade, aircraft taxi silhouette.
- Avoid real airline branding, airport logos, or security-alarm imagery.

## Cross-Scene Rules

- The stage never labels which hiding spot contains Mitch.
- Turtle Mitch retains identical silhouette/scale logic even when palette accents vary.
- Scene-specific foreground elements cannot obscure the HUD or outcome overlays.
- Cutscene entry/exit coordinates adapt to the scene box but staging remains recognizable.
- Crowd palette variation maintains skin/hair/clothing diversity without tokenized caricature.

## Canonical Screenshot Seeds

Reserve the seed names in `docs/TEST-PLAN.md` for:

- Washington early round and maximum crowd.
- Fair early round and one procedural variant.
- Airport early round and one procedural variant.
- All three at 667×375 landscape.

Screenshot diffs are reviewed for layering, clipping, target readability, HUD collision, and
unintended changes to character design. Baselines are never updated merely to make CI green.

## Acceptance

- A five-second glance correctly identifies all three settings.
- Each scene demonstrates at least five purposeful ambient behaviors.
- No immediate scene repeat occurs during 30 deterministic successful rounds.
- Fixed seeds reproduce the same variant, crowd identities, and target route.

