# Where's Mitch? — Complete Planning Handoff

**Prepared:** 2026-07-31  
**Status:** Planning complete; no implementation exists  
**Repository:** `pardamike/wheres-mitch`  
**Current branch:** `main`

## Identity Safety Gate — Do This First

This planning session intentionally made no commits and no pushes. On the source machine, Git
currently resolves the author as an Adelar Intel identity. Before committing anything on the
personal machine, set and verify a repository-local personal identity:

```bash
git config --local user.name "Mike Parda"
git config --local user.email "YOUR_PERSONAL_GITHUB_EMAIL"
git config --local --get user.name
git config --local --get user.email
git remote -v
gh auth status
```

Do not commit until the last four commands show only the intended personal identity/account.
Never copy the placeholder email literally.

## Transfer Warning

All planning files are deliberately uncommitted. A fresh clone on another computer will contain
only the original `README.md` and `LICENSE` until these files are transferred. Copy the entire
working tree, including hidden `.planning/`, or transfer the planning archive produced alongside
this handoff. On the destination machine verify:

```bash
git status --short
find .planning docs -type f | sort
```

Only after the identity safety gate passes should the planning documents be committed and pushed
from the personal account.

### Prepared Archive

The source machine should contain:

```text
/Users/mikeparda/Desktop/wheres-mitch-planning-handoff-2026-07-31.zip
```

It contains `README.md`, `LICENSE`, `AGENTS.md`, `HANDOFF.md`, `docs/`, and the hidden
`.planning/` directory, but no `.git` directory. Transfer that ZIP to the personal machine, clone
the personal repository, and extract the ZIP into the clone root:

```bash
cd /path/to/personal/wheres-mitch
unzip /path/to/wheres-mitch-planning-handoff-2026-07-31.zip
git status --short
```

Expected packet integrity before implementation:

- 48 Markdown documents total, including 30 phase documents.
- 15 executable `*-PLAN.md` files and 15 matching context/research/UI phase briefs.
- 48 v1 requirements; every requirement appears exactly once in plan frontmatter.
- Five phases with three ordered plans each.
- No application source, package file, generated build, implementation commit, or pushed change.

The archive SHA-256 is reported by the planning session after it creates the final ZIP. Verify that
checksum after transfer before extraction.

## What Is Locked

- Product title: **Where's Mitch?**
- Format: original animated hidden-object political satire.
- Player has exactly ten attempts per round.
- A successful click returns Turtle Mitch to the Capitol and begins a new round.
- The tenth miss triggers the full helicopter escape and ends the run.
- High score is consecutive rounds completed before an escape.
- Three deep scene templates: Washington street, Kentucky county fair, airport concourse.
- Scenes use procedural crowd, palette, path, prop, and hiding-place variation.
- Difficulty increases every round and becomes intentionally, hilariously impossible.
- Runtime architecture: TypeScript modules bundled by esbuild into a classic IIFE, inline SVG
  game stage, HTML HUD, CSS presentation, no runtime dependencies.
- Deployable `dist/` works from `file://` and static HTTP(S).
- Cloudflare Pages is the preferred host; S3/CloudFront is supported.
- The Chinese-flag helicopter, Elaine Chao caricature, rope extraction, and money bags are an
  explicitly fictional and absurd game-over sequence, not a factual assertion.
- Visible satire/non-affiliation disclaimer is mandatory.

## Canonical Documents

| Document | Purpose |
|----------|---------|
| `.planning/PROJECT.md` | Product intent, constraints, and locked decisions |
| `.planning/REQUIREMENTS.md` | Forty-eight atomic v1 requirements and phase traceability |
| `.planning/ROADMAP.md` | Five implementation phases and success criteria |
| `.planning/STATE.md` | Resume state and current focus |
| `docs/GAME-DESIGN.md` | Full mechanics, scoring, state transitions, scene behavior, copy |
| `docs/TECHNICAL-SPEC.md` | Stack, modules, data contracts, rendering, build, security |
| `docs/UI-SPEC.md` | Layout, palette, typography, responsiveness, animation timings |
| `docs/ART-BIBLE.md` | Character rigs, scene assets, visual rules, licensing manifest |
| `docs/TEST-PLAN.md` | Unit, integration, E2E, visual, file, performance, release gates |
| `docs/DEPLOYMENT.md` | Build artifact, Cloudflare, S3/CloudFront, rollback, headers |
| `.planning/research/` | Technical research and pitfalls supporting the decisions |
| `.planning/phases/` | Context, research, UI contracts, and executable plans by phase |

## Recommended Resume Prompt

Use this verbatim with the new coding session:

> Work in this repository. Read `AGENTS.md` and `HANDOFF.md` completely, then read every canonical
> document they reference. Confirm the Git identity safety gate before making a commit. Execute
> Phase 1 only from `.planning/phases/01-standalone-vertical-slice/`, following its plans in wave
> order. Build the vertical slice end to end, run all Phase 1 verification, and stop for visual
> review before Phase 2. Do not redesign locked product, satire, architecture, or content decisions
> unless a documented blocker makes the current design impossible.

## Open Items That Are Not Blockers

- Personal Git email and authenticated GitHub account must be supplied on the destination machine.
- Final domain name is undecided; Cloudflare's generated `pages.dev` URL is sufficient initially.
- Final caricature likeness and scene composition require human visual approval during Phase 3.
- Exact dependency versions are intentionally not frozen in planning; install current compatible
  releases under Node 24 LTS and commit the resulting lockfile from the personal machine.

No additional product decisions are required to begin Phase 1.

## First Personal-Machine Commit

After the identity gate and packet checks pass, the planning packet can be committed separately:

```bash
git add README.md AGENTS.md HANDOFF.md docs .planning
git diff --cached --check
git commit -m "docs: add game design and implementation plan"
```

Run `git show --format=fuller --no-patch HEAD` and verify the personal author before any push. Then
execute Phase 1 in plan order and use focused Conventional Commits; do not squash away human visual
approval points while the design is still being tuned.
