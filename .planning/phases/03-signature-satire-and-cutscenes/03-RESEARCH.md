# Phase 3 Research: Signature Satire And Cutscenes

## Recommendation

Author character and vehicle rigs as small inline SVG groups built from original shapes. Animate
their root transforms and a few named joints through the existing simulation/render pipeline. Use
a declarative sequence runner for ordered cutscene beats instead of scattered timeouts.

## Sequence Runner

A sequence is an ordered list of `{ durationMs, enter, update?, exit? }` beats operating on a
cutscene-local elapsed clock. It must support pause, reduced-motion durations, skip-to-resolution,
and cancellation by an outcome token. The game state—not animation completion callbacks—owns which
outcome is valid.

## Art Workflow

1. Build silhouette-first SVG rigs at their actual gameplay size.
2. Name only joints that animate; keep decorative paths inside the owning group.
3. Verify face and turtle read at target size before adding detail.
4. Test flag legibility at helicopter size and preserve the documented star arrangement.
5. Run owner visual/content approval before polishing timing.
6. Update the asset manifest in `docs/ART-BIBLE.md` as each asset or sound source is introduced.

## Audio

Create one lazy `AudioEngine` after the Start gesture. Web Audio oscillators, filtered noise, gain,
and short envelopes can cover UI ticks, miss pops, shell whoosh, Capitol stamp, rotor, rope winch,
and sting without binary assets. The engine must expose `unlock`, `setMuted`, `suspend`, `resume`,
and named cues. Never retry autoplay in a loop.

## Content Safety

The work may lampoon public figures, but public copy must remain obvious fiction. Keep the joke in
the impossible turtle, pneumatic Capitol delivery, helicopter, magically appearing money, and game
rules. Do not write captions that convert imagery into claims about actual corruption, allegiance,
health, attendance, finances, or conduct. The spouse depiction must not rely on ethnic traits.

## Testing

- Fake-clock unit tests verify beat order, pause, skip, cancellation, and final state exactly once.
- E2E waits on semantic state markers, not arbitrary animation sleeps.
- Reduced-motion E2E confirms equivalent outcomes with shorter/non-sweeping motion.
- Audio tests use a fake context; browser smoke confirms unlock occurs only after gesture.
- Content/asset review is a human release gate and is recorded in the manifest/checklist.

## Primary References

Web Audio autoplay requirements and reduced-motion guidance are linked from
`.planning/research/STACK.md`. The canonical art and copy constraints live in `docs/ART-BIBLE.md`
and `docs/GAME-DESIGN.md`.
