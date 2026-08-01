# Where's Mitch? — UI, Interaction, And Animation Specification

**Version:** v1 design contract  
**Date:** 2026-07-31

## 1. Design Direction

The visual language is “dense editorial picture book brought to life”: bold ink, flat color,
slightly imperfect geometry, clear silhouettes, and tiny looping jokes. It should feel handcrafted
and crowded without imitating a particular hidden-object franchise.

The interface stays quiet so the scene carries the spectacle. HUD information is glanceable,
controls are obvious, and no modal or chrome competes with the search area during active play.

## 2. Design Principles

1. **The scene is the hero.** Give it the largest possible stable viewport.
2. **Dense, not muddy.** Strong outlines and controlled palette maintain target legibility.
3. **Motion has intent.** People travel, wait, react, and interact; nothing vibrates without reason.
4. **Every click answers.** Correct, incorrect, blocked, and disabled inputs have distinct feedback.
5. **Satire reads as satire.** Exaggeration, squash-and-stretch, impossible props, and disclaimer
   prevent realistic or factual framing.
6. **Responsive by scaling composition.** Preserve one authored 16:10 stage rather than reflowing
   world geometry differently per device.

## 3. Color System

### Interface Palette

| Token | Value | Use |
|-------|-------|-----|
| `--ink` | `#172033` | Primary outlines and text |
| `--navy` | `#11223D` | HUD and title panels |
| `--paper` | `#F7F0DE` | Page background and cards |
| `--paper-deep` | `#E8DFC9` | Secondary surfaces |
| `--white` | `#FFFDF7` | High-contrast HUD text |
| `--blue` | `#2E5EAA` | Primary buttons and Capitol accents |
| `--blue-dark` | `#1D3F78` | Button pressed/outline |
| `--red` | `#D9443F` | Click losses, stamp, urgent state |
| `--red-dark` | `#962E2C` | Red outline/pressed state |
| `--gold` | `#F2C14E` | Attempts, highlights, stars |
| `--green` | `#557A46` | Positive record accents |
| `--shadow` | `rgba(23, 32, 51, 0.22)` | Cards and floating controls |

### Character Anchors

| Element | Primary | Secondary |
|---------|---------|-----------|
| Turtle body | `#718C51` | `#A9BE77` |
| Turtle shell | `#3F7D4D` | `#E2C66F` |
| Mitch suit/tie detail | `#273E68` | `#C94A43` |
| Helicopter fuselage | `#B82025` | `#77171B` |
| Chinese flag | `#DE2910` | stars `#FFDE00` |
| Money bags | `#C3A46B` | dollar mark `#315D3A` |
| Capitol | `#E9E7E0` | shadow `#AEB8C6` |

Each scene defines a limited supplemental palette. Crowd clothing must distribute hue/value so no
large cluster becomes a single visual blob. Do not reserve one unique bright color exclusively for
Mitch; finding him should rely on shape and behavior, not a neon cheat.

## 4. Typography

- UI font stack: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Display fallback: `"Arial Rounded MT Bold", "Trebuchet MS", system-ui, sans-serif`.
- The title may become original hand-drawn SVG lettering in Phase 3; it must retain a text heading
  in the DOM for semantics.
- Use uppercase labels sparingly for HUD and stamps.
- Minimum body text: 16 CSS px desktop and 14 CSS px constrained landscape.
- Minimum control text: 16 CSS px.
- Numeric HUD data uses tabular numerals.

### Type Scale

| Role | Desktop | Compact landscape |
|------|---------|-------------------|
| Title | `clamp(3rem, 8vw, 7rem)` | `2.25rem` |
| Round card | `2rem` | `1.5rem` |
| HUD number | `1.35rem` | `1rem` |
| HUD label | `0.75rem` | `0.65rem` |
| Button | `1rem` | `0.9rem` |
| Body | `1rem` | `0.875rem` |

## 5. Page Shell

```text
┌──────────────────────────────────────────────────────────────────────┐
│ fixed/minimal browser page background                               │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ HUD                                                              │ │
│ ├──────────────────────────────────────────────────────────────────┤ │
│ │                                                                  │ │
│ │                  RESPONSIVE 1440 × 900 SVG STAGE                 │ │
│ │                                                                  │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ compact disclaimer / credits link                                   │
└──────────────────────────────────────────────────────────────────────┘
```

- `body` fills `100dvh`, uses paper background, and avoids horizontal scrolling.
- Game shell max width is `1600px`, centered, with 12–24 px outer gutter.
- Stage card has 3 px ink border, 18 px radius, clipped contents, and one restrained shadow.
- SVG always retains its viewBox ratio. Letterboxing uses dark paper-deep bands, never stretches.
- HUD is ordinary HTML so controls and text remain crisp and accessible.

