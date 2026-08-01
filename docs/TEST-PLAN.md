# Where's Mitch? — Test And Verification Plan

**Version:** v1 planning contract  
**Date:** 2026-07-31

## 1. Testing Philosophy

Protect game rules and deployment invariants with deterministic automation. Use browser tests for
rendering, interaction, animation outcomes, responsive behavior, and direct-file execution. Avoid
tests that freeze incidental SVG path data, exact intermediate frame coordinates, or arbitrary
class names.

No test may add test-only behavior to ordinary gameplay beyond stable debug/query hooks documented
in `TECHNICAL-SPEC.md`.

## 2. Quality Layers

| Layer | Tool | Protects |
|-------|------|----------|
| Static | TypeScript, ESLint, Prettier | Types, unsafe patterns, formatting |
| Unit | Vitest | Reducer, click rules, RNG, difficulty, routes, storage, scene selection |
| Build | Node scripts | IIFE format, relative paths, no remote/runtime imports |
| E2E | Playwright | Real SVG/DOM input, HUD, outcome flows, responsive, persistence |
| Direct file | Playwright + `file://` | No-server operation and zero network |
| Visual | Playwright screenshots | Canonical seeded scene/cutscene composition |
| Performance | Browser sampling + manual profile | Actor ceiling and animation frame budget |
| Content | Deterministic source audit + human review | Disclaimer, originality, asset manifest |

## 3. Required Commands

```text
npm run typecheck
npm run lint
npm run format:check
npm run test:run
npm run build
npm run test:e2e
npm run test:file
npm run verify
```

`npm run verify` is the local release gate and runs every command above in a documented order.

## 4. Determinism Contract

- Unit tests use fixed uint32 seeds.
- E2E uses a canonical seed per scene and explicit starting round.
- Time-dependent unit tests inject a fake monotonic clock; they do not sleep.
- Browser tests may wait for semantic state markers (`data-mode`) rather than fixed cutscene sleeps.
- Screenshot tests disable nondeterministic clock/date content and use fixed viewport/device scale.
- Each PRNG subsystem gets a named derived seed so unrelated generator changes do not invalidate all
  snapshots.

Recommended canonical fixtures:

| Fixture | Seed | Scene | Round | Purpose |
|---------|------|-------|-------|---------|
| `washington-easy` | `324001` | Washington | 1 | Onboarding and capture |
| `fair-mid` | `324002` | Kentucky fair | 6 | Crowd/occlusion |
| `airport-hard` | `324003` | Airport | 12 | Difficulty and density |
| `escape` | `324010` | Washington | 1 | Ten-miss cutscene |
| `absurd` | `324099` | Airport | 25 | Effectively impossible speed |

## 5. Unit Test Matrix

### Reducer And Click Accounting

- `START_RUN` initializes round 1, score 0, clicks 10, and no scene until ready.
- Nine consecutive `MISS` events leave mode `playing` and clicks 1.
- Tenth `MISS` changes mode to `mitch_escape` and never produces negative clicks.
- A later duplicate/queued `MISS` in `mitch_escape` is ignored.
- `MITCH_CAUGHT` with clicks 10 and with clicks 1 enters `player_capture` without decrementing.
- `MITCH_CAUGHT` in non-playing states is ignored.
- `CAPTURE_COMPLETE` increments completed rounds once and prepares round +1 with clicks 10.
- `ESCAPE_COMPLETE` enters game over and preserves final score/statistics.
- `RESTART` clears run statistics while preserving saved settings/records.
- Manual and hidden pause reasons do not incorrectly resume each other.

### Difficulty

- Round one matches every baseline constant.
- For rounds 1–100, Mitch speed never decreases.
- Route interval, dwell, peek, hidden maximum, and hitbox scale never increase.
- Crowd count never exceeds 96.
- Timing floors and speed ceiling prevent zero, infinity, and NaN.
- A late round reaches the documented “impractical” thresholds.

### RNG And Scene Selection

- Same seed yields identical number sequence and derived streams.
- Different named streams differ while remaining reproducible.
- Gameplay source contains no `Math.random()` call.
- Shuffle bag returns all three unique scene IDs before refill.
- Refill never immediately repeats the previous scene.
- Forced query scene is validated and does not corrupt later shuffle behavior.

