# Where's Mitch? — Execution Handoff

**Updated:** 2026-08-01

**Branch:** `main`

**Status:** All five gameplay phases are implemented. Phase 5 local QA and the owner-supplied Mitch
cutout, opening-evasion, and viewport-fit update are locally verified; no deployment was performed.

## Non-negotiables

- Keep the shipped game static: no backend, accounts, telemetry, tracking, runtime API calls, or
  required network access.
- Keep the deployable artifact compatible with both HTTP(S) and direct `file://` use.
- Do not deploy or run Cloudflare, S3, CloudFront, or other cloud commands. The owner explicitly
  limited this run to the game and local packaging/QA.
- Preserve the visible fictional-satire disclaimer and the documented asset-rights rules in
  `AGENTS.md` and `docs/ART-BIBLE.md`.
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
- Mitch now uses the owner-supplied local head cutout on an original green/gold retro-arcade shell.
  Round one starts denser and faster, immediately favors a real occluder, and uses a tighter target.
- The game shell now fills its usable viewport height without exceeding it; the 16:10 stage scales
  down before it can push the HUD or footer below the viewport.
- `dist/` remains generated and ignored. `npm run build` recreates it.

## Current verification state

Already passed during this phase:

- storage/records unit subset;
- responsive, reduced-motion, persistence/fallback, touch, artifact, no-network, visual, and
  direct-file browser checks;
- hosted Chrome and Firefox end-to-end smoke; direct-file Chrome and Firefox smoke.

`npm run verify` passed on the Phase 5 source commit. Commit `e26486f` (`feat: polish local release
experience`) is pushed to `main`, with verification notes in `8a5d76c`. `npm run package` reran the
gate and created the ignored local `release/wheres-mitch-v1.0.0.zip` plus SHA-256 checksum. The ZIP
was unpacked and smoke-tested under `file://`; it has not been deployed.

On 2026-08-01, `npm run verify` passed again after the Mitch cutout, hunt-tuning, and viewport-fit
update: 18 Vitest files / 64 tests, the 36-test Chromium/touch matrix, Chrome/Firefox hosted smoke,
and Chrome/Firefox direct-file smoke. The checked artifact includes the relative
`assets/mitch-head.png` file and rejects remote or unexpected requests. The older local ZIP predates
this asset update and was intentionally not regenerated.

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
| Release polish | `e26486f` | Local storage, accessibility/responsiveness, artifact/browser QA |
| Local package | ignored output | `wheres-mitch-v1.0.0.zip`, checksum verified, extracted file smoke passed |
| Mitch cutout, hunt, and viewport tuning | this commit | Owner-supplied local head, original green/gold shell, dense/fast opening, full-height no-scroll game shell, full local verification |

## Resume order

Read `AGENTS.md`, this file, `.planning/PROJECT.md`, then the canonical `docs/` files. For exact
execution history and requirement status, use `.planning/STATE.md` and `.planning/REQUIREMENTS.md`.
