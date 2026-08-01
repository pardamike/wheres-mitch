# Where's Mitch? — Art Bible And Asset Manifest

**Version:** v1 planning contract  
**Date:** 2026-07-31

## 1. Visual Thesis

The game looks like an original American editorial cartoon expanded into a dense animated picture
book. Geometry is clean enough for small-screen readability but imperfect enough to feel drawn.
Characters have expressive silhouettes, oversize heads/hands, flat fills, and dark ink contours.

The result must not be photorealistic and must not mimic Where's Waldo composition, lettering,
linework, striped target styling, or character language.

## 2. Drawing Rules

- Logical artboard: SVG `1440 × 900`.
- Primary character outline: 3.5–5 SVG units at 1× character scale.
- Secondary/internal line: 2–3 units.
- Background architecture line: 2–3 units; distant objects 1–2 units.
- Use round joins/caps for organic figures and slightly squared joins for buildings/machines.
- Flat fills first; use at most one cell-shadow and one small highlight per form.
- Avoid expensive animated blur, turbulence, displacement, or drop-shadow filters.
- Paper texture, if used, must be a tiny local/inline repeating pattern at ≤6% opacity.
- Faces require readable eyes, nose, mouth, and brow at the supported minimum viewport.
- Hands, heads, hats, and carried objects may overscale for visual clarity.
- Favor reusable semantic SVG groups over one enormous exported path.

## 3. Originality And Rights Rules

- Draw every final vector specifically for this project.
- Do not trace photographs. Reference public appearances only to understand general recognizable
  features, then produce original simplified geometry.
- Do not import political logos, campaign marks, news graphics, or copyrighted cartoons.
- The Capitol, generic flags, vehicles, buildings, and public symbols must be independently drawn.
- The Chinese flag may be reproduced accurately as a national flag; do not copy a branded
  helicopter or official agency livery.
- Use no speech recordings, music samples, stock sound effects, remote font, or stock illustration
  unless its license and attribution are added before inclusion.
- Every asset must be entered in the manifest at the end of this document.
- Project-original code and art ship under the repository's MIT license unless a later explicit
  asset license says otherwise.

## 4. Turtle Mitch Rig

### Readable Identity

Use restrained public-figure caricature cues:

- Large rounded head and pronounced lower face
- Light swept-back hair shape
- Heavy-lidded eyes and expressive brow
- Small rimless/understated glasses only if they improve recognition in review
- Suit collar and compact tie emerging at shell/neck junction
- Expressions based on comic situation: cautious, startled, smug, determined

Do not exaggerate medical, mobility, age-related, or disability traits.

### Rig Groups

```text
mitch-root
├── shadow
├── back-legs
├── shell-back
├── body
├── front-legs
├── shell-front
├── neck
├── head
│   ├── face-base
│   ├── hair
│   ├── ears
│   ├── eyes
│   ├── lids
│   ├── brows
│   ├── nose
│   ├── mouth
│   └── expression-lines
├── collar
├── tie
└── hit-target
```

### Required Poses/Expressions

- Neutral extended walk
- Cautious peek left/right
- Slow blink
- Startled catch
- Smug pre-escape glance
- Full shell tuck
- Rapid scuttle cycle
- Hanging shell/load pose for helicopter sequence

### Animation

- Walk cycle: opposing leg pairs, slight shell counter-rotation, minimal head bob.
- Peek: neck extension first, then head rotation and blink.
- Tuck: face compresses slightly, neck retracts, limbs fold, shell closes.
- High speed: shorten gait loop until a tasteful “wheel legs” smear at absurd rounds.
- Hit region is a separate transparent authored shape, not inferred from a bounding rectangle.

## 5. Elaine Chao Cockpit Rig

Elaine Chao is a public figure and should be recognizable through a respectful simplified portrait,
not ethnic coding.

Required elements:

- Head/shoulders cockpit bust
- Dark shoulder-length hairstyle based on general public appearance
- Neutral professional jacket
- Hands on controls or one small wave
- Neutral/focused and quick sideways-glance expressions
- No accent text, stereotyped eyes, costume, or cultural props

She remains a secondary 80–110 SVG-unit element inside the cockpit window; the sequence does not
pause for a portrait reveal.

## 6. Helicopter Rig

The helicopter is deliberately toy-like and physically implausible.

```text
helicopter-root
├── tail-rotor
├── tail
├── fuselage
├── landing-skids
├── cockpit-glass
├── cockpit-character
├── chinese-flag-decal
├── main-rotor-mast
├── main-rotor
├── rope
└── hook
```

- Fuselage: rounded red shape, gold/cream trim, no real manufacturer or military markings.
- Chinese flag: `#DE2910` field with one large and four smaller `#FFDE00` stars in the correct
  upper-hoist arrangement. It must remain readable in compact landscape.