### Routes, Hiding, And Occlusion

- Route graph rejects missing-node edges and unreachable authored hide spots.
- Mitch destination selection avoids immediate duplicate spot when alternatives exist.
- Seed reproduces route and spot sequence.
- Round-one first move and full-hidden durations respect fairness bounds.
- Occlusion state follows authored layer/spot intervals.
- Position interpolation clamps to segment endpoints.

### Storage

- Missing value returns defaults.
- Valid v1 value loads and clamps expected fields.
- Invalid JSON, wrong version, negative numbers, excessive numbers, bad enum, and wrong types return
  safe defaults.
- Read, write, or quota exception selects the memory adapter.
- New best replaces prior best; lower run does not.
- Fastest find updates only for a smaller valid visible elapsed time.
- No write occurs per animation frame.

### Build Invariants

- Generated `index.html` has no `type="module"` and uses `./game.js`, `./styles.css`.
- `game.js` has no unresolved `import(`, top-level `import`, `require(`, remote URL, or source path.
- CSS and HTML contain no root-absolute asset path.
- `dist/` contains every required static file and no source/test file.
- Production build succeeds from a clean checkout after `npm ci`.

## 6. Playwright E2E Matrix

### Title And Start

- Title, subtitle, ten-click instruction, Start, and disclaimer are visible.
- Full disclaimer names fictional satire and non-affiliation.
- Start transitions through round intro to playing.
- Starting creates/resumes audio only after the gesture; muted start remains muted.
- HUD reads round 1, clicks 10, returned 0, and current local best.

### Successful Capture

For each scene using deterministic debug targeting:

1. Start run.
2. Confirm playing state and actor count.
3. Activate visible Mitch target.
4. Confirm clicks remain unchanged.
5. Assert catch state, spotlight, tuck, destination, and success message markers.
6. Wait for next round semantic state.
7. Assert completed rounds +1, clicks 10, and different scene template where normal selection is
   not forced.

At least one capture test uses a real pointer coordinate without debug `catchMitch()`.

### Ten-Miss Escape

1. Start deterministic escape scene.
2. Activate ten known empty coordinates one at a time.
3. After each of first nine, assert counter decrements exactly once and mode remains playing.
4. On tenth, assert mode locks to escape and extra input has no effect.
5. Assert money bags, helicopter, Chinese flag, cockpit spouse, rope/load, and offscreen exit appear
   in semantic order.
6. Assert game-over card waits for escape completion.
7. Assert final statistics and Search Again.
8. Restart and assert fresh round 1/clicks 10/score 0 while best record persists.

### Pause And Visibility

- Manual pause obscures scene and freezes target position/elapsed time.
- Hidden-page simulation suspension is verified with direct debug clock/snapshot where browser
  visibility emulation permits.
- Manual pause remains paused after hide/show.
- Normal hidden suspension returns through countdown.
- Audio is suspended and does not restart if player muted or manually paused.

### Persistence

- Hosted context preserves best rounds and settings after reload.
- Corrupt the storage key, reload, and confirm playable defaults.
- Force `localStorage` access to throw and confirm memory-mode play.
- Direct-file test does not require persistence to pass.

### Responsive And Input

- Desktop 1440×1000, laptop 1024×768, compact landscape 844×390, and minimum 667×375.
- HUD does not overlap stage, controls are visible, and stage viewBox is uncropped.
- Touchscreen context uses pointer input to record miss and catch.
- Portrait shows rotate prompt; Continue Anyway preserves whole stage.
- Keyboard shortcuts pause/mute/restart without consuming attempts.
- HUD control clicks never decrement attempts.

### Reduced Motion

- System reduced-motion emulation selects reduced behavior under `system` mode.
- Saved `full` and `reduce` overrides take precedence as specified.
- Essential target motion remains.
- Outcome sequences still expose required narrative markers and finish in correct state.
- Non-essential parallax/particle animation classes are absent or disabled.

## 7. Direct `file://` Release Test

Run after a production build using an absolute encoded file URL to `dist/index.html`.

Required assertions:

