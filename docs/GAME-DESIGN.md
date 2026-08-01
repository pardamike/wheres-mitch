# Where's Mitch? — Game Design Specification

**Version:** v1 planning contract  
**Date:** 2026-07-31  
**Status:** Locked for implementation unless explicitly revised by the user

## 1. Product Statement

Where's Mitch? is a fast, replayable hidden-object game set inside animated cartoon crowds. The
player has ten clicks to find Turtle Mitch. A catch sends him back to the Capitol and starts a
harder round; ten misses let him escape and end the run.

The comedy comes from three things working together:

1. A recognizable but entirely original turtle-bodied caricature moving through an absurdly
   busy world.
2. Environments whose people appear to have errands, relationships, and reactions rather than
   behaving like decorative particles.
3. Difficulty that begins as a fair visual search and eventually becomes hilariously impossible.

## 2. Player Promise

Within ten seconds of pressing Start, the player understands what to find, sees a scene alive with
motion, and can make a meaningful attempt. Every click produces feedback. Every successful catch
delivers a short comic payoff. Every loss delivers the full signature helicopter escape.

There is no campaign, ending, progression tree, account, or metagame. The player tries to beat the
number of rounds from the previous run.

## 3. Tone And Framing

- Tone: absurd, mischievous, editorial-cartoon satire.
- The joke targets public political imagery and the fictional situation, not age, disability,
  nationality, ethnicity, or private family members.
- Mitch McConnell and Elaine Chao are depicted as recognizable public-figure caricatures without
  photorealistic copying or ethnic stereotype.
- The Chinese flag is a conspicuous prop on a physically impossible cartoon escape vehicle. The
  game never claims the vehicle, cash, conduct, or event is real.
- No text asserts that Mitch is currently absent, ill, corrupt, controlled by a foreign power, or
  engaged in misconduct.
- Published copy does not use “Where's Waldo,” its logo, signature costume, layouts, or art.

### Mandatory Full Disclaimer

Display in the title-screen information area and credits/about panel:

> Where's Mitch? is an absurd work of fictional political satire. All characters and events are
> exaggerated and invented. This game is not affiliated with or endorsed by Mitch McConnell,
> Elaine Chao, the U.S. Senate, the U.S. government, the Chinese government, or any other depicted
> person or institution.

The title screen may show a shorter line if the full text is simultaneously visible via an
expanded information region:

> Fictional political satire. Not affiliated with or endorsed by any depicted person or
> institution.

## 4. Core Run Loop

1. Title screen explains the target and ten-click rule.
2. Player presses **Start the Search**. This gesture also unlocks audio.
3. A scene and deterministic seed are selected; a brief round card names the location.
4. Player searches while the crowd and Mitch continue moving.
5. Each incorrect stage activation consumes one click.
6. A successful Mitch activation plays the Capitol-return sequence.
7. Completed rounds increment by one, clicks reset to ten, difficulty increases, and a different
   scene template begins.
8. The tenth incorrect activation plays the helicopter escape.
9. Game-over card shows run statistics and local records.
10. **Search Again** begins a clean run at round one with a new run seed.

## 5. Click Rules

- `clicksRemaining` begins at exactly `10` each round.
- Only a primary `pointerdown` inside the stage while state is `PLAYING` can be an attempt.
- Mouse buttons other than primary, secondary clicks, scrolling, pinch gestures, and HUD controls
  do not consume attempts.
- The single stage handler checks `event.composedPath()` for Mitch before dispatching a miss, so a
  correct target activation always has priority.
- Clicking Mitch with one click remaining is a successful catch. A correct click never decrements
  the counter first.
- An incorrect click decrements exactly once, even if nested SVG elements receive the event.
- Input is locked during intro cards, pause, success, escape, transition, and game-over states.
- A short miss ripple remains at the selected coordinate for 300 ms. The click counter bumps and
  one nearby crowd actor may react, but Mitch does not teleport in response to a miss.
- When the tenth miss occurs, `MITCH_ESCAPE` is entered atomically; later queued input is ignored.

## 6. State Machine

