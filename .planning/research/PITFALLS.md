# Pitfall Research: Where's Mitch?

**Researched:** 2026-07-31

| Pitfall | Warning Signs | Prevention | Phase |
|---------|---------------|------------|-------|
| Static scene with decorative jitter | Actors oscillate in place or wander through props | Destination/state behaviors and path networks | 2 |
| Unfair target | Long invisible periods, click-through cover, teleporting | Authored hide spots, early bounds, real pointer occlusion | 2 |
| Accidental double miss | One pointer decrements twice through bubbling/synthetic click | One primary `pointerdown` path and reducer test | 1 |
| Last-click bug | Correct tenth attempt loses because miss resolves first | Single stage handler classifies the composed path before dispatching | 1 |
| Late `file://` failure | ESM/fetch/absolute paths only discovered at release | IIFE build scanner and direct-file smoke from Phase 1 | 1, 5 |
| SVG performance collapse | Hundreds of nodes created per frame, filters, all-pairs logic | Persistent nodes, transform-only update, actor cap, profiling | 2 |
| Tab-resume teleport | Giant rAF delta advances entire world/cutscene | Visibility suspension and 50 ms delta clamp | 2 |
| Nondeterministic tests | Global `Math.random`, fixed sleeps, changing screenshots | Named seed streams, semantic states, fake clock | 1–5 |
| Storage blocks game | `localStorage` throws or corrupt JSON crashes boot | Probed adapter, schema validation, memory fallback | 5 |
| Audio silently blocked | Context created at boot and stays suspended | Create/resume from Start gesture; nonfatal cues | 3 |
| Cutscene becomes tedious | Six-second sequence cannot be skipped after repeats | Skip available after one second, reduced-motion alternative | 3 |
| Satire reads as allegation | Realistic visuals or copy states conduct as fact | Impossible cartoon staging, visible disclaimer, content audit | 1, 3 |
| Ethnic stereotype | Spouse caricature relies on nationality-coded features | Respectful public-figure likeness review, no stereotype props | 3 |
| Franchise imitation | Stripe costume, logo/layout echoes, published “Waldo-style” copy | Original title/art language and explicit content review | 3 |
| Scene abstraction too early | Generic engine grows before one scene proves needs | Washington vertical slice first; extract concrete contract later | 1, 4 |
| Scene abstraction too late | Fair/airport duplicate Washington control logic | Shared template contract before additional scenes | 4 |
| Difficulty becomes broken, not funny | Zero-duration loops, NaN, target leaves world | Monotonic formulas with numerical safety floors/ceiling | 2 |
| Pause reveals answer | Crisp frozen target can be studied indefinitely | Patterned/blurred opaque pause overlay | 3 |
| Mobile crop hides target | Cover scaling or portrait reflow removes stage regions | `meet` scaling, letterbox, rotate prompt | 5 |
| Cache serves mismatched JS/CSS | Long cache on stable file names | ETag/revalidation/short cache and rollback smoke | 5 |
| Identity leaks into history | First commit uses Adelar author or push session | Mandatory local identity/auth gate in `HANDOFF.md` | Before code |

## Highest-Risk Review Gates

1. **Identity:** no commit until personal author and GitHub account are verified.
2. **Phase 1:** direct-file build and exact ten-click reducer behavior.
3. **Phase 2:** actual occlusion correctness and measured peak-crowd performance.
4. **Phase 3:** human review of caricatures, flag/helicopter framing, disclaimer, and asset rights.
5. **Phase 5:** full browser/file/release matrix from packaged artifact.
