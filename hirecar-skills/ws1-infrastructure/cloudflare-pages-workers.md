---
name: cloudflare-pages-workers
description: Deploy and manage Cloudflare Pages sites and Workers for HIRECAR ecosystem. Covers Pages deployment, Workers scripting, KV storage, R2 buckets, D1 databases, custom domains, and Wrangler CLI.
triggers:
  - cloudflare
  - pages
  - workers
  - wrangler
  - KV
  - R2
  - D1
  - edge functions
  - CDN
---

# Cloudflare Pages & Workers

## Pages Deployment

### Quick Deploy
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy static site
wrangler pages deploy ./dist --project-name=hirecar-public

# Deploy with build command
wrangler pages deploy . --project-name=hirecar-public --build-command="npm run build" --build-output-dir="dist"
```

### wrangler.toml for Pages
```toml
name = "hirecar-public"
compatibility_date = "2024-09-25"
pages_build_output_dir = "./dist"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "HIRECAR_KV"
id = "your-kv-id"
```

### Custom Domain Setup
```bash
wrangler pages project create hirecar-public --production-branch=main
# Then add custom domain in Cloudflare Dashboard:
# Pages > hirecar-public > Custom domains > Add: hirecar.la
```

## Workers

### Basic Worker Template
```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://hirecar.la',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route handling
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }

    return new Response('Not Found', { status: 404 });
  },
};
```

### KV Storage
```typescript
// Write
await env.HIRECAR_KV.put('user:123', JSON.stringify(userData), { expirationTtl: 86400 });

// Read
const data = await env.HIRECAR_KV.get('user:123', 'json');

// List keys
const list = await env.HIRECAR_KV.list({ prefix: 'user:' });
```

### R2 Object Storage
```typescript
// Upload
await env.HIRECAR_R2.put('documents/report.pdf', fileBuffer, {
  httpMetadata: { contentType: 'application/pdf' },
});

// Download
const obj = await env.HIRECAR_R2.get('documents/report.pdf');
```

### D1 Database
```typescript
const result = await env.HIRECAR_D1.prepare(
  'SELECT * FROM clients WHERE membership_tier = ?'
).bind('Elite').all();
```

## Environment Management
```bash
# Dev
wrangler dev

# Staging
wrangler deploy --env staging

# Production
wrangler deploy --env production
```

## Best Practices
- Use `compatibility_date` for API stability
- Set up separate KV namespaces per environment
- Use Workers for server-side logic (scoring, auth) to protect business logic
- Cache static assets with appropriate TTLs
- Use R2 for document storage (PDFs, images)
- Rate limit API endpoints with Workers