| State | Allowed Inputs | Exit |
|-------|----------------|------|
| `BOOT` | None | Assets and systems ready → `TITLE` |
| `TITLE` | Start, sound, reduced-motion setting | Start → `ROUND_INTRO` |
| `ROUND_INTRO` | Pause/mute only | Intro timer completes → `PLAYING` |
| `PLAYING` | Stage pointer, Mitch pointer, pause, mute, restart confirmation | Catch → `PLAYER_CAPTURE`; tenth miss → `MITCH_ESCAPE`; pause → `PAUSED` |
| `PAUSED` | Resume, mute, restart | Resume → prior playable state |
| `PLAYER_CAPTURE` | Mute, optional cutscene skip after one second | Sequence completes → `ROUND_TRANSITION` |
| `ROUND_TRANSITION` | Mute | Scene ready → `ROUND_INTRO` |
| `MITCH_ESCAPE` | Mute, optional cutscene skip after one second | Sequence completes → `GAME_OVER` |
| `GAME_OVER` | Search again, sound, reduced motion | Restart → `ROUND_INTRO` |

`visibilitychange` creates an internal suspension without overwriting the public state. On hide,
the clock, simulation, and audio suspend. On show, they resume only if the player had not manually
paused. No hidden-tab time is included in fastest-find statistics.

## 7. Score And Records

### Primary Score

`completedRounds` is the run score. It increases only after the Capitol sequence commits the catch
and never decreases within a run.

### Game-Over Statistics

- Rounds returned to the Capitol
- Total attempts made
- Correct catches
- Accuracy percentage: `catches / totalAttempts`
- Fastest successful round in the run
- Best all-time completed rounds on this device/origin

### Saved Records

- `bestRounds`: maximum completed rounds before an escape
- `fastestFindMs`: shortest visible, unpaused round time ending in a catch
- `lifetimeCatches`: total successful catches recorded by this browser storage area
- `soundEnabled`
- `reducedMotionOverride`: `system`, `reduce`, or `full`

No online or shared score exists. Direct-file storage is explicitly best effort.

## 8. Difficulty Model

Difficulty uses round number only; misses do not secretly move or accelerate Mitch. Let
`i = roundNumber - 1`.

Initial tuning constants:

| Parameter | Formula | Purpose |
|-----------|---------|---------|
| Crowd count | `min(48 + 4 * i, 96)` | Adds visual density until the performance ceiling |
| Crowd speed multiplier | `min(1 + 0.035 * i, 1.65)` | Keeps ambient life lively but legible |
| Mitch transit speed | `min(2000, 70 * 1.12^i)` SVG units/sec | Produces the eventually impossible chase |
| Route-decision interval | `max(70, 3200 * 0.87^i)` ms | Increases hiding-place churn |
| Hiding dwell | `max(70, 2100 * 0.89^i)` ms | Shortens stationary inspection windows |
| Peek duration | `max(60, 1200 * 0.90^i)` ms | Reduces recognizable target exposure |
| Maximum full occlusion | `max(140, 2400 * 0.92^i)` ms | Prevents unfair early disappearance |
| Target hitbox scale | `max(0.72, 1.15 * 0.975^i)` | Generous early hit target, smaller late target |

The 60–140 ms safety floors and speed ceiling prevent zero-duration loops and numerical instability;
the combined late-round behavior is still functionally impossible. Values may be tuned during Phase
2 visual playtesting, but all curves must remain monotonic and the crowd ceiling remains fixed.

## 9. Mitch Behavior Contract

### Visual Identity

- Recognizable original head caricature with separate face, eyes, lids, mouth, neck, and expression
  layers.
- Olive turtle body, brown patterned shell, small tie, and four animated limbs.
- Signature readable motions: slow blink, cautious neck extension, shell tuck, hurried scuttle.
- No red-and-white striped costume or direct hidden-object-franchise visual reference.

### Navigation

- Every scene exposes a connected route graph and a set of authored hiding spots.
- Mitch chooses a destination with seeded weighted randomness.
- He interpolates along path segments; he never teleports during active play.
- Destination selection discourages immediate backtracking and repeating the same spot.
- Route traversal may cross behind crowd actors and authored foreground occluders.
- At a hiding spot he may idle, peek, change expression, reverse, or choose the next route.

