# Phase 1 UI Contract: Standalone Vertical Slice

This contract specializes `docs/UI-SPEC.md`. The canonical document wins if a token or copy detail
is not repeated here.

## Screens

### Title

- Centered masthead: **WHERE'S MITCH?** with subtitle
  **Ten clicks. One extremely evasive turtle.**
- Original Turtle Mitch preview beside or above a two-sentence premise.
- Compact rules card: find him, ten clicks, wrong clicks count, rounds get faster.
- Primary button: **Start the Search**.
- Secondary controls: **How to Play** and **Credits** only if their content cannot fit accessibly in
  the title layout.
- Disclaimer and local-only/no-tracking statement visible in the initial scroll area on desktop.

### Gameplay

```text
┌────────────────────────────────────────────────────────────────┐
│ WHERE'S MITCH?  Round 1  Clicks ●●●●●●●●●●  Returned 0  Best 0 │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    WASHINGTON SVG STAGE                        │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ Find the turtle. Wrong clicks: 0/10                 Pause      │
└────────────────────────────────────────────────────────────────┘
```

- Desktop HUD is one compact bar; mobile landscape may wrap into two short rows.
- Stage retains its authored aspect ratio and receives the pointer cursor only while playable.
- A miss marker appears exactly at the activation point, pulses once, then fades.
- Remaining-attempt dots disappear or switch to an error color; text remains authoritative.
- Success/loss placeholders may be simple cards but must visibly lock the stage.

### Game Over

- Heading: **MITCH GOT AWAY**.
- Show completed rounds, best completed rounds, and attempts used in the final round.
- Primary button: **Search Again**. Secondary: **Back to Title**.

## Interaction States

| State | Stage cursor | Stage input | HUD | Overlay |
|-------|--------------|-------------|-----|---------|
| Title | default | none | hidden | title card |
| Playing | crosshair | enabled | live | none |
| Caught | default | locked | frozen | success |
| Escaping | default | locked | frozen | loss placeholder |
| Game over | default | locked | final | result card |
| Paused | default | locked | frozen | pause card |

## Semantic Markers

Use stable product semantics that also support testing: `[data-game-state]` on the application
root, `[data-game-stage]`, `[data-game-target="mitch"]`, and accessible button names. Do not expose
private implementation details solely for tests.

## Phase Acceptance

- No text overlaps the stage at 1440×900, 1024×768, or 667×375 landscape.
- Every control is keyboard reachable and has a visible focus indicator.
- Touch targets are at least 44 by 44 CSS pixels where space permits.
- HUD updates immediately and does not animate numbers slowly enough to obscure click accounting.
- Placeholder art is explicitly original and does not resemble the protected striped target.