## 6. Title Screen

Desktop composition:

```text
┌──────────────────────────────────────────────────────────────┐
│                   WHERE'S MITCH?                             │
│          Ten clicks. One extremely evasive turtle.           │
│                                                              │
│       [small cutout-head Turtle Mitch shell/peek vignette]    │
│                                                              │
│                    [ START THE SEARCH ]                       │
│                  [sound] [motion] [how to play]               │
│                                                              │
│ Find Turtle Mitch before your ten clicks run out.             │
│ Fictional political satire… [full disclaimer visible/expand]  │
└──────────────────────────────────────────────────────────────┘
```

Contracts:

- Start is the sole primary action and receives initial focus.
- The ten-click rule is visible without opening instructions.
- Full disclaimer is readable on the screen or expanded within the same view, not hidden only in
  repository documentation.
- Ambient title animation is modest and stops under reduced motion.
- Start gesture initializes audio and transitions to the first round.

## 7. Gameplay HUD

Desktop:

```text
┌────────────────────────────────────────────────────────────────────┐
│ WHERE'S MITCH? │ ROUND 4 │ CLICKS LEFT ●●●●●●●○○○ │ RETURNED 3 │
│                                                        BEST 7  ⏸ 🔊│
└────────────────────────────────────────────────────────────────────┘
```

Compact landscape:

```text
┌────────────────────────────────────────────────────────────────────┐
│ R4  │  ●●●●●●●○○○  │  RETURNED 3 / BEST 7  │  ⏸  🔊             │
└────────────────────────────────────────────────────────────────────┘
```

- Attempts are both icon and text (`CLICKS LEFT 7`) for color-independent meaning.
- Remaining attempts fill gold; consumed attempts become hollow paper circles.
- On miss, only the newly consumed marker flashes red and shrinks once; no continuous shaking.
- At three or fewer attempts, the text gains red emphasis but does not flash repeatedly.
- HUD controls are actual `<button>` elements with visible focus rings and accessible names.
- HUD event handling must not bubble into stage attempts.

## 8. Stage Interaction Feedback

### Incorrect Click

- 28 SVG-unit outlined ripple centered on pointer location.
- Ripple expands to 44 units and fades over 300 ms.
- Tiny red `×` appears for 220 ms.
- Closest eligible crowd actor within a limited lane radius may look or hop.
- No tooltip, toast, or text obscures the scene.

### Correct Click

- Target receives immediate 120 ms scale squash before the global scene freezes.
- Spotlight and desaturation begin within 100 ms of pointerdown.
- No attempt marker is consumed.

### Disabled/Locked Input

- Cutscene pointer does not produce ripples or counter movement.
- Skip control, when visible, is outside the stage click surface.

## 9. Round Intro

- Full-stage translucent navy scrim.
- Cream card with location name and round number.
- Copy: `ROUND 4` and `KENTUCKY COUNTY FAIR`.
- Full motion duration: 900 ms total (250 in, 400 hold, 250 out).
- Reduced motion: 500 ms crossfade with no scaling.
- Target simulation does not begin until the scrim is gone.

## 10. Pause And Resume

Pause overlay:

```text
┌──────────────────────────────┐
│ PAUSED                       │
│ Mitch is still in there.     │
│ [ RESUME ]                   │
│ [ RESTART RUN ]   [ SOUND ]  │
└──────────────────────────────┘
```

- Background receives 10 px equivalent blur or an opaque patterned veil; do not leave a crisp
  frozen search image.
- Restart opens a confirmation: `End this run and start over?` with secondary Cancel and
  destructive Restart.
- Visibility-return countdown uses `READY`, `SET`, `FIND!`, 500 ms each; reduced motion uses one
  static three-second message.

## 11. Outcome Presentation

### Player Win

- See exact timeline in `GAME-DESIGN.md`.
- Spotlight is warm gold, stage desaturation max 45%.
- Capitol vignette is large enough to read at compact landscape size.
- Success text never covers the shell path.
- Stamp uses red with cream knockout lettering, slight rotation, and one impact bounce.

### Mitch Win

- See exact timeline in `GAME-DESIGN.md`.
- Helicopter and flag must remain legible for at least 1.2 seconds at compact landscape size.
- Wife caricature is visible in the cockpit but is a supporting detail, not a separate target.
- Rope/load uses pendulum easing with a bounded swing; avoid realistic distress.
- Game-over card waits until vehicle and load clear the stage.
- Skip button appears at top right after one second and has a visible keyboard focus style.