### Early-Round Fairness

- Round one begins with at least 65% of Mitch's head visible.
- The first route decision occurs no sooner than 2.4 seconds after the scene becomes playable.
- A round-one full-occlusion interval cannot exceed 2.4 seconds.
- Mitch must enter a visible transit or peek window after each full-occlusion interval.
- The initial target hit region is approximately 15% larger than painted bounds.
- Occluders block target clicks when they visually cover Mitch; invisible click-through is forbidden.

## 10. Living Crowd Contract

Crowd motion is authored behavior over a path network, not Brownian drift.

Required behavior families:

- **Commute:** walk between entrances, crossings, gates, or seating.
- **Queue:** join, wait, shuffle, and exit a line.
- **Conversation:** approach another actor, face them, gesture, then separate.
- **Observe:** stop at a sign, display, booth, aircraft board, or performer.
- **Sit:** occupy a valid seat and perform a small idle loop.
- **Interact:** buy food, take a photo, wave, check luggage, feed a pigeon, or inspect a prop.
- **React:** turn, hop, point, or briefly scatter after a nearby miss or cutscene event.

Actor behavior is seed-driven, has a destination and duration, and transitions through a small
state machine. Crowd actors use scene-valid paths and cannot walk through major props. Repeated
actors vary palette, hairstyle, body shape, accessory, direction, cadence, and activity.

## 11. Scene Templates

### 11.1 Washington Street

Visual anchors:

- Wide downtown street and crosswalk
- Metro entrance
- Bus shelter and moving city bus
- Food cart with short queue
- Trees, newspaper boxes, benches, pigeons, taxi, bicycles
- Distant Capitol silhouette as geography, not the win-sequence Capitol endpoint

Primary hiding/occlusion:

- Bus shelter panel
- Food cart and queue
- Tree trunk/canopy
- Passing bus/taxi
- Metro stair rail
- Newspaper box cluster
- Dense crosswalk group

### 11.2 Kentucky County Fair

Visual anchors:

- Ferris wheel and midway lights
- Food booths and game stalls
- Hay bales, livestock pen, tractor, picnic tables
- Small performance platform and banner flags
- Families, fair workers, musicians, farmers, costumed mascot

Primary hiding/occlusion:

- Booth counters and awnings
- Tractor and hay stacks
- Livestock gate
- Ferris wheel supports
- Parade/crowd cluster
- Photo cutout and prize wall

### 11.3 Airport Concourse

Visual anchors:

- Gate seating and large windows
- Departure board
- Moving walkway
- Security/boarding queue
- Kiosks, pillars, luggage carts, cleaning machine
- Travelers, crew, workers, families, business passengers

Primary hiding/occlusion:

- Kiosk and pillar
- Luggage cart and baggage pile
- Gate seating clusters
- Moving walkway barrier
- Queue stanchions and traveler groups
- Passing service vehicle

## 12. Procedural Round Generation

Each new run receives a 32-bit seed from `crypto.getRandomValues` with a timestamp fallback. Each
round derives independent sub-seeds for scene selection, palette, static props, crowd, Mitch, and
ambient effects so changing one generator does not scramble every subsystem.

The scene shuffle bag:

1. Contains all three scene IDs.
2. Is shuffled by the run PRNG.
3. Prevents the first scene of a refill from matching the previous scene.
4. Exhausts all IDs before refill.

Variation may change:

- Daylight/palette variant
- Accessory and clothing palettes
- Optional prop presence within authored slots
- Actor identities and behavior assignments
- Route start positions and compatible destinations
- Active hiding spots and Mitch route selection
- Ambient particles and vehicle timing

Variation may not create disconnected paths, unreachable hiding spots, click-through occlusion, or
layout collisions that cover the HUD.

## 13. Player-Win Sequence

Target total duration: 3.3–4.0 seconds in full motion.

1. **Recognition, 0–250 ms:** Input locks, crowd freezes into reaction poses, stage desaturates,
   and a warm spotlight isolates Mitch.
