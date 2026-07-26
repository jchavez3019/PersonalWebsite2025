# 0000 — CI/CD and Static Hosting (S3 + CloudFront)

- **Status:** Accepted
- **Date:** 2026-07-26

## Context

This repository is an Angular 19 single-page application that must be published at `www.jorgechavezuiuc.com`. The site is static after a production build: there is no server-rendered HTML and no application server in the critical path for page delivery.

We needed a pipeline that:

1. Validates pull requests before merge (lint, build, and end-to-end checks).
2. Publishes a production build automatically when changes land on `master`.
3. Serves assets worldwide with reasonable latency and cache invalidation after each deploy.
4. Reuses existing AWS account/domain setup rather than introducing a second hosting vendor.

Quality gates live in GitHub Actions under `.github/workflows/`. Deployment is a separate workflow from the PR checks: CI does not publish, and deploy does not replace PR validation.

## Decision

We settled on **GitHub Actions + Amazon S3 + Amazon CloudFront** as the delivery stack, with Node.js **20.2.0** for install/build steps that must match local production builds.

### Pull-request quality gates (do not deploy)

| Workflow | File | Trigger | Role |
|---|---|---|---|
| CI Checks | `.github/workflows/ci.yml` | `pull_request` → `master` | `npm ci`, ESLint (`npm run lint`), production Angular build |
| Playwright Tests | `.github/workflows/playwright.yml` | `pull_request` → `main` / `master` | Install browsers, run Playwright e2e, upload report artifact |

These workflows are the merge bar. They ensure broken lint, failed builds, or failing e2e tests are caught before `master` is updated.

### Continuous deployment (publishes the site)

| Workflow | File | Trigger | Role |
|---|---|---|---|
| Deploy Angular Application to S3 | `.github/workflows/main.yml` | `push` → `master` | Build and sync to S3, then invalidate CloudFront |

Deployment steps, in order:

1. Check out the repository and set up Node.js 20.2.0.
2. Install dependencies with `npm ci`.
3. Derive `MASTER_LAST_UPDATED` from the latest git commit timestamp (`git log -1 --format=%cI`).
4. Inject that value into `src/environments/environment.prod.ts` by rewriting `masterLastUpdated` in place (so the live site can show when `master` was last published).
5. Build with `npm run build -- --configuration production`.
6. Configure AWS credentials from GitHub secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) in region `us-east-1`.
7. Sync the browser build output to the public website bucket:

   ```text
   aws s3 sync ./dist/updated-personal-website/browser s3://www.jorgechavezuiuc.com --delete --acl public-read
   ```

8. Invalidate the CloudFront distribution (`CLOUDFRONT_DISTRIBUTION_ID` secret) for path `/*` so clients receive the new assets.

### Hosting choice

S3 holds the static build artifacts. CloudFront sits in front as the CDN. This fits a personal Angular SPA: low operational overhead, cheap static object hosting, and cache control via explicit invalidation after each deploy. Alternatives such as GitHub Pages or Netlify were not chosen because the domain and AWS account already owned the production path, and S3 + CloudFront keep deploy credentials and DNS within that stack.

### Separation of concerns

- **`ci.yml` / `playwright.yml`:** validation only.
- **`main.yml`:** the sole publish path. Merging (or pushing) to `master` is what goes live.

## Consequences

### Positive

- PR feedback is automated and independent of AWS deploy credentials for contributors who only open PRs.
- Deploys are reproducible: same Node version, lockfile install, and production configuration.
- `--delete` on `s3 sync` keeps the bucket aligned with the current build (stale hashed assets do not accumulate indefinitely).
- CloudFront invalidation avoids long-lived stale HTML/JS after a release.
- `masterLastUpdated` injection gives the UI a trustworthy “last published” stamp without a backend.

### Negative / trade-offs

- Deploy credentials must live in GitHub Actions secrets; rotation is an operational duty.
- Full-path CloudFront invalidation (`/*`) is simple but broader than per-object invalidation.
- Bucket objects are synced with `public-read` ACL; access model is “public website objects,” not private-origin-only.
- Playwright’s workflow allows `main` as well as `master`; the deploy branch of record remains `master`.

### Non-goals

- Blue/green or canary deploys.
- Preview environments per pull request.
- Server-side rendering or edge compute for Angular.
- Replacing GitHub Actions with a self-hosted runner.
