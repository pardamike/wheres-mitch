# Phase 5 UI Contract: Release Polish And Deployment

This phase makes the approved presentation resilient; it does not introduce new aesthetic themes.

## Responsive Layout

| Viewport | Contract |
|----------|----------|
| ≥ 1024 px wide | Single-row HUD, centered stage, max-width title/results cards |
| 768–1023 px | Compact labels, stage fills width, controls remain labeled where possible |
| 667–767 px landscape | Two-row HUD, 44 px controls, stage receives remaining height |
| Portrait below gameplay minimum | Friendly rotate-device panel; title/settings remain usable |

- Honor safe-area insets for mobile browser chrome/notches.
- Never crop the logical SVG stage; letterboxing is preferable to lost hiding areas.
- Browser zoom to 200% must leave title, dialogs, and controls reachable by scrolling.

## Reduced Motion

- System preference is default until the player selects **Full**, **Reduced**, or **Use device**.
- Reduced mode stops decorative crowd bobs, flags, clouds, wheel, and ambient parallax.
- Actor route and Mitch transit remain, with simplified poses and no disorienting sweeps.
- Catch replaces multi-spin transport with one short arc/fade and immediate Capitol receipt.
- Escape replaces long fly-in/out with staged fades/short translations while retaining helicopter,
  flag, Elaine, rope, Mitch, and money narrative beats.
- No flashing exceeds common accessibility guidance; avoid rapid luminance changes altogether.

## Settings And Records

- Title and pause surfaces offer Sound and Motion settings with current values stated in text.
- Records card shows Best Run, Fastest Find, and Lifetime Catches. Missing records use an em dash,
  not zero when zero would imply a completed result.
- If storage fails, do not show an error modal. Continue the session and optionally label records
  **This session only** in settings/credits.
- Add **Reset Local Records** behind a confirmation; it does not restart the active round unless
  the player chooses to do so separately.

## Keyboard And Focus

- Opening a dialog moves focus into it; closing returns focus to the invoking control.
- Escape closes confirmation/help dialogs before it toggles pause.
- Outcome transitions announce concise status through a polite live region.
- Target discovery remains pointer-based; do not create a Tab shortcut that reveals Mitch.
- Decorative SVG nodes are not focusable or exposed as noisy accessibility-tree content.

## Release Visual Gate

- Test 1440×900, 1024×768, 667×375, 844×390, 200% zoom, dark OS chrome, and both motion modes.
- Verify title/disclaimer, all scenes, both outcomes, pause/settings, storage fallback label, game
  over, and rotate prompt.
- Safari font metrics and mobile address-bar changes must not clip controls or stage.

