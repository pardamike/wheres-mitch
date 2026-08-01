# Stack Research: Where's Mitch?

**Researched:** 2026-07-31  
**Scope:** Static animated hidden-object browser game with direct `file://` support

## Recommendation

| Layer | Choice | Confidence | Why |
|-------|--------|------------|-----|
| Source language | Strict TypeScript | High | Game state, actor, scene, and event contracts benefit from compile-time boundaries |
| Runtime UI | Semantic HTML + CSS | High | Best fit for title, HUD, dialogs, focus, and responsive controls |
| World rendering | Inline SVG DOM | High | Crisp cartoon vectors, native pointer hit targets, authored layering, responsive viewBox |
| Animation | `requestAnimationFrame` timestamps | High | Browser-native, refresh-rate independent, background-throttled |
| Build | esbuild browser bundle, IIFE format | High | Converts modular source into classic script compatible with direct-file loading |
| Unit tests | Vitest | High | Fast TypeScript-aware tests for pure game logic |
| Browser tests | Playwright | High | Pointer/touch, screenshots, multiple engines, static server integration, file smoke |
| Audio | Web Audio API | High | Generated/offline effects with no asset/license dependency |
| Persistence | guarded `localStorage` + memory adapter | High | Adequate for small local records with graceful file/private-mode behavior |
| Development runtime | Node.js 24 LTS + npm | High | Current supported LTS as of planning, familiar lockfile/static scripting |
| Hosting | Cloudflare Pages primary; S3/CloudFront alternative | High | Both serve the same static artifact without application server |

Install current compatible versions and commit the resulting `package-lock.json` from the personal
machine. Planning intentionally does not guess future patch versions.

## Why SVG Instead Of Canvas

- `viewBox` provides a stable logical world mapped responsively to the viewport.
- SVG groups make character rigs and foreground occlusion directly inspectable.
- Browser pointer targeting avoids a custom shape-picking engine.
- Moving an actor requires updating one group transform.
- Original vector art remains crisp on high-DPI displays.
- A 96-actor ceiling is modest enough for disciplined SVG DOM updates.

Canvas remains a contingency only if measured profiling shows the authored SVG system cannot meet
the performance contract after obvious hot-path fixes. Do not preemptively build two renderers.

## Direct-File Constraint

MDN documents that JavaScript modules loaded directly through `file://` encounter CORS/security
errors. Source may use ESM, but production must be a classic script. esbuild's documented IIFE
format is intended for browser `<script src>` usage and wraps symbols away from global scope.

Runtime data must be compiled into `game.js` or loaded by normal HTML/CSS asset references. Do not
use runtime `fetch`, dynamic import, import maps, or JSON requests.

## Storage Constraint

MDN explicitly says `localStorage` behavior for `file:` URLs is undefined and may differ by
browser. Hosted persistence is supported; direct-file persistence is best effort. A probed adapter
must fall back to memory without warning spam or broken gameplay.

## Audio Constraint

Browser autoplay policies generally require creating/resuming `AudioContext` from a user gesture.
The Start button is the unlock event. Audio always has a visible mute control and never drives state
completion.

## Performance Guidance

- Use one timestamp-based animation loop.
- Avoid per-frame node creation, layout reads, animated filters, and all-pairs crowd logic.
- Use discrete depth lanes and transform updates.
- Suspend on `visibilitychange` and clamp delta on resume.
- Keep static scene geometry unchanged within a round.

## What Not To Add

- React, Phaser, PixiJS, physics engine, state library, CSS framework, utility framework
- Runtime CDN or remote font
- Service worker, PWA manifest, serverless function, API client
- Analytics, error-reporting SDK, ads, cookie manager
- General-purpose ECS before the simple actor interfaces prove insufficient

## Primary References

- MDN SVG `viewBox`: <https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/viewBox>
- MDN SVG transforms: <https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/transform>
- MDN Pointer Events: <https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events>
- MDN `requestAnimationFrame`:
  <https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame>
- MDN JavaScript module local testing:
  <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules>
- esbuild IIFE format: <https://esbuild.github.io/api/#format-iife>
- MDN `localStorage`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage>
- MDN Web Audio best practices:
  <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices>
- MDN Page Visibility API:
  <https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API>
- Node.js release status: <https://nodejs.org/en/about/previous-releases>
- Vitest guide: <https://vitest.dev/guide/>
- Playwright web server: <https://playwright.dev/docs/test-webserver>

---
*Recommendation: proceed with the stack above; no feasibility spike is required before Phase 1.*
