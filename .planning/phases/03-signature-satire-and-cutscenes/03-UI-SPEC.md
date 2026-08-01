# Phase 3 UI Contract: Signature Satire And Cutscenes

This phase must follow both `docs/UI-SPEC.md` and `docs/ART-BIBLE.md`. Character approval is a human
gate, not an automated styling decision.

## Final Controls

- HUD right edge: labeled/icon buttons for **Pause**, **Sound on/off**, and **Restart**.
- Keyboard shortcuts: `Space` pause/resume, `M` mute/unmute, `R` opens restart confirmation, `Escape`
  closes confirmation or pauses play.
- Tooltip/help copy lists shortcuts; icon-only presentations retain accessible names.
- Restart requires confirmation during an active run and never counts as a stage click.

## Catch Sequence

```text
scene freeze → vignette/dim → spotlight ring → “FOUND HIM!”
             → surprised head retract → shell spin/trail
             → Capitol vignette receives shell → comic stamp
             → “ROUND N COMPLETE” → next scene
```

- Default target duration: about 3.6 seconds; reduced motion: about 1.2 seconds.
- The Capitol is a playful original silhouette, not a seal or official branding treatment.
- Patriotic tube/trail can use red, cream, and blue; avoid strobing stripes.
- After one second, show a subtle **Skip** button that resolves to the same final state.

## Escape Sequence

```text
tenth miss → freeze → three or more money bags pop near Mitch
           → helicopter enters above stage with visible flag and Elaine in cockpit
           → rope lowers → connection beat → Mitch + bags rise
           → helicopter exits → “MITCH GOT AWAY” card
```

- Default target duration: about 6 seconds; reduced motion: about 1.8 seconds.
- Helicopter remains a whimsical vehicle with rounded geometry and nonthreatening colors.
- PRC flag must be legible but proportionate; it is not a full-screen shock image.
- Elaine is seated as pilot/passenger, smiling or focused, never given an ethnic gag expression.
- Money bags use generic `$` marks; copy never labels them as real payments or evidence.
- Game-over controls remain disabled until resolution, unless Skip is used.

## Copy And Tone

- Success: **FOUND HIM! Back to work, Senator.**
- Round transition: **Round {n} cleared in {attempts} click(s).**
- Loss: **MITCH GOT AWAY** and **He had ten chances to be found.**
- Do not mention real-world absence, medical status, corruption, allegiance, bribery, or spouse's
  nationality in gameplay copy.

## Sound Palette

- Light civic/march-inspired rhythmic loop, deliberately generic and original.
- Miss: dry pop/tick; catch: reveal chord; shell: whoosh/rattle; Capitol: wooden stamp/chime;
  helicopter: soft synthesized rotor; rope: short winch; game over: comic descending sting.
- Default volume is restrained. Mute changes immediately and never starts sound before gesture.

## Acceptance

- Both outcomes are understandable with audio muted.
- Both outcomes remain complete and nonviolent under reduced motion.
- Disclaimer is clearly visible on title and credits.
- Owner explicitly signs off on both public-figure rigs, flag, money gag, copy, and animation.
