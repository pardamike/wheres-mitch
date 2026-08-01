# Roadmap: Where's Mitch?

## Overview

Five vertical phases build from a complete one-scene walking skeleton to a tested static release.
Every phase preserves a playable game and ends with user-visible verification.

| Phase | Name | Goal | Requirements | Plans |
|-------|------|------|--------------|-------|
| 1 | Standalone Vertical Slice | Ship the full ten-click loop in one Washington scene | 16 | 3 |
| 2 | Living World And Difficulty | Make the crowd and target behavior feel alive and scale to absurdity | 8 | 3 |
| 3 | Signature Satire And Cutscenes | Deliver final character, outcome, audio, and content presentation | 11 | 3 |
| 4 | Scene Deck And Variety | Add fair and airport templates plus procedural scene rotation | 4 | 3 |
| 5 | Release Polish And Deployment | Finish persistence, accessibility, browser hardening, and hosting | 9 | 3 |

## Phases

### Phase 1: Standalone Vertical Slice

**Goal:** A player can open the static build, understand the premise, play a complete Washington
round with ten clicks, catch Mitch or lose, and restart without any network dependency.

**Mode:** mvp  
**Requirements:** LOOP-01, LOOP-02, LOOP-03, LOOP-04, LOOP-05, LOOP-06, LOOP-07, MITCH-01,
WORLD-01, UI-01, UI-02, UI-03, DIST-01, DIST-05, CONT-01, QUAL-01  
**UI hint:** yes

**Success Criteria:**

1. `npm run build` creates a relative-path `dist/` with classic `game.js` and no runtime imports.
2. A deterministic Washington scene supports both a correct catch and exactly-ten-miss loss.
3. The HUD, disclaimer, restart, score increment, and click accounting match requirements.
4. Core state/RNG/build tests pass and browser runtime makes zero network requests.

**Plans:**

- `01-01-PLAN.md` — Toolchain, static IIFE artifact, shell, and test harness.
- `01-02-PLAN.md` — Deterministic state machine, attempts, scoring, and persistence boundary.
- `01-03-PLAN.md` — Washington SVG vertical slice, target interaction, HUD, and E2E paths.

### Phase 2: Living World And Difficulty

**Goal:** Replace placeholder movement with convincing crowd routines, routed Turtle Mitch hiding,
real occlusion, fair early rounds, and an intentionally impossible late-game curve.

**Mode:** mvp  
**Depends on:** Phase 1  
**Requirements:** LOOP-08, MITCH-02, MITCH-03, MITCH-04, MITCH-05, MITCH-06, WORLD-04,
QUAL-03  
**UI hint:** yes

**Success Criteria:**

1. Crowd actors perform destination-based behaviors and scene reactions instead of random drift.
2. Mitch follows reproducible routes, passes behind click-blocking occluders, and respects early
   visibility bounds.
3. Difficulty increases monotonically and eventually exceeds practical human tracking speed.
4. Maximum crowd load meets documented desktop/mobile frame targets and pauses when hidden.

**Plans:**

- `02-01-PLAN.md` — Actor model, route network, crowd behaviors, depth, and reactions.
- `02-02-PLAN.md` — Mitch AI, hiding spots, occlusion, fairness, seeded difficulty curves.
- `02-03-PLAN.md` — Pause/visibility lifecycle, pooling, performance measurement, tuning.

### Phase 3: Signature Satire And Cutscenes

**Goal:** Replace functional placeholders with the final original art language, Capitol capture,
helicopter escape, audio, controls, licensing, and unmistakable fictional-satire framing.

**Mode:** mvp  
**Depends on:** Phase 2  
**Requirements:** OUT-01, OUT-02, OUT-03, OUT-04, UI-04, AUDIO-01, AUDIO-02, CONT-02,
CONT-03, CONT-04, QUAL-05  
**UI hint:** yes

**Success Criteria:**

1. Catching Mitch plays the complete retract, shell, Capitol transport, stamp, and transition.
2. Ten misses plays the complete money, Chinese-flag helicopter, spouse, rope, lift, and game-over
   sequence without violence or factual framing.
3. Sound begins only after player gesture, obeys mute/pause, and uses only original/synthesized
   sources.
4. Asset manifest is complete and published copy passes the content/satire audit.

**Plans:**

- `03-01-PLAN.md` — Final visual rigs, HUD controls, copy, disclaimer, and asset manifest.
- `03-02-PLAN.md` — Capitol-return sequence and successful round transition.
- `03-03-PLAN.md` — Helicopter escape, game-over presentation, and procedural audio.

### Phase 4: Scene Deck And Variety

**Goal:** Deliver three distinct, richly animated settings that reuse shared systems while varying
layout, props, crowds, routes, hiding places, and palette without immediate repetition.

**Mode:** mvp  
**Depends on:** Phase 3  
**Requirements:** WORLD-02, WORLD-03, WORLD-05, WORLD-06  
**UI hint:** yes

**Success Criteria:**

1. Kentucky fair and airport rounds are independently playable with valid routes and occlusion.
2. Scene seeds change meaningful visual/gameplay details without breaking target reachability.
3. Shuffle-bag selection shows all three templates before reuse and never repeats immediately.
4. Fixed seeds produce stable E2E screenshots and equivalent ten-click/catch behavior per scene.

**Plans:**

- `04-01-PLAN.md` — Scene contract, procedural variation engine, and shuffle bag.
- `04-02-PLAN.md` — Kentucky county fair scene and behaviors.
- `04-03-PLAN.md` — Airport concourse scene, cross-scene validation, and screenshots.

### Phase 5: Release Polish And Deployment

**Goal:** Make the complete game resilient across supported browsers, responsive and considerate,
locally persistent, directly openable, and deployable with a documented rollback path.

**Mode:** mvp  
**Depends on:** Phase 4  
**Requirements:** UI-05, UI-06, SAVE-01, SAVE-02, DIST-02, DIST-03, DIST-04, QUAL-02,
QUAL-04  
**UI hint:** yes

**Success Criteria:**

1. Records/settings survive hosted reloads and storage failures never block play.
2. Desktop and mobile-landscape layouts pass responsive and reduced-motion contracts.
3. Full deterministic Playwright suite passes over HTTP and direct `file://` with no runtime
   network requests or uncaught errors.
4. Cloudflare Pages and S3/CloudFront deployment/rollback instructions reproduce the same build.

**Plans:**

- `05-01-PLAN.md` — Versioned storage, records, settings, responsive and reduced-motion polish.
- `05-02-PLAN.md` — Full E2E/browser/file/performance hardening and release QA.
- `05-03-PLAN.md` — Static security headers, Cloudflare/S3 packaging, release and rollback docs.

## Requirement Coverage

- Total v1 requirements: 48
- Requirements assigned exactly once: 48
- Unmapped requirements: 0
- Duplicate phase assignments: 0

---
*Roadmap created: 2026-07-31 for the initial v1 milestone*