- Rotors: transform-only animation with a motion-smear alternate under full motion.
- Rope: segmented or path-based line with bounded pendulum motion.
- Hook/load: comic oversized hook; it loops harmlessly around shell and bag straps.
- Vehicle contains no weapon, insignia, agency label, or realistic tactical detail.

## 7. Money-Bag Set

Create at least three shape variants:

- Small tied canvas bag
- Large bulging canvas bag
- Rectangular comically overstuffed satchel

Use tan/brown canvas, green dollar glyph, and exaggerated squash. Bags appear from nowhere with
star/puff effects so the image cannot read as documentary evidence. No real currency artwork,
bank logo, amount, or transaction text appears.

## 8. Capitol Vignette

- Original simplified U.S. Capitol exterior with dome, columns, steps, and central doorway.
- White/cream stone with blue-gray cell shadow and small red/blue accents.
- Doorway sized to receive the shell.
- Dome performs one subtle elastic bounce on shell arrival.
- No seal, Senate logo, copied photograph, or exact architectural blueprint is required.
- Keep this vignette visually distinct from the distant Washington-scene skyline.

## 9. Crowd System

### Body Families

At least twelve base silhouettes:

1. Tall commuter
2. Short commuter
3. Broad tourist
4. Slim tourist
5. Parent/caregiver
6. Child
7. Elderly pedestrian depicted neutrally
8. Worker/maintenance person
9. Vendor
10. Performer/musician
11. Traveler with luggage
12. Costumed fair mascot

Each family supports a curated subset of heads, hair, skin tones, tops, bottoms, shoes,
accessories, and carried props. Diversity comes from balanced modular variation, not one-token
stereotypes.

### Accessories

- Hats, glasses, headphones, scarf, backpack, camera, phone, coffee, umbrella
- Briefcase, suitcase, stroller, balloon, food tray, instrument, cleaning tool
- Scene-specific staff badges/aprons that use fictional marks

### Behavior Poses

- Walk A/B
- Idle/check phone
- Conversation gesture
- Queue shift
- Sit
- Point/react
- Take photo
- Hold/carry scene prop

## 10. Washington Scene Asset List

### Static Background

- Sky and distant skyline
- Building facades with fictional signage
- Road, sidewalks, curbs, crosswalk
- Metro entrance and stairs
- Trees/planters

### Interactive/Ambient

- Bus shelter with opaque ad panel
- City bus
- Taxi and bicycle
- Food cart, vendor, queue markers
- Newspaper boxes
- Benches
- Pigeons and paper scraps
- Traffic light/crosswalk signal
- Steam vent

### Foreground Occluders

- Large tree canopy/trunk
- Passing bus/taxi
- Food cart awning/body
- Shelter panel
- Dense crosswalk actor group

## 11. Kentucky Fair Asset List

### Static Background

- Fairground horizon, fencing, banners
- Ferris wheel and midway
- Performance platform
- Booth row
- Livestock area

### Interactive/Ambient

- Tractor
- Hay bales
- Food/griddle stand
- Ring-toss or fictional game stall
- Picnic tables
- Livestock silhouettes
- Balloons, flags, prize wall
- Musician/performer group

### Foreground Occluders

- Booth counter and awning
- Tractor
- Hay stack
- Ferris wheel support
- Parade/crowd cluster
- Prize wall/photo cutout

## 12. Airport Asset List

### Static Background

- Window wall and airplane silhouettes
- Gate architecture and corridor
- Departure board with fictional destinations
- Moving walkway
- Gate seating

### Interactive/Ambient

- Kiosk
- Luggage cart and baggage variants
- Cleaning machine
- Queue stanchions
- Traveler screens/signage
- Service vehicle
- Rolling suitcases
- Airport staff/crew families

### Foreground Occluders

- Pillars
- Kiosk
- Luggage cart
- Seating cluster
- Moving walkway barrier
- Boarding queue

## 13. Effects Library

- Miss ripple and `×`
- Spotlight cone/vignette
- Catch stars and paper trail
- Shell spin arcs
- Pneumatic-tube/portal bands
- Capitol stamp
- Money pop puffs
- Rotor wind lines
- Flying hats/papers
- Rope tension snap line
- New-best ribbon

Effects use pooled SVG groups and transform/opacity animation only.

## 14. SVG Authoring Rules

