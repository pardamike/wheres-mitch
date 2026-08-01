# Phase 2 UI Contract: Living World And Difficulty

This phase changes motion and interaction inside the approved shell; it does not redesign the title
or HUD.

## Motion Language

- Crowd motion is readable, staggered, and purposeful. Actors pause at destinations and use small
  pose changes; the entire crowd never reverses or bobs in unison.
- Early Turtle Mitch movement is mischievous rather than frantic: head leads slightly, legs cycle,
  shell bobs subtly, and he pauses to peek before committing to another route.
- Later difficulty shortens decisions/dwell/peek states and raises route speed using the canonical
  formulas. Avoid extra blur or camera shake that makes early rounds unfair.
- Wrong-click reactions are local: nearby actors may turn or point for a moment. They must not
  become target lookalikes or permanently expose Mitch.

## Depth And Occlusion

- Scale and vertical placement establish at least rear, middle, and foreground bands.
- Foreground props and people visually cover the complete hidden portion of Mitch; invisible
  rectangles must not mysteriously block open space.
- When Mitch peeks, enough head/shell silhouette is visible to form a meaningful target.
- Debug outlines for routes, spots, hit targets, and occluders are available only through explicit
  local debug mode and are absent from the normal presentation.

## Pause

- Pause button changes to **Resume** and opens a centered translucent card.
- Manual-pause card says **PAUSED — Mitch is still in there.** and offers Resume, Restart, and
  Back to Title.
- The scene freezes at its exact pose. Resuming does not animate a catch-up jump.
- Page invisibility automatically suspends the scene. Returning stays paused if manual pause is
  active; otherwise a **READY — SET — FIND!** countdown precedes automatic resume.

## Performance Presentation

- Degraded devices may reduce nonessential crowd pose detail but not actor count, target visibility,
  attempts, or difficulty without an explicit future product decision.
- Loading indicators are unnecessary because all scene data is local and synchronous.
- Avoid continuous filters, large blurs, and full-stage opacity animations at maximum crowd load.

## Acceptance

- A human can narrate at least four different crowd activities after watching one minute.
- Mitch clearly travels into and out of hiding instead of popping between positions.
- Early-round exposure feels catchable with ordinary attention.
- Round 25 is visibly more frantic; extreme debug rounds become comically impossible.
- Pause visibly freezes every actor, effect, target clock, and outcome timer.
