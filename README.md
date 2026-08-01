# Where's Mitch?

**Where's Mitch?** is an original, standalone animated hidden-object satire. Find Turtle Mitch in
Washington, a county fair, or an airport before ten wrong clicks trigger an absurd cartoon escape.

It is a static vanilla TypeScript/SVG game: no accounts, analytics, tracking, API calls, backend,
or required network connection. After a build, `dist/index.html` runs directly from `file://`.

## Play locally

```bash
npm ci
npm run build
open dist/index.html
```

For a local development server, run `npm run dev` and visit the printed address. The game uses only
local files at runtime; local records and settings are optional browser storage.

## Verify

```bash
npm run verify
```

This runs static checks, unit tests, production-artifact checks, deterministic browser tests,
touch/responsive coverage, Chrome/Firefox smoke tests, and direct-file smoke tests.

`npm run package` creates an ignored local ZIP and SHA-256 checksum only from a clean, verified
worktree. It does not deploy anything.

## Project status

The game implementation and local release hardening are complete. No cloud deployment has been
performed; hosting remains intentionally out of scope for this work session. The remaining release
review is human visual/tone approval and any desired real-device Safari/Edge smoke tests.

## Design and execution record

Start with [HANDOFF.md](HANDOFF.md), then consult the canonical documents:

1. [Game design](docs/GAME-DESIGN.md)
2. [Technical specification](docs/TECHNICAL-SPEC.md)
3. [UI and animation specification](docs/UI-SPEC.md)
4. [Art and asset manifest](docs/ART-BIBLE.md)
5. [Testing strategy](docs/TEST-PLAN.md)
6. [Latest local test results](docs/TEST-RESULTS.md)
7. [Requirements](.planning/REQUIREMENTS.md)
8. [Roadmap](.planning/ROADMAP.md)

The legacy deployment notes remain in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for a future,
explicitly authorized hosting pass.