2. **Tuck, 250–750 ms:** Mitch blinks, grimaces, and retracts head/limbs into the shell.
3. **Dispatch, 750–1100 ms:** A red-white-and-blue congressional pneumatic tube/portal appears and
   the shell begins spinning.
4. **Travel, 1100–2600 ms:** Shell follows a visible curved SVG route toward a cartoon Capitol
   vignette while papers and small stars trail it.
5. **Arrival, 2600–3200 ms:** Shell lands inside the Capitol doorway; dome gives a subtle bounce.
6. **Stamp, 3200–3550 ms:** `RETURNED TO THE CAPITOL` stamp lands under `FOUND HIM!`.
7. **Transition, 3550–4000 ms:** Scene dissolves into the next round card.

Reduced motion replaces the long travel path with a short dissolve between scene and Capitol while
retaining tuck, destination, message, and state timing.

## 14. Mitch-Win Sequence

Target total duration: 5.3–6.2 seconds in full motion.

1. **Lock, 0–250 ms:** Tenth miss marker appears, input locks, crowd looks toward Mitch.
2. **Cash, 250–800 ms:** Multiple cartoon money bags pop into existence around Turtle Mitch with
   intentionally impossible squash-and-stretch.
3. **Approach, 500–1800 ms:** Rotor sound and wind begin; papers, hats, and flags react before the
   vehicle is visible.
4. **Helicopter entry, 1200–2600 ms:** A clearly fictional red cartoon helicopter crosses into the
   stage. A correct Chinese flag decal is unmistakable on its fuselage. Elaine Chao's respectful
   public-figure caricature is visible in the cockpit.
5. **Rope, 2400–3500 ms:** Rope and hook lower, loop around the turtle shell and money bags, and
   become taut. There is no injury, impact, weapon, or threat.
6. **Lift, 3500–4500 ms:** Mitch retracts, bags swing, and the load rises. Crowd reacts to wind.
7. **Escape, 4500–5400 ms:** Helicopter and load accelerate offscreen with rotor Doppler.
8. **Card, 5400–6200 ms:** `MITCH GOT AWAY` game-over card appears with results and
   **Search Again**.

A labeled Skip control becomes available after one second. Reduced motion condenses approach,
rope, and exit into short crossfades while preserving the helicopter, flag, wife, money, and final
message.

## 15. Pause, Restart, And Visibility

- Pause is available during `ROUND_INTRO` and `PLAYING` only.
- Pause overlay obscures the scene enough to prevent studying a frozen target.
- Restart from active play requires confirmation because it ends the current score.
- Browser visibility suspension is automatic and does not show a confirmation.
- Returning to a hidden-suspended page shows a three-second `READY — SET — FIND` countdown before
  target movement resumes, unless the player was manually paused.
- Cutscenes pause when the page hides and resume at the same timeline position.

## 16. Canonical UI Copy

| Context | Copy |
|---------|------|
| Title | `WHERE'S MITCH?` |
| Subtitle | `Ten clicks. One extremely evasive turtle.` |
| Start | `START THE SEARCH` |
| Instruction | `Find Turtle Mitch before your ten clicks run out.` |
| Attempt label | `CLICKS LEFT` |
| Score label | `RETURNED` |
| Record label | `BEST RUN` |
| Pause | `PAUSED — Mitch is still in there.` |
| Catch headline | `FOUND HIM!` |
| Catch stamp | `RETURNED TO THE CAPITOL` |
| Loss headline | `MITCH GOT AWAY` |
| Restart | `SEARCH AGAIN` |
| Rotate prompt | `Rotate your device for the full search.` |

Do not add topical claims, news references, accusations, or dated copy without explicit review.

## 17. Definition Of Fun

The game is ready for release when a first-time player can:

- Identify the goal without explanation.
- Enjoy watching the scene before clicking anything.
- Find Mitch in the first one or two rounds without feeling cheated.
- Understand every miss and why it consumed an attempt.
- Laugh at both outcome sequences at least once.
- Immediately choose to try another run.

If animation polish threatens click correctness, target visibility, frame rate, or fast restart,
the core loop wins.
