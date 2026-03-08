---
name: nextjs-master
description: Use when building or refactoring Next.js 14+ App Router applications — Server Components, TypeScript patterns, Supabase integration, and performance optimization
tier: CRITICAL
value_tier: production
tags: [nextjs, react, typescript, supabase, vercel, app-router]
entitlements: { product_tiers: [pro, enterprise], agent_access: [all] }
---

# Next.js 14+ Mastery Skill

## Core Architecture

### Server Components (Default)
- Use Server Components by default - no "use client" unless necessary
- Client Components only for: interactivity, browser APIs, hooks
- Minimize useEffect, useState - favor RSC data fetching

### App Router Conventions
```
app/
├── (auth)/           # Route groups
├── api/              # API routes / Edge Functions
├── globals.css       # Global styles
└── layout.tsx        # Root layout with providers

components/
├── ui/               # Shadcn UI components
├── forms/            # Form components with React Hook Form
└── sections/         # Page sections
```

### File-Based Routing Rules
- `page.tsx`: Route pages (Server Components)
- `layout.tsx`: Shared layouts with proper children typing
- `loading.tsx`: Suspense fallbacks
- `error.tsx`: Error boundaries with error.ts
- `not-found.tsx`: 404 pages

## TypeScript Patterns

### Dynamic Route Props
```typescript
interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string: string | string[] | undefined }>
}
```

### Server Actions
```typescript
'use server'
export async function createItem(formData: FormData) {
  'use server'
  // Direct database calls - no API routes needed
}
```

## Supabase Integration

### Row Level Security (RLS)
- Always enable RLS on all tables
- Create policies for: SELECT, INSERT, UPDATE, DELETE
- Use auth.uid() for user-specific data

### Real-time Subscriptions
```typescript
const channel = supabase
  .channel('table-db')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
    // Handle changes
  })
  .subscribe()
```

## Performance Optimization

### Core Web Vitals
- LCP < 2.5s: Optimize images, font loading, SSR
- CLS < 0.1: Reserve space for dynamic content
- FID/INP < 100ms: Minimize client JS, defer non-critical

### Optimization Techniques
- Dynamic imports for non-critical components
- React.memo for pure components
- Image optimization with Next.js Image
- Font optimization with next/font
- Route prefetching with Link

## State Management

### Server-First Approach
- Fetch data in Server Components
- Pass serialized data to Client Components
- Use URL searchParams for filter state

### Client State (when needed)
- React Hook Form for form state
- Zustand for global client state
- React Query for server state synchronization

## Error Handling

### Error Boundaries
```typescript
// app/error.tsx
'use client'
export default function Error({ error, reset }) {
  return <div>Error: {error.message}</div>
}
```

### try/catch in Server Actions
```typescript
'use server'
export async function submitForm(prevState, formData) {
  try {
    // Logic
    return { success: true }
  } catch (e) {
    return { error: e.message }
  }
}
```

## SEO & Metadata

### Dynamic Metadata
```typescript
export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.slug)
  return {
    title: product.title,
    description: product.description,
    openGraph: { images: [product.image] }
  }
}
```

## Testing Requirements

- Jest + React Testing Library for unit tests
- Playwright for E2E tests
- Test components in isolation
- Mock Supabase responses
