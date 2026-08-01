# Local Release Verification Results

## Latest: Mitch cutout, hunt-tuning, viewport-fit, and cover/footer polish

**Run date:** 2026-08-01

`npm run verify` passed after integrating the owner-supplied local Mitch cutout, the original
green/gold retro-arcade shell, the faster/more occlusion-focused opening behavior, the
full-viewport-height gameplay shell, matching title-cover art, and a visible footer top border.

| Check | Result |
|---|---|
| TypeScript, ESLint, Prettier | Passed |
| Vitest | 18 files, 64 tests passed |
| Production build and artifact verifier | Passed; six root files plus `assets/mitch-head.png` |
| Chromium suite | 36 hosted/touch/visual/performance tests passed |
| Chrome + Firefox hosted smoke | Both completed catch, escape, restart, and no-unexpected-request checks |
| Chrome + Firefox `file://` smoke | Both completed settings, catch, escape, and restart with zero remote requests/errors |
| Responsive viewport fit | Game shell, footer, and document height remain within each supported landscape viewport |
| Cover/footer polish | Title references the bundled cutout image; the stable footer remains visibly bounded |

The artifact verifier confirms the PNG signature and its relative path inside the classic IIFE
artifact. Hosted request checks allow only the same-origin favicon and this documented local image;
any other post-load request, including a remote one, fails.

The ignored v1.0.0 ZIP documented below predates this asset update. It was intentionally not
regenerated because no release/package action was requested.

## Prior Phase 5 release gate

**Run date:** 2026-07-31

**Host:** Apple M3 Pro (arm64), macOS 14.3 (23D56)

**Toolchain:** Node 24.18.1, npm 11.16.0, Playwright 1.62.1

## Automated release gate

`npm run verify` passed from the working tree after the final Phase 5 changes.

**Validated source commit:** `e26486f` (`feat: polish local release experience`)

| Check | Result |
|---|---|
| TypeScript, ESLint, Prettier | Passed |
| Vitest | 18 files, 64 tests passed |
| Production build and artifact verifier | Passed; six documented root files only |
| Chromium suite | 36 hosted/touch/visual/performance tests passed |
| Chrome + Firefox hosted smoke | Both completed catch, escape, restart, and no-post-load-network checks |
| Chrome + Firefox `file://` smoke | Both completed settings, catch, escape, and restart with zero remote requests/errors |

The build verifier confirms a classic IIFE with only relative asset references and rejects remote
URLs, fetch/XHR/WebSocket primitives, workers, source maps, modules, and unexpected artifact files.

## Local package evidence

`npm run package` reran the complete release gate and produced ignored local output:

```text
release/wheres-mitch-v1.0.0.zip
release/wheres-mitch-v1.0.0.sha256
SHA-256: df6e2ec2826c7ff56a1a5d8af7d33036188a2e2a5430b7bb7808820a9efcd56d
```

The checksum was independently recomputed, and the archive lists exactly `404.html`, `_headers`,
`favicon.svg`, `game.js`, `index.html`, and `styles.css` at its root. An extracted archive completed
a direct-file catch smoke with zero remote requests and zero console/page errors. The temporary
extraction was removed after verification.

## Responsive and accessibility evidence

- Automated layout assertions passed at 1440×1000, 1024×768, 844×390, and 667×375.
- The stage remains uncropped/letterboxed at compact landscape sizes; all HUD icon targets are at
  least 44 CSS pixels.
- Portrait shows an actionable rotate advisory without horizontal HUD overflow; Continue Anyway
  preserves the logical SVG stage.
- Keyboard dialog focus/open/close behavior, Escape precedence, reset confirmation, 200% zoom
  reachability, and touch catch/miss input are covered.
- System, reduced, and full motion modes are covered. Reduced mode freezes decorative ambient
  loops while the target route continues, and saved overrides reload correctly.

## Storage and privacy evidence

- Unit and browser checks cover missing, corrupt, incompatible, extreme, blocked-read,
  blocked-write/quota, and blocked-remove storage behavior.
- Browser checks confirm that only `wheres-mitch:records:v1` is written and that reset removes it.
- A browser run with `localStorage` forced to throw still completes a catch and escape loop in
  session memory.
- Hosted and direct-file network tests observed no runtime remote request after static load; the
  game contains no analytics, tracking, API, or backend dependency.

## Browser matrix

| Browser/engine | Hosted smoke | Direct file | Notes |
|---|---:|---:|---|
| Google Chrome 150.0.7871.188 | Passed | Passed | Actual installed Chrome via Playwright channel |
| Playwright Chromium 151.0.7922.34 | Passed | Passed | Full E2E, responsive, touch emulation, and performance coverage |
| Playwright Firefox 153.0 | Passed | Passed | Deterministic catch/escape/restart smoke |
| Safari 17.3 / Playwright WebKit | Pending | Pending | Available WebKit build is frozen on macOS 14 ARM and exits with bus error before launch; requires real Safari review |
| Microsoft Edge | Pending | Pending | Not installed on this machine |
| Real mobile Safari/Android Chrome | Pending | N/A | iPhone-landscape Chromium touch emulation passed; real-device review remains human work |

## Visual and performance review

The implementation agent inspected deterministic current-build screenshots for a desktop fair,
compact airport landscape, and the portrait rotate panel. The art, stage framing, and advisory were
technically reviewed; owner visual/tone approval remains pending.

The existing 96-actor Chromium profile is recorded in [PERFORMANCE.md](PERFORMANCE.md): 8.3 ms
median, 9.3 ms p95 desktop cadence, and zero long frames on this machine. The compact emulation
also clears the advisory 30 FPS floor.

## Intentional boundaries

- No Cloudflare, S3, CloudFront, or other deployment was attempted.
- Local package output is generated only after a clean committed worktree with `npm run package` and
  is ignored by Git.
- A public launch still needs owner visual/tone approval plus desired Safari, Edge, and real-mobile
  smoke tests.