- Title renders and Start works.
- Washington catch advances a round.
- Ten misses reach game over.
- Styles, SVG, script, and favicon load without CORS/module errors.
- Capture all `console.error`, `pageerror`, and failed request events; expected count is zero.
- Abort on any `http:`, `https:`, WebSocket, beacon, or fetch request.
- Storage behavior may be available or memory fallback; both are accepted.

The file test is separate from hosted E2E so a passing local server cannot mask module/path errors.

## 8. Visual Regression Set

Use deterministic seeds and screenshot only stable narrative points:

- Title screen desktop and compact landscape
- Washington playing round 1
- Kentucky fair playing round 6
- Airport playing round 12
- Player-win spotlight/tucked-shell keyframe
- Capitol arrival/stamp
- Helicopter fully onscreen with flag/cockpit visible
- Rope/load lift keyframe
- Game-over card
- Reduced-motion outcome cards

Mask only elapsed-time text if it cannot be fixed through the test clock. Do not mask actors or
target. Review baseline changes manually; never auto-accept broad diffs.

## 9. Performance Verification

### Automated Sampling

At fixed seed and actor count 96:

- Sample `requestAnimationFrame` deltas for at least 10 visible seconds after warm-up.
- Record median, p95, worst frame, long frames above 50 ms, actor count, browser, viewport, DPR.
- Desktop target: median ≤18.5 ms and p95 ≤25 ms.
- Mobile emulation is advisory; real-device acceptance supplies the 30 FPS floor.
- Fail deterministic algorithmic regressions such as actor count explosion or per-frame DOM growth.
- Do not make CI fail on one noisy worst-frame sample.

### Manual Profiles

- Chrome/Edge desktop at 1440×900 and 96 actors.
- Safari desktop at 1440×900.
- One current iPhone Safari landscape and one current Android Chrome landscape if available.
- Inspect DOM node count, layout/style recalculation, scripting time, memory after 20 rounds, and
  absence of detached SVG groups.

Document actual hardware/browser versions in the release report.

## 10. Browser Matrix

| Browser | Hosted | Direct file | Touch/responsive | Audio | Required |
|---------|--------|-------------|------------------|-------|----------|
| Chrome stable | Automated | Automated | Automated emulation | Automated smoke | Yes |
| Edge stable | Manual/CI where available | Manual | Manual | Manual | Yes |
| Firefox stable | Automated | Automated | Desktop | Automated smoke | Yes |
| Safari stable | Manual or Playwright WebKit approximation + real Safari | Manual | Real/device | Manual | Yes |
| Mobile Safari current | Hosted manual | Optional | Real landscape | Manual | Yes |
| Android Chrome current | Hosted manual | Optional | Real landscape | Manual | Yes |

Safari/WebKit Playwright is useful but does not replace one real Safari release smoke.

## 11. Accessibility And Content Audit

Automated/source assertions:

- One `h1`, named buttons, polite status region, focus-visible styles.
- Attempts represented by text and icons.
- Disclaimer text present in release HTML/source constants.
- No forbidden external URLs, copied franchise name in published UI, or unsupported claim phrases.
- Reduced-motion styles and runtime branch exist.
- Asset manifest has no `Planned`/blank license entry at release.

Human audit:

- Keyboard controls and focus order.
- Screen reader announcement frequency.
- Contrast for HUD/cards/buttons.
- Mitch and wife likeness/tone review.
- Flag accuracy and absurd/non-documentary staging.
- No visual reliance on protected hidden-object-franchise identity.

## 12. Requirements Traceability

Each implemented test should reference relevant requirement IDs in its description or surrounding
suite metadata where useful. The release report must account for every v1 requirement as automated,
manual, or both. Requirements with no evidence block release.

## 13. Release Gate

Release is ready only when:

- Clean `npm ci && npm run verify` passes.
- Direct-file test passes from the packaged ZIP contents, not an old `dist/`.
- Browser matrix has no unresolved blocker.
- Performance targets have documented evidence.
- Visual baselines receive human review.
- Full disclaimer and content audit pass.
- Asset manifest is complete.
- Cloudflare preview matches local artifact hash/contents.
- Rollback procedure has been exercised or verified against a prior deployment.