## 12. Game-Over Card

```text
┌────────────────────────────────────────┐
│ MITCH GOT AWAY                         │
│                                        │
│ Returned to the Capitol          6     │
│ Attempts                         43     │
│ Accuracy                        14%     │
│ Fastest find                   8.2s     │
│ Best run                          9     │
│                                        │
│          [ SEARCH AGAIN ]               │
│        [sound] [motion] [credits]       │
└────────────────────────────────────────┘
```

- New best adds a small gold `NEW BEST` ribbon.
- Statistics use plain language and do not imply global comparison.
- Search Again receives focus when card becomes active.

## 13. Responsive Contract

### Breakpoints

| Condition | Behavior |
|-----------|----------|
| Width ≥ 1024 and height ≥ 640 | Full desktop HUD and stage |
| Width 768–1023 or constrained height | Compact HUD labels, 12 px gutter |
| Landscape width 667–767 | Minimal HUD, 8 px gutter, controls remain ≥44 px |
| Portrait width < 768 | Show rotate prompt over a dimmed static vignette; allow Continue Anyway |

- Use `100dvh` with fallback to `100vh`.
- Account for `env(safe-area-inset-*)` on notched mobile devices.
- The gameplay shell fills its available viewport height without exceeding it; the centered stage
  scales down before it can push the HUD or footer below the viewport.
- Continue Anyway in portrait letterboxes the complete stage; it never crops hiding areas.
- No breakpoint changes world coordinates or target location.
- Full disclaimer remains reachable by normal page scrolling when the viewport cannot fit it.

## 14. Motion Contract

### General Durations

| Motion | Duration |
|--------|----------|
| Button press | 100 ms |
| Card enter/exit | 220/180 ms |
| Miss ripple | 300 ms |
| Counter loss | 260 ms |
| Round intro | 900 ms |
| Pause overlay | 180 ms |
| Win sequence | 3.3–4.0 s |
| Loss sequence | 5.3–6.2 s |

Use ease-out for entering UI, ease-in for exiting UI, linear/time-based interpolation for walking,
and authored cubic easing for comedic squash, shell travel, rope, and vehicle motion.

### Reduced Motion

When system or saved setting requests reduction:

- Remove background parallax, camera sweeps, repeated bobbing, paper flutter, and most particles.
- Replace scene/card scale transitions with opacity.
- Reduce crowd travel speed to 70% but retain routes and target challenge timing.
- Preserve target movement because it is essential gameplay; use less body bob and shell rotation.
- Condense long shell/helicopter paths into short crossfades while showing all required narrative
  elements and messages.
- Never use flashing faster than three cycles per second in any mode.

## 15. Focus, Keyboard, And Semantics

- Use one `<h1>` on title; game status updates use an `aria-live="polite"` region outside the SVG.
- Announce: round start, clicks remaining after a miss, pause/resume, successful catch, game over,
  and new best. Do not announce every crowd motion.
- All controls are reachable in logical order with a 3 px gold/ink focus ring.
- `Space` pauses/resumes only when focus is not on a control that already consumes Space.
- `M` toggles sound; `R` opens restart confirmation; `Escape` closes or pauses.
- Do not expose Mitch as a focusable DOM target: keyboard enumeration would reveal the answer.
- Attempts use text plus icon count; no information is color-only.

## 16. Cursor And Touch

- Stage uses `cursor: crosshair` in fine-pointer environments.
- Mitch does not switch to a pointer cursor; doing so would reveal him on hover.
- Controls use normal pointer cursor.
- Touch stage avoids delayed click synthesis and accidental text selection.
- Early-round Mitch hit region aims for at least 44 CSS px on supported compact landscape screens.
- Browser pinch zoom is not globally disabled; only game-specific gesture conflict is prevented.

## 17. Visual Acceptance Checklist

- Title explains premise and ten-click rule at first glance.
- Disclaimer is visible and legible without repository knowledge.
- Attempts, round, score, record, pause, and sound fit without covering the stage.
- Mitch is recognizable at supported minimum size but not highlighted by unique neon color.
- Every occluder visually matches its click-blocking behavior.
- Crowd silhouettes remain separable at peak density.
- Chinese flag and helicopter are legible without resembling documentary footage.
- Wife caricature is recognizable, respectful, and free of ethnic stereotype.
- Both full and reduced-motion cutscenes communicate identical state outcomes.
- No design resembles Where's Waldo branding or its signature target costume.
