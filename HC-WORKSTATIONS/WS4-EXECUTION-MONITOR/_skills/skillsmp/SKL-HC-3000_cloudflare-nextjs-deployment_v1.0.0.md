---
name: cloudflare-nextjs-deployment
description: Deploy Next.js applications to Cloudflare Workers using OpenNext adapter. Covers SSR on edge, static assets via Pages, API routes, middleware, and ISR on Cloudflare.
triggers:
  - next.js cloudflare
  - opennext
  - edge runtime
  - next on workers
---

# Next.js on Cloudflare (OpenNext)

## Setup
```bash
npm install @opennextjs/cloudflare
npx @opennextjs/cloudflare init
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    loader: 'custom',
    loaderFile: './lib/cloudflare-image-loader.ts',
  },
};
module.exports = nextConfig;
```

### wrangler.toml
```toml
name = "hirecar-dashboard"
main = ".open-next/worker.js"
compatibility_date = "2024-09-25"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[[kv_namespaces]]
binding = "NEXT_CACHE_KV"
id = "your-kv-namespace-id"
```

## Build & Deploy
```bash
# Build
npx @opennextjs/cloudflare build

# Deploy
wrangler deploy
```

## Key Considerations for HIRECAR
- Use edge runtime for API routes that need low latency (scoring, auth)
- Static pages (public site, blog) deploy to Cloudflare Pages directly
- Dashboard SSR pages use OpenNext on Workers
- Use KV for ISR cache and session storage
- Use R2 for uploaded documents and PDFs
- Middleware runs on edge for auth checks and redirects

## Environment Variables
```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put DATABASE_URL
wrangler secret put SENDGRID_API_KEY
```

## Limitations
- No Node.js native modules on edge
- 10ms CPU time limit on free plan (50ms on paid)
- Use KV for caching instead of filesystem
- Image optimization requires Cloudflare Images or external service
