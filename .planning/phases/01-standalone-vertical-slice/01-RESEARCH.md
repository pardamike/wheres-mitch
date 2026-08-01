# Phase 1 Research: Standalone Vertical Slice

## Recommendation

Use a conventional HTML document, external CSS, and strict TypeScript compiled by esbuild to one
classic IIFE. Inline the scene SVG in the document so target discovery, layering, and pointer
semantics use native DOM behavior while the final artifact remains `file://` compatible.

## Why This Shape

- Browser module scripts are constrained by CORS under `file://`; a classic IIFE avoids that
  distribution failure.
- SVG supplies resolution-independent character art, authored layers, transforms, clipping, and
  DOM hit testing without a game engine.
- One pointer event boundary unifies mouse, pen, and touch and prevents parallel click code paths.
- A pure reducer/state transition layer makes tenth-click boundaries and outcome locks testable
  without browser timing.
- esbuild and test packages are development-only; the shipped folder contains no package runtime.

## Implementation Guidance

1. Pin Node 24 LTS through `.nvmrc` and `package.json#engines`.
2. Configure `tsconfig.json` with `strict`, DOM libraries, `noEmit`, and modern source target.
3. Add `scripts/build.mjs` that cleans only `dist/`, bundles `src/main.ts` as `iife`, copies
   `index.html` and `src/styles.css`, and fails if output contains runtime imports or absolute URLs.
4. Keep domain modules under `src/game/`; `main.ts` only wires document nodes to the controller.
5. Represent state transitions as pure functions. Schedule visual transitions in the controller,
   guarded by the current state/outcome token.
6. Put `data-action` on controls and `data-game-target="mitch"` on the complete clickable target.
   The stage handler checks `event.composedPath()` once.
7. Use an injectable seed and clock. Production defaults may derive a seed from crypto/time, while
   tests pass fixed values.

## Validation Strategy

- Unit tests: initial state, nine misses, tenth-click catch, tenth miss, duplicate-event lock,
  round reset, restart reset, seeded RNG sequence.
- Build test: exact three entry artifacts, relative references, no `type="module"`, imports,
  external URL, or fetch/XHR/WebSocket symbols.
- Playwright: start, miss, catch, ten misses, restart, and network-request audit against HTTP and
  `file://`.

## Avoid

- Do not use `localStorage` as a hard dependency in the first slice; file-origin behavior is not
  standardized across browsers.
- Do not attach handlers to every actor.
- Do not use `setTimeout` as the simulation clock.
- Do not bundle image/font URLs from a CDN.
- Do not solve final animation before state correctness is proven.

## Primary References

See `.planning/research/STACK.md` and `.planning/research/ARCHITECTURE.md` for the official MDN,
esbuild, Node, Vitest, Playwright, and hosting references used to make these decisions.

