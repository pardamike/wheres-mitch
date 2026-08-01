# Where's Mitch? — Static Build And Deployment Specification

**Version:** v1 planning contract  
**Date:** 2026-07-31

## 1. Deployment Principle

There is one deployable artifact: the contents of `dist/`. Local direct-file play, Cloudflare
Pages, S3, CloudFront, preview, and production all use that exact output. Hosting configuration may
add response headers, but it may not transform game code or require a server function.

Cloudflare Pages is preferred for the first public release. S3/CloudFront remains a documented
alternative.

## 2. Artifact Contract

Minimum production output:

```text
dist/
├── index.html
├── game.js
├── styles.css
├── assets/
│   └── mitch-head.png
├── favicon.svg
├── 404.html
└── _headers
```

The owner-supplied Mitch head cutout ships under relative `./assets/mitch-head.png` and is included
in the release manifest. No release file points outside `dist/`.

Artifact rules:

- `index.html` is the entry/index document.
- All URLs are relative and case-correct.
- `game.js` is a classic IIFE, not ESM.
- No source maps in the public release ZIP unless explicitly requested for debugging.
- No environment variables, secrets, account IDs, analytics IDs, or absolute personal paths.
- No Pages Functions, Workers, Lambda, API Gateway, or origin server.
- `_headers` may be ignored by non-Cloudflare hosts without affecting gameplay.
- `404.html` gives a simple link to `./index.html`; there are no client-side routes.

## 3. Local Release Build

Prerequisites:

- Node.js 24 LTS
- npm bundled with that Node installation
- Clean repository with committed lockfile after personal identity setup

Commands:

```bash
npm ci
npm run verify
npm run package
```

`npm run package` must:

1. Run a fresh production build.
2. Re-run the direct-file smoke against the new output.
3. Create `release/wheres-mitch-v<version>.zip` containing the contents of `dist/` at ZIP root.
4. Create `release/wheres-mitch-v<version>.sha256`.
5. Print file count, uncompressed size, ZIP size, and checksum.

The ZIP opens to `index.html`, not an extra nested directory.

## 4. Direct-File Distribution

User steps:

1. Extract the release ZIP.
2. Open `index.html` in a current desktop browser.
3. Play without a server or network connection.

Document that local-record persistence under `file://` varies by browser. Gameplay itself must not
depend on persistence.

Never tell users to disable browser security flags or CORS protections.

## 5. Cloudflare Pages — Preferred

### Git Integration

After the repository is safely owned/authenticated by the personal account:

1. Create a Pages project connected to `pardamike/wheres-mitch`.
2. Production branch: `main`.
3. Build command: `npm ci && npm run build`.
4. Build output directory: `dist`.
5. Node version: 24 LTS via supported Pages configuration/environment setting.
6. Do not create Functions or bindings.
7. Allow preview deployments for branches/PRs.

No secret environment variable is required.

### Direct Upload Alternative

For a manual release, upload the verified `dist/` folder or release ZIP through Cloudflare Pages
Direct Upload, or use Wrangler from a personally authenticated session:

```bash
npx wrangler pages deploy dist --project-name wheres-mitch
```

Do not run this command from an Adelar-authenticated environment.

### Headers

`dist/_headers` defines:

