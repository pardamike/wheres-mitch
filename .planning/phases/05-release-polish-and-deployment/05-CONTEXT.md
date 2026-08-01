# Phase 5 Context: Release Polish And Deployment

## Boundary

Harden the finished three-scene game for durable local settings, responsive/reduced-motion use,
direct-file execution, supported-browser smoke testing, and identical Cloudflare Pages or
S3/CloudFront deployment from one static artifact.

## Locked Decisions

- **D5-01 — Versioned tiny storage:** persist only best rounds, fastest find, lifetime catches,
  mute, and reduced-motion override in a validated versioned record.
- **D5-02 — Storage is optional:** reads and writes are wrapped at the adapter boundary. Any
  unavailable, corrupt, or incompatible storage falls back to in-memory defaults without blocking
  play.
- **D5-03 — Hosted and file parity:** `dist/` is the product. The same untouched directory works
  through HTTP, HTTPS, and direct `file://` on supported desktop browsers.
- **D5-04 — Responsive floor:** support current desktop viewports and mobile landscape down to
  667 by 375 CSS pixels; portrait may show a rotate-device prompt rather than a compromised stage.
- **D5-05 — Reduced motion preserves gameplay:** ambient/cutscene motion is reduced or shortened,
  but essential Mitch movement, visibility, and state messages remain perceivable.
- **D5-06 — No network after load:** no analytics, trackers, ads, remote fonts, API calls, dynamic
  imports, or fetched assets.
- **D5-07 — Cloudflare primary, S3 secondary:** Cloudflare Pages is the preferred hosting recipe;
  S3 and optional CloudFront are fully reproducible alternatives.
- **D5-08 — Release rollback is artifact-based:** every release produces a ZIP and checksum; a
  prior artifact can replace the current deployment without rebuilding source.
- **D5-09 — Test behavior stays out of production:** deterministic hooks expose stable seed/state
  only in an explicit debug build/query path; tests do not alter game rules.

## Supported Matrix

- Current stable Chrome, Edge, Firefox, and Safari on desktop.
- Chromium mobile emulation plus at least one real mobile landscape smoke test when available.
- Direct-file smoke on each supported desktop browser.
- `prefers-reduced-motion: reduce`, keyboard controls, pointer mouse, and touch input.

## Release Evidence

- Unit, E2E, build-contract, no-network, direct-file, accessibility, and content checks pass.
- Maximum-crowd performance measurements are recorded with hardware/browser/date.
- `dist/` file list and SHA-256 checksum are recorded.
- Cloudflare preview is reviewed before production promotion.
- A rollback drill or documented dry run identifies the exact prior artifact and command/path.

## Git Identity Gate

The first commit must occur only on the personal machine after local author identity and GitHub CLI
authentication show the personal account. See `HANDOFF.md`; never reuse the Adelar author identity.

