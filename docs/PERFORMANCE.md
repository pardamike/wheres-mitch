# Performance Notes

## Phase 2 baseline

The runtime keeps the production scene as one inline SVG with fixed scene layers. Each round
creates its actor and transient-effect nodes once; steady-state frames update transforms, opacity,
and existing attributes only. Route and behavior choices occur at discrete state transitions and use
seeded data, not per-frame randomness.

### Reproduce

Use Node 24, then run:

```sh
npm run test:e2e -- performance
```

The desktop test launches the production-built local artifact at
`?seed=324001&round=13&debug=1`, which yields the maximum 96 actors. It warms for one second,
samples `requestAnimationFrame` for 30 visible seconds, and checks actor/node counts, median frame
cadence, p95 cadence, and long-frame rate. It does not simplify actors or alter gameplay.

## Recorded desktop profile

Recorded 2026-07-31 on an Apple M3 Pro (arm64), macOS 14.3, Playwright Chromium
151.0.7922.34, 1440 × 1000 viewport, DPR 1:

| Measure | Result |
| --- | ---: |
| Sample duration | 30,007 ms |
| Frames sampled | 3,602 |
| Median frame interval | 8.3 ms |
| 95th-percentile frame interval | 9.3 ms |
| Worst frame interval | 9.4 ms |
| Frames above 50 ms | 0 |
| Crowd actors | 96 |
| Actor SVG groups before/after | 96 / 96 |
| Mitch target nodes | 2 |

This exceeds the desktop target of median 60 FPS and p95 below 25 ms on the recorded reference
profile. The test's guardrails are intentionally looser than a local hardware target so shared CI
can catch clear regressions (sustained sub-30-FPS cadence, actor/node explosion, or excessive long
frames) without treating one noisy frame as a failure.

## Compact-landscape advisory profile

On the same reference machine and browser, an 844 × 390 DPR-1 compact-landscape emulation sampled
10,005 ms after warm-up with 96 actors: 1,201 frames, 8.3 ms median, 8.4 ms p95, 9.4 ms worst, and
zero frames above 50 ms. This clears the emulated 30-FPS floor while remaining an advisory browser
emulation rather than a claim about real mobile hardware.

## Interpretation and follow-up

Headless Chromium is a repeatable algorithmic check, not a replacement for real-device testing.
The automated compact-landscape scenario verifies the 96-actor layout remains practical at the
30-FPS floor; a release candidate should still be checked on current Safari, iPhone Safari, and
Android Chrome as listed in `docs/TEST-PLAN.md`. If a real-device profile misses its target, measure
first, then make a scoped SVG batching or decoration change rather than introducing a renderer
framework.
