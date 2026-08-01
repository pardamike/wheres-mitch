# Phase 5 Research: Release Polish And Deployment

## Recommendation

Treat release qualification as verification of one immutable `dist/` artifact. Harden optional
browser services behind adapters, run deterministic HTTP and direct-file E2E against the artifact,
then publish that exact directory to either host.

## Storage

Use one versioned JSON object under a project-specific key. Parse unknown input as `unknown`, check
every field, clamp numeric records, and merge only valid values into defaults. Catch errors around
both reads and writes because privacy modes and quota policies can fail either operation. Do not
assume `file://` origins share stable storage.

## Responsive And Motion

Scale a fixed logical SVG view box into available space with `preserveAspectRatio`. HUD and modal
content remain ordinary HTML. At narrow landscape widths, reduce chrome before reducing target
clarity. Under reduced motion, stop ambient decorative loops, shorten sweeping transitions, replace
spins with fades/scales, and keep enough target transit to preserve the game.

## Direct-File Verification

Playwright can navigate to an absolute `file:///.../dist/index.html` URL. Fail the test on console
error, page error, or any request beyond the initial hosted document in HTTP mode; direct-file mode
should have no request events for remote resources. Validate the actual built output, not the dev
server.

## Hosting

- Cloudflare Pages: build command `npm ci && npm run build`, output `dist`; publish `_headers`
  alongside the artifact where supported and use preview deployment before production.
- S3: upload with correct HTML/CSS/JS content types; static website hosting is HTTP-only.
- CloudFront: optional HTTPS, custom domain, compression, response headers policy, and origin
  access configuration for S3.
- Cache hashed/release assets long only if filenames are content-addressed; otherwise use short or
  revalidation caching so rollback is predictable.

## Security Header Constraint

A strict static CSP should allow only same-origin classic script/style and local data/blob media as
actually required. Direct `file://` cannot depend on response headers, so the application must be
safe by construction: no HTML injection, remote code, eval, or user content. Avoid adding a meta
CSP until its browser/file behavior is tested against the final artifact.

## Release Evidence

Capture command output, browser versions, performance profile, ZIP checksum, preview URL, content
approval, and rollback artifact identifier in a release checklist. Do not commit screenshots or
test artifacts unless they are intentionally selected baselines.

## Primary References

Official Cloudflare, AWS, MDN, Playwright, and Node links are collected in
`docs/DEPLOYMENT.md` and `.planning/research/STACK.md`.

