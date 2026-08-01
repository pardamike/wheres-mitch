# Where's Mitch?

## What This Is

Where's Mitch? is an original, animated hidden-object game and work of absurd political satire.
Players search a living cartoon landscape for a turtle-bodied caricature of U.S. Senator Mitch
McConnell, with ten clicks to catch him before he escapes. It is a small, replayable browser game
for anyone who wants a funny two-minute distraction, not a news product or factual claim.

## Core Value

Finding a constantly moving Turtle Mitch inside a scene that feels genuinely alive must be funny,
fair at first, and immediately satisfying to replay.

## Requirements

### Validated

- [x] A complete ten-click hidden-object loop with catch, next-round, loss, and restart states
  (Phase 1 verification).
- [x] An original Washington street vertical slice with a readable turtle-bodied target, live HUD,
  title disclaimer, and mouse/touch pointer path (Phase 1 verification).
- [x] A dependency-free runtime that builds as a classic IIFE and passes direct-`file://` no-network
  smoke coverage (Phase 1 verification).
- [x] A deterministic Washington crowd with authored routes, six behavior families, layered
  occlusion, and a reproducible Turtle Mitch route/hide loop (Phase 2 verification).
- [x] Formula-driven difficulty from a readable opening through an intentionally absurd late game,
  plus true pause/visibility suspension (Phase 2 verification).
- [x] A measured 96-actor SVG performance profile with stable DOM counts at desktop and compact
  landscape sizes (Phase 2 verification; see `docs/PERFORMANCE.md`).

### Active

- [ ] Three animated, procedurally varied settings populated by convincing crowd behavior.
- [ ] Memorable Capitol-return and helicopter-escape outcome animations.
- [ ] Original visual/audio assets and visible fictional-satire framing.
- [ ] A dependency-free runtime that works from `file://`, Cloudflare Pages, and S3/CloudFront.
- [ ] Local records, responsive controls, accessibility accommodations, and release-grade tests.

### Out of Scope

- User accounts, authentication, cloud saves, leaderboards, and multiplayer — local single-player
  replayability is the entire product.
- Backend services, databases, APIs, serverless functions, analytics, ads, and tracking — the game
  must remain a static artifact with no required network activity.
- Paid content, in-app purchases, prizes, or gambling mechanics — there is no monetization loop.
- Infinite hand-authored scenes — v1 uses three deep templates with procedural variation.
- A mobile native app or app-store package — responsive browser play is sufficient.
- A level editor, mod system, or user-generated content — not needed for the joke or core loop.
- A PWA/service worker — offline `file://` support is simpler and avoids cache/version complexity.
- Photorealism, copied photographs, sampled political speeches, or copied Where's Waldo artwork.
- Claims that any depicted escape, payment, foreign relationship, or misconduct occurred in fact.

## Context

- The project began from the intentionally silly question “Where is Mitch?” and should stay
  compact, irreverent, and replayable instead of growing into a general game platform.
- The defining visual is Mitch McConnell's recognizable caricatured head on an animated turtle.
- The world is not a static illustration: characters walk with destinations, queue, chat, sit,
  react, and interact with scene props while Mitch changes hiding places.
- The player gets ten total attempts each round. Catching Mitch advances the run; using all ten
  attempts lets Mitch win and ends it.
- On a player win, Mitch retracts into his shell and is sent back to the Capitol through an absurd
  patriotic transport animation.
- On a Mitch win, money bags appear, an overtly cartoon helicopter with a Chinese flag and an
  Elaine Chao caricature arrives, and a rope lifts Mitch and the cash offscreen.
- The loss imagery is fictional satire. The title screen and credits must clearly say so.
- Cloudflare Pages is the preferred first host. The same `dist/` folder supports S3/CloudFront.
- The repository belongs to the user's personal GitHub account; no Adelar account or author
  identity may appear in its history.

## Constraints

- **Runtime**: Static HTML, CSS, and classic JavaScript bundle only — no backend or network need.
- **Architecture**: Vanilla strict TypeScript source, esbuild IIFE output, inline SVG stage, DOM HUD.
- **Offline**: The release must open directly with `file://`; no runtime ESM, `fetch`, or imports.
- **Assets**: Original local/inline vectors and synthesized/original sound only.
- **Compatibility**: Current Chrome, Edge, Firefox, and Safari; desktop-first plus mobile landscape.
- **Performance**: Target 60 FPS desktop and 30 FPS supported mobile with 96 active crowd actors.
- **Persistence**: Hosted `localStorage` is supported; direct-file persistence is best effort with
  safe in-memory fallback because browser behavior for `file://` storage is not guaranteed.
- **Privacy**: No personal data collection, analytics, cookies, tracking pixels, or telemetry.
- **Tone**: Absurd editorial satire, never a factual allegation and never ethnic caricature.
- **Delivery**: Planning artifacts remain uncommitted until personal Git identity is configured.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Three deep scene templates | Rich behavior and procedural variation beat many shallow scenes | — Pending |
| Ten attempts per round | Creates tension and a real loss condition without a timer fail state | — Pending |
| Score equals rounds completed | Simple, legible, and gives local high score meaning | — Pending |
| Uncapped effective difficulty | Inevitable impossible speed is part of the joke | — Pending |
| Inline SVG rather than Canvas | Crisp original cartoon art, native hit targets, easy layering and iteration | — Pending |
| TypeScript source bundled to IIFE | Maintains modular/testable source while preserving direct-file compatibility | — Pending |
| No runtime framework or library | Scope does not justify React, Phaser, PixiJS, or a physics engine | — Pending |
| Seed all gameplay randomness | Makes bugs, screenshots, and E2E scenarios reproducible | — Pending |
| Generated/original Web Audio | Avoids asset licensing and works offline | — Pending |
| Visible satire disclaimer | Keeps real-person depictions unmistakably fictional and unaffiliated | — Pending |
| Cloudflare Pages first | Simplest static deployment and preview path | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**

1. Move shipped and verified requirements to Validated with a phase reference.
2. Move rejected requirements to Out of Scope with the reason.
3. Add newly discovered requirements only after explicit scope review.
4. Record significant implementation decisions and their outcomes.
5. Re-check that the core value remains accurate.

**After the v1 milestone:**

1. Review the full document against the shipped game.
2. Re-evaluate performance and scene-variety assumptions using real play sessions.
3. Decide whether more scenes improve the joke or only add maintenance.

---
*Last updated: 2026-07-31 after Phase 2 living-world verification*
