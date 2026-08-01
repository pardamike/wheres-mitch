# Requirements: Where's Mitch?

**Defined:** 2026-07-31  
**Core Value:** Finding a constantly moving Turtle Mitch inside a scene that feels genuinely
alive must be funny, fair at first, and immediately satisfying to replay.

## v1 Requirements

### Core Loop

- [x] **LOOP-01**: Player can start a new run from a title screen and enter the first round.
- [x] **LOOP-02**: Player begins every round with exactly ten available clicks shown in the HUD.
- [x] **LOOP-03**: Each incorrect primary mouse or touch activation during play consumes exactly
  one click and produces immediate visual feedback.
- [x] **LOOP-04**: Player catches Mitch by activating his visible hit target while at least one
  click remains, including on the tenth attempt.
- [x] **LOOP-05**: A successful catch increments completed rounds, resets clicks to ten, and starts
  a new procedurally generated round after the win sequence.
- [x] **LOOP-06**: The tenth incorrect activation locks gameplay input and starts Mitch's escape
  sequence exactly once.
- [x] **LOOP-07**: Completed escape displays game-over statistics, local best, and a control that
  starts a clean run at round one.
- [x] **LOOP-08**: Manual pause and page invisibility stop simulation, timers, and audio without
  consuming clicks or changing round state.

### Mitch Target And Difficulty

- [x] **MITCH-01**: Player can recognize the target as an original caricatured Mitch McConnell
  head rigged onto an animated turtle body and shell.
- [x] **MITCH-02**: Mitch follows scene-valid routes between hiding spots instead of teleporting.
- [x] **MITCH-03**: Foreground props and people can genuinely occlude Mitch and prevent clicks
  through visibly opaque objects.
- [x] **MITCH-04**: Early rounds bound full occlusion and provide findable transit/peek windows.
- [x] **MITCH-05**: Every completed round monotonically increases effective target difficulty;
  late rounds become intentionally faster than practical human tracking.
- [x] **MITCH-06**: Identical run seed, scene, and round inputs reproduce Mitch's route and timing.

### Living Scene Deck

- [x] **WORLD-01**: Player can complete a round in an animated Washington street scene.
- [x] **WORLD-02**: Player can complete a round in an animated Kentucky county fair scene.
- [x] **WORLD-03**: Player can complete a round in an animated airport concourse scene.
- [x] **WORLD-04**: Each scene contains a performant crowd whose members walk, stop, queue, chat,
  sit, react, or interact with props rather than moving as undirected noise.
- [x] **WORLD-05**: Scene seed changes crowd identities, palettes, props, paths, and Mitch hiding
  choices while preserving the template's recognizable layout and valid routes.
- [x] **WORLD-06**: A shuffle-bag scene selector shows every template before reuse and prevents an
  immediate template repeat across successful rounds.

### Outcome Sequences

- [x] **OUT-01**: A successful catch freezes the active scene, spotlights Mitch, retracts his head,
  and transports the spinning shell to a recognizable cartoon Capitol.
- [x] **OUT-02**: The Capitol sequence displays a concise success message and transitions into the
  next round without requiring an extra confirmation click.
- [x] **OUT-03**: Mitch's win makes money bags appear, brings in a cartoon helicopter bearing a
  visible Chinese flag with an Elaine Chao caricature in the cockpit, lowers a rope, lifts Mitch
  and the bags, and carries them offscreen.
- [x] **OUT-04**: The loss sequence is nonviolent, clearly absurd, and finishes before the game-over
  card accepts restart input.

### Interface And Accessibility

- [x] **UI-01**: Title screen explains the target, ten-click rule, controls, local-only records,
  and fictional political-satire/non-affiliation disclaimer before play.
- [x] **UI-02**: Gameplay HUD continuously shows current round, clicks remaining, completed rounds,
  and best run without covering the search area.
- [x] **UI-03**: The same primary-pointer interaction works with mouse, trackpad, pen, and touch.
- [x] **UI-04**: Player can pause/resume, mute/unmute, and restart through labeled controls and
  keyboard shortcuts without accidental stage clicks.
- [ ] **UI-05**: Title, HUD, stage, cards, and controls remain usable on current desktop viewports
  and mobile landscape viewports down to 667 by 375 CSS pixels.
- [ ] **UI-06**: The game honors `prefers-reduced-motion` and a saved override by reducing ambient
  and cutscene motion while preserving essential target motion and state communication.

### Audio

- [x] **AUDIO-01**: Start interaction unlocks a Web Audio context and all music/effects are
  synthesized or original local assets with no autoplay error or remote request.
- [ ] **AUDIO-02**: Mute state persists when storage is available; hidden or manually paused play
  suspends audio and resumes only when appropriate.

### Local Records

- [ ] **SAVE-01**: Game stores best completed rounds, fastest successful find, lifetime catches,
  sound preference, and reduced-motion override under a versioned local schema.
- [ ] **SAVE-02**: Unavailable, blocked, corrupt, or incompatible browser storage falls back to
  validated defaults and in-memory state without preventing play.

### Distribution And Privacy

- [x] **DIST-01**: Production build emits relative-path `dist/index.html`, `dist/styles.css`, and a
  classic IIFE `dist/game.js` with no runtime package, module import, or fetch requirement.
- [ ] **DIST-02**: Double-clicking `dist/index.html` starts a complete game under `file://` in each
  supported desktop browser without console errors or network requests.
- [ ] **DIST-03**: The same `dist/` folder deploys to Cloudflare Pages with documented build,
  security headers, preview, production, and rollback steps.
