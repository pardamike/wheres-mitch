# Research Summary: Where's Mitch?

**Researched:** 2026-07-31

## Stack

Build modular strict TypeScript with no runtime library. Render the world as inline SVG and the HUD
as HTML/CSS. Bundle through esbuild to classic IIFE so the production folder works from both
`file://` and HTTP(S). Use Vitest for rules and Playwright for real-browser flows. Use generated
Web Audio and guarded localStorage.

## Product Table Stakes

- Immediate premise/instruction
- Exact and trustworthy click accounting
- Legible target and feedback
- Complete win/loss/restart loop
- Responsive play and sound control
- Repeatable procedural variation

## Differentiators

- Purposeful animated crowd behavior
- Moving/hiding target with real occlusion
- Difficulty that becomes intentionally impossible
- Signature Capitol and helicopter animations
- Three deep scene templates
- Fully portable static artifact

## Critical Constraints

- Runtime ESM is incompatible with the direct-file requirement.
- `file://` localStorage persistence cannot be guaranteed; memory fallback is required.
- Web Audio must be unlocked by a user gesture.
- SVG remains performant only with persistent nodes, simple rigs, transform updates, and actor cap.
- Public-figure/cash/China imagery must be unmistakable fictional satire and use original assets.

## Recommended Build Order

1. Static IIFE pipeline and one complete Washington loop.
2. Crowd/path/Mitch AI and difficulty.
3. Final art, copy, audio, and outcome sequences.
4. Fair/airport templates and seeded variety.
5. Persistence, responsiveness, browser/file testing, and static deployment.

## No Remaining Research Blocker

All important feasibility questions have an established browser-native path. Performance and visual
quality require measurement/review during implementation, but neither needs a pre-code technology
spike.

See `STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, and `PITFALLS.md` for full rationale.