```text
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

Verify these headers with browser devtools and `curl -I` against the preview URL. Any CSP console
violation blocks release.

### Custom Domain

- A custom domain is optional and not required for v1.
- The generated `*.pages.dev` domain is acceptable initially.
- When a domain is added, force HTTPS and test both apex/subdomain routing.
- No product copy should hard-code the Pages domain.

### Preview Verification

Before production promotion:

- Record deployment URL and source commit.
- Run hosted Playwright against preview.
- Verify CSP/security headers.
- Verify no runtime request beyond static assets.
- Compare release/version metadata and screenshot seeds.
- Complete content and asset-license audit.

### Rollback

Cloudflare Pages retains deployments. Roll back by selecting the most recent verified deployment in
the dashboard or redeploying its known commit/artifact. After rollback, smoke title, catch, loss,
restart, and headers. Do not hot-edit generated assets in the dashboard.

## 6. S3 Static Website — Alternative

### Bucket Layout

Upload `dist/` contents to bucket root so `index.html` is root-level.

Required metadata:

| Pattern | Content-Type | Cache-Control |
|---------|--------------|---------------|
| `*.html` | `text/html; charset=utf-8` | `no-cache` or short revalidation |
| `*.js` | `text/javascript; charset=utf-8` | `public, max-age=300` for fixed filename |
| `*.css` | `text/css; charset=utf-8` | `public, max-age=300` for fixed filename |
| `*.svg` | `image/svg+xml` | `public, max-age=86400` |
| `*.png` | `image/png` | `public, max-age=86400` |

Because v1 uses stable `game.js`/`styles.css` filenames, do not set year-long immutable caching.

### Basic Website Endpoint

1. Create a dedicated bucket with a globally unique name.
2. Enable static website hosting.
3. Set index document `index.html` and error document `404.html`.
4. Upload verified artifact with correct content types.
5. Configure only the public-read policy required for website assets.
6. Test the generated website endpoint.

Plain S3 website hosting is suitable for a quick endpoint but should not be the preferred custom
HTTPS architecture.

### S3 + CloudFront Recommended Architecture

For HTTPS/custom domain:

1. Keep the S3 bucket private where the chosen CloudFront origin mode permits.
2. Create CloudFront distribution with S3 origin and origin access control where applicable.
3. Default root object: `index.html`.
4. Attach a response-headers policy equivalent to Cloudflare `_headers`.
5. Redirect HTTP viewers to HTTPS.
6. Attach ACM certificate and DNS only after preview validation.
7. Invalidate `/index.html`, `/game.js`, and `/styles.css` on fixed-name deployment, or version the
   whole distribution path in a later cache strategy.

Do not commit bucket names, AWS account IDs, credentials, or distribution IDs.

### AWS CLI Example Shape

Use placeholders and a personally authenticated AWS profile:

```bash
aws s3 sync dist/ s3://YOUR_BUCKET/ --delete --profile YOUR_PERSONAL_PROFILE
```

Because metadata differs by file type, the implementation/deployment script should set content
types and cache policies explicitly or rely on a reviewed sync strategy. Never copy the placeholder
command without replacing and verifying its target.

### S3 Rollback

- Enable bucket versioning or retain every release ZIP/checksum.
- Restore the prior verified artifact and invalidate CloudFront fixed paths.
- Run the same smoke/header checks used for a forward deploy.

## 7. Versioning

- Initial release: `0.1.0` until visual/gameplay review approves public v1.
- Public release: `1.0.0`.
- `package.json` version is the source of truth for artifact name.
- Optional build metadata may be displayed in credits, never in the gameplay HUD.
- A release tag/commit must be created only from the personal Git identity/account.

## 8. Cache Strategy

V1 keeps stable filenames for direct-file simplicity. Hosted HTML/JS/CSS use revalidation or short
cache. Cloudflare automatically applies ETags; do not add complex fingerprint-manifest machinery
until asset volume justifies it.

If hashed files are adopted later:

- `index.html` remains no-cache.
- Generated asset references remain relative.
- Release ZIP and `file://` tests remain mandatory.
- Build scanner verifies no stale manifest references.

## 9. CI Recommendation

After the planning files are safely committed from the personal account, add a GitHub Actions
workflow that:

1. Uses Node 24 LTS.
2. Runs `npm ci`.
3. Installs Playwright browsers with documented cache strategy.
4. Runs `npm run verify`.
5. Uploads Playwright report/artifact only on failure.
6. Does not deploy from pull requests.

Cloudflare Git integration can deploy after CI or directly from `main`; prefer a protected flow in
which tests pass before merge. No GitHub or Cloudflare secret is required in the source repository
if native Pages Git integration handles deployment.

## 10. Release Checklist

- [ ] Personal Git author and GitHub account verified.
- [ ] Clean install and `npm run verify` pass.
- [ ] Package ZIP checksum generated.
- [ ] Direct-file smoke run from extracted ZIP.
- [ ] Hosted preview E2E and browser smoke pass.
- [ ] CSP/security headers verified.
- [ ] No unexpected network request, analytics, or secret.
- [ ] Asset manifest complete.
- [ ] Satire disclaimer and content audit approved.
- [ ] Performance report attached to release notes.
- [ ] Production deployment URL recorded.
- [ ] Production smoke passes.
- [ ] Rollback target and procedure verified.

## 11. Hosting Research References

- Cloudflare static HTML: <https://developers.cloudflare.com/pages/framework-guides/deploy-anything/>
- Cloudflare Direct Upload: <https://developers.cloudflare.com/pages/get-started/direct-upload/>
- Cloudflare custom headers: <https://developers.cloudflare.com/pages/configuration/headers/>
- Cloudflare serving behavior: <https://developers.cloudflare.com/pages/configuration/serving-pages/>
- S3 website hosting: <https://docs.aws.amazon.com/AmazonS3/latest/userguide/EnableWebsiteHosting.html>
- CloudFront HTTP/HTTPS behavior:
  <https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HTTPandHTTPSRequests.html>