- [ ] **DIST-04**: The same `dist/` folder deploys to S3 with documented index/content types and an
  optional CloudFront HTTPS/security-header configuration.
- [x] **DIST-05**: Runtime performs no analytics, telemetry, advertising, tracking, API calls, or
  personal-data collection.

### Content And Rights

- [x] **CONT-01**: Published title screen and credits visibly state that the game is fictional,
  exaggerated political satire and is unaffiliated with depicted people or institutions.
- [x] **CONT-02**: Helicopter, flag, spouse, and money imagery is staged as impossible cartoon
  fiction and never described as evidence or a real event.
- [x] **CONT-03**: Published title, copy, character design, and composition do not use the Where's
  Waldo name, logo, striped target costume, artwork, or layouts.
- [x] **CONT-04**: Game copy contains no unsupported factual allegations about Mitch McConnell,
  Elaine Chao, China, financial conduct, health, absence, or official activity.

### Quality

- [x] **QUAL-01**: Automated unit tests cover click accounting, tenth-miss loss, last-click catch,
  state locks, round reset, seeded RNG, and build output invariants.
- [ ] **QUAL-02**: Playwright covers successful capture, ten-miss escape, restart, persistence,
  reduced motion, touch input, every scene, and direct-file execution with deterministic seeds.
- [x] **QUAL-03**: Supported desktop play sustains a 60 FPS target and supported mobile landscape
  sustains a 30 FPS floor at the maximum 96-actor crowd under documented test hardware profiles.
- [ ] **QUAL-04**: Release smoke matrix passes current stable Chrome, Edge, Firefox, and Safari with
  no uncaught errors and no required network request after initial hosted load.
- [x] **QUAL-05**: Every shipped visual/audio asset appears in a license manifest identifying it as
  project-original or recording its compatible source license and attribution.

## v2 Requirements

### Additional Variety

- **V2-SCENE-01**: Add another deep scene only after playtesting shows template fatigue.
- **V2-DAILY-01**: Offer a date-seeded daily layout without a server or shared leaderboard.
- **V2-SHARE-01**: Generate a local score-card image without uploading player data.

### Optional Presentation

- **V2-PHOTO-01**: Add an in-game scene photo mode after the core loop is stable.
- **V2-LOCALE-01**: Add localized UI copy through bundled dictionaries.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Accounts or login | Contradicts anonymous static play |
| Online leaderboard | Requires a trusted service and moderation |
| Multiplayer | Does not improve the central joke |
| Backend or serverless functions | Static deployment is a hard constraint |
| Analytics or ad network | Adds tracking and external requests |
| In-app purchases | No monetization loop is desired |
| Native mobile app | Responsive browser version is sufficient |
| User-generated scenes | Large security, tooling, and moderation surface |
| Service worker/PWA | Adds stale-cache complexity without core value |
| Photographic or cloned likeness assets | Original caricature is safer and more coherent |
| Copied hidden-object franchise branding | The game must be original satire, not an adaptation |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LOOP-01 | Phase 1 | Validated |
| LOOP-02 | Phase 1 | Validated |
| LOOP-03 | Phase 1 | Validated |
| LOOP-04 | Phase 1 | Validated |
| LOOP-05 | Phase 1 | Validated |
| LOOP-06 | Phase 1 | Validated |
| LOOP-07 | Phase 1 | Validated |
| LOOP-08 | Phase 2 | Validated |
| MITCH-01 | Phase 1 | Validated |
| MITCH-02 | Phase 2 | Validated |
| MITCH-03 | Phase 2 | Validated |
| MITCH-04 | Phase 2 | Validated |
| MITCH-05 | Phase 2 | Validated |
| MITCH-06 | Phase 2 | Validated |
| WORLD-01 | Phase 1 | Validated |
| WORLD-02 | Phase 4 | Validated |
| WORLD-03 | Phase 4 | Validated |
| WORLD-04 | Phase 2 | Validated |
| WORLD-05 | Phase 4 | Validated |
| WORLD-06 | Phase 4 | Validated |
| OUT-01 | Phase 3 | Validated |
| OUT-02 | Phase 3 | Validated |
| OUT-03 | Phase 3 | Validated |
| OUT-04 | Phase 3 | Validated |
| UI-01 | Phase 1 | Validated |
| UI-02 | Phase 1 | Validated |
| UI-03 | Phase 1 | Validated |
| UI-04 | Phase 3 | Validated |
| UI-05 | Phase 5 | Pending |
| UI-06 | Phase 5 | Pending |
| AUDIO-01 | Phase 3 | Validated |
| AUDIO-02 | Phase 3 | Pending |
| SAVE-01 | Phase 5 | Pending |
| SAVE-02 | Phase 5 | Pending |
| DIST-01 | Phase 1 | Validated |
| DIST-02 | Phase 5 | Pending |
| DIST-03 | Phase 5 | Pending |
| DIST-04 | Phase 5 | Pending |
| DIST-05 | Phase 1 | Validated |
| CONT-01 | Phase 1 | Validated |
| CONT-02 | Phase 3 | Validated |
| CONT-03 | Phase 3 | Validated |
| CONT-04 | Phase 3 | Validated |
| QUAL-01 | Phase 1 | Validated |
| QUAL-02 | Phase 5 | Pending |
| QUAL-03 | Phase 2 | Validated |
| QUAL-04 | Phase 5 | Pending |
| QUAL-05 | Phase 3 | Validated |

**Coverage:**

- v1 requirements: 48 total
- Mapped to phases: 48
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-31*  
*Last updated: 2026-07-31 after Phase 4 technical verification; release persistence, accessibility,
cross-browser hardening, and non-deployment packaging remain in Phase 5.*
