---
name: github-actions-cicd
description: GitHub Actions CI/CD workflows for HIRECAR monorepo. Covers workflow syntax, triggers, matrix builds, caching, secrets, deployment to Cloudflare Pages and Vercel, branch protection, and security scanning.
triggers:
  - github actions
  - CI/CD
  - workflow
  - deployment pipeline
  - continuous integration
  - continuous deployment
---

# GitHub Actions CI/CD for HIRECAR

## Workflow Structure
```
.github/
  workflows/
    ci.yml              # Lint, type-check, test on PR
    deploy-pages.yml    # Deploy public site to Cloudflare Pages
    deploy-dashboard.yml # Deploy dashboard to Vercel
    security.yml        # CodeQL + dependency scanning
    release.yml         # Tag-based releases
```

## CI Workflow (ci.yml)
```yaml
name: CI
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

## Deploy to Cloudflare Pages
```yaml
name: Deploy Public Site
on:
  push:
    branches: [main]
    paths: ['apps/web/**', 'packages/shared/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build --workspace=apps/web
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy apps/web/dist --project-name=hirecar-public
```

## Deploy to Vercel
```yaml
name: Deploy Dashboard
on:
  push:
    branches: [main]
    paths: ['apps/dashboard/**', 'packages/shared/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/dashboard
```

## Security Scanning
```yaml
name: Security
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am

jobs:
  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3

  dependency-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
```

## Secrets Management
Required repository secrets:
- `CLOUDFLARE_API_TOKEN` — Cloudflare Pages deploy
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account
- `VERCEL_TOKEN` — Vercel deploy
- `VERCEL_ORG_ID` — Vercel org
- `VERCEL_PROJECT_ID` — Vercel project
- `STRIPE_SECRET_KEY` — For test runs
- `SENDGRID_API_KEY` — Email integration tests

## Caching
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: ${{ runner.os }}-node-
```

## Branch Protection Rules
- Require CI to pass before merge
- Require 2 approving reviews
- Require signed commits
- No force push to main
- CODEOWNERS approval required