- Give every reusable rig group a stable semantic ID/class, not editor-generated names.
- Remove editor metadata, embedded rasters, hidden layers, and unused definitions.
- Convert only decorative lettering to paths; retain UI text as real HTML.
- Keep each scene's static SVG/model construction separate from actor instances.
- Never attach gameplay state directly to arbitrary SVG path objects.
- Avoid clipping/masking where normal foreground layering works.
- View every target/cutscene asset at 667×375 before approval.
- Optimize by hand or reviewed tooling; never accept an optimizer change that breaks IDs or
  appearance without visual comparison.

## 15. Asset Manifest

Every shipped visual or procedural audio source must appear here. All listed art is drawn as
project-specific vector code: no traced photographs, copied cartoon artwork, stock illustration,
recorded audio, remote source, or embedded raster is shipped.

| Asset family | Author/source | Owning source path | License | Attribution | Modification | Status |
|---|---|---|---|---|---|---|
| Turtle Mitch rig | Project-original inline SVG | `src/render/art/mitch.ts` | MIT project asset | None | Original vector anatomy and pose joints | Shipped |
| Elaine cockpit rig | Project-original inline SVG | `src/render/art/elaine.ts` | MIT project asset | None | Original respectful simplified bust | Shipped |
| Cartoon helicopter and PRC flag motif | Project-original inline SVG; national-flag colors/motif | `src/render/art/helicopter.ts` | MIT project asset / public national flag depiction | None | Original toy-like vehicle and hand-authored star paths | Shipped |
| Money-bag variants | Project-original inline SVG | `src/render/art/money.ts` | MIT project asset | None | Original bags, satchel, and generic dollar marks | Shipped |
| Capitol vignette | Project-original inline SVG | `src/render/art/capitol.ts` | MIT project asset | None | Original simplified cartoon architecture | Shipped |
| Crowd body-part library | Project-original inline SVG | `src/render/art/crowd.ts` | MIT project asset | None | Twelve modular silhouette families and accessories | Shipped |
| Shared SVG art utilities | Project-original code | `src/render/art/shared.ts` | MIT project asset | None | Safe DOM construction and original palette helpers | Shipped |
| Washington scene/background/props | Project-original inline SVG | `src/render/art/washington.ts`, `src/render/stage-renderer.ts` | MIT project asset | None | Original street, buildings, transit, trees, and effects | Implemented — owner review pending |
| UI, title illustration, and lettering | Project-original HTML/CSS/inline SVG | `public/index.html`, `public/styles.css` | MIT project asset | None | Original controls, copy layout, and title vignette | Shipped |
| Favicon | Project-original inline SVG | `public/favicon.svg` | MIT project asset | None | Original local icon | Shipped |
| Visual effects and cutscene composition | Project-original inline SVG/code | `src/render/cutscenes/sequence.ts`, `src/render/cutscenes/capture.ts`, `src/render/cutscenes/escape.ts` | MIT project asset | None | Original pooled effects and outcome choreography | Implemented — owner review pending |
| Sound cues | Synthesized at runtime | `src/audio/audio-engine.ts`, `src/audio/cues.ts` | Project-original parameters/code | None | Oscillator/noise/envelope synthesis only | Implemented — owner review pending |
| Kentucky fair scene | Project-original inline SVG | `src/render/art/fair.ts` | MIT project asset | None | Original Ferris wheel, midway, pavilion, booths, prize wall, hay, livestock, and fairground props | Implemented — owner review pending |
| Airport scene | Project-original inline SVG | `src/render/art/airport.ts` | MIT project asset | None | Original window wall, walkway, board, gate furniture, kiosk, luggage, and concourse props | Implemented — owner review pending |
| Any recorded sound | Not approved for v1 | None | N/A | N/A | No recorded sound is shipped | Excluded |
| Fonts | System font stacks | `public/styles.css` | Platform-provided | N/A | No bundled or remote font | Shipped |

## 16. Art Approval Gate

Before Phase 3 is considered complete, human review must approve:

- Mitch is recognizable and funny without copying a photograph or mocking health/disability.
- Turtle anatomy reads clearly at minimum size and supports tuck/scuttle animation.
- Elaine Chao is recognizable enough for the intended gag and free of ethnic stereotype.
- Helicopter is unmistakably cartoon fiction and the Chinese flag is accurate/visible.
- Money bags appear magically and comedically rather than as a realistic transaction.
- Capitol destination is immediately recognizable.
- Crowd diversity feels natural and no modular combination creates offensive imagery.
- No scene or target design resembles Where's Waldo protected visual identity.
- All manifest entries are complete and compatible with repository distribution.

Implementation review completed at desktop and 667×375 landscape scale on 2026-07-31. Owner sign-off
on the caricature, flag treatment, outcome timing, and published copy remains required before a public
release.

The Phase 4 fair and airport compositions have automated desktop/mobile coverage. Owner visual review
of their density, target readability, and tone remains required before a public release.
