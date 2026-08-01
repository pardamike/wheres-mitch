# Where's Mitch? — Execution Handoff

**Updated:** 2026-07-31

**Branch:** `main`

**Status:** All five gameplay phases are implemented. Phase 5 local QA, final documentation,
verification, commit, and push are the active work.

## Non-negotiables

- Keep the shipped game static: no backend, accounts, telemetry, tracking, runtime API calls, or
  required network access.
- Keep the deployable artifact compatible with both HTTP(S) and direct `file://` use.
- Do not deploy or run Cloudflare, S3, CloudFront, or other cloud commands. The owner explicitly
  limited this run to the game and local packaging/QA.
- Preserve the visible fictional-satire disclaimer and the original-art rules in `AGENTS.md` and
  `docs/ART-BIBLE.md`.
- Do not commit generated `dist/`, browser reports, screenshots, caches, or ignored `release/`
  output.

## Identity and Git

The repository-local identity was verified before implementation commits:

```text
Mike Parda
pardamike@gmail.com
```

The remote is the personal `pardamike/wheres-mitch` repository. Use concise Conventional Commits,
run `npm run verify` before an implementation commit, and push only directly to `main`.

## Where the game stands

- Washington, Kentucky fair, and airport scenes share deterministic seeded systems and a
  no-repeat scene deck.
- Capture and escape outcomes, synthesized audio, pause/visibility behavior, content framing, and
  original-art manifest are implemented.
- Phase 5 adds versioned optional local records/settings, reset confirmation, focus-safe dialogs,
  reduced motion, compact landscape/portrait layout, touch coverage, direct-file QA, artifact
  verification, and local ZIP/checksum packaging.
- `dist/` remains generated and ignored. `npm run build` recreates it.

## Current verification state

Already passed during this phase:

- storage/records unit subset;
- responsive, reduced-motion, persistence/fallback, touch, artifact, no-network, visual, and
  direct-file browser checks;
- hosted Chrome and Firefox end-to-end smoke; direct-file Chrome and Firefox smoke.

Before committing, run the complete `npm run verify`, inspect the actual completion status, run
`git diff --check`, then commit/push the Phase 5 change. `npm run package` must be run only after a
clean committed worktree; it creates ignored local output and never deploys.

## Known release-review boundaries

- Playwright WebKit cannot launch on this macOS 14 ARM environment because its available engine is
  frozen and exits with a bus error. Safari 17.3 is installed, but a human real-Safari smoke remains
  pending.
- Microsoft Edge and a real mobile-device smoke are not available in this environment.
- Human owner visual/tone approval of the satire/art remains pending. Do not mark it complete on the
  owner’s behalf.

## Execution diary

| Milestone | Commit | Result |
|---|---:|---|
| Planning/docs and `.planning` migration | `704234d` | Canonical plan set committed and pushed |
| Washington vertical slice | `4f2be9b` | Core static game loop implemented |
| Living world/difficulty | `4c4ee90` | Seeded crowd, Mitch routing, occlusion, pause/performance |
| Outcomes/audio | `a757e47` | Original art, capture/escape, audio, controls |
| Scene deck/variety | `6bdee96` | Fair/airport, seeded variation, no-repeat deck |
| Release polish | pending | Local storage, accessibility/responsiveness, artifact/browser QA |

## Resume order

Read `AGENTS.md`, this file, `.planning/PROJECT.md`, then the canonical `docs/` files. For exact
execution history and requirement status, use `.planning/STATE.md` and `.planning/REQUIREMENTS.md`.
