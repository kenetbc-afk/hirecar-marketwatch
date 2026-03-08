---
document_id: HC-CFG-011-A
title: Member Portal Scaffold — hub.hirecar.io
version: 1.0
date: 2026-03-04
status: READY FOR IMPLEMENTATION
classification: Internal — WS2 Bot Building
workstation: WS2-BOT-ENROLLMENT
---

# Member Portal Scaffold — hub.hirecar.io

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Domain** | hub.hirecar.io |
| **Stack** | Next.js 14+ (App Router) |
| **Auth** | OAuth 2.0 PKCE via Zoho Accounts |
| **Hosting** | Cloudflare Pages (SSR via @cloudflare/next-on-pages) |
| **API** | api.hirecar.io/v1/member/{id} (proxied from Zoho CRM) |
| **Design** | Dark theme (#111820), gold accents (#C9920A), mobile-first |
| **Accessibility** | WCAG 2.1 AA compliance |
| **Load Target** | 100 concurrent users on member dashboard |

---

## 2. Project Structure

```
hub.hirecar.io/
├── app/
│   ├── layout.tsx                  # Root layout (dark theme, fonts, nav shell)
│   ├── page.tsx                    # Landing / login redirect
│   ├── globals.css                 # CSS variables, base styles
│   ├── (auth)/
│   │   ├── login/page.tsx          # OAuth 2.0 PKCE initiation
│   │   ├── callback/page.tsx       # OAuth callback handler
│   │   └── logout/page.tsx         # Session destroy + redirect
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Authenticated layout (sidebar, header)
│   │   ├── page.tsx                # Dashboard home → Score Overview
│   │   ├── scores/page.tsx         # Score Overview (HBI, VDI, BRE, CRI, FPI, MSI)
│   │   ├── pass/page.tsx           # Pass Status (wallet pass details, QR)
│   │   ├── playbook/page.tsx       # Playbook Access (link + PIN display)
│   │   └── payments/page.tsx       # Payment History
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      # Generate PKCE challenge + redirect
│       │   ├── callback/route.ts   # Exchange code for tokens
│       │   ├── refresh/route.ts    # Refresh access token
│       │   └── logout/route.ts     # Clear session
│       └── member/
│           ├── [id]/route.ts       # Proxy to Zoho CRM member data
│           └── scores/[id]/route.ts # Proxy to scoring API
├── components/
│   ├── ui/                         # Shared UI primitives
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── ScoreGauge.tsx          # Radial score display (0-100 / 0-1000)
│   │   ├── ScoreCard.tsx           # Score summary card with trend
│   │   └── Skeleton.tsx            # Loading state placeholders
│   ├── layout/
│   │   ├── Sidebar.tsx             # Desktop sidebar nav
│   │   ├── MobileNav.tsx           # Bottom tab bar (mobile)
│   │   ├── Header.tsx              # Top bar with user avatar
│   │   └── BrandMark.tsx           # HIRECAR wordmark
│   └── dashboard/
│       ├── ScoreOverview.tsx        # 6-score grid with HBI hero
│       ├── PassCard.tsx             # Wallet pass status display
│       ├── PlaybookAccess.tsx       # Playbook link + PIN reveal
│       └── PaymentTable.tsx         # Payment history table
├── lib/
│   ├── auth.ts                     # OAuth PKCE utilities
│   ├── session.ts                  # Cookie-based session management
│   ├── zoho.ts                     # Zoho CRM API client
│   ├── scores.ts                   # Score calculation types + fetcher
│   └── constants.ts                # App-wide constants
├── types/
│   ├── member.ts                   # Member data types
│   ├── scores.ts                   # Score system types
│   └── auth.ts                     # Auth token types
├── middleware.ts                    # Route protection (redirect if unauthenticated)
├── next.config.js                  # Next.js config for Cloudflare
├── wrangler.toml                   # Cloudflare Pages config
├── tailwind.config.ts              # Tailwind with HIRECAR theme
├── package.json
├── tsconfig.json
└── .env.local.example
```

---

## 3. Authentication Flow (OAuth 2.0 PKCE)

### 3.1 Flow Diagram

```
Client (Browser)              hub.hirecar.io API            Zoho Accounts
     │                              │                             │
     │  1. Click "Sign In"          │                             │
     │─────────────────────────────>│                             │
     │                              │  2. Generate code_verifier  │
     │                              │     + code_challenge         │
     │                              │     Store verifier in cookie │
     │  3. Redirect to Zoho         │                             │
     │<─────────────────────────────│                             │
     │                              │                             │
     │  4. User authenticates       │                             │
     │──────────────────────────────────────────────────────────>│
     │                              │                             │
     │  5. Redirect with auth code  │                             │
     │<──────────────────────────────────────────────────────────│
     │                              │                             │
     │  6. Send code to callback    │                             │
     │─────────────────────────────>│                             │
     │                              │  7. Exchange code + verifier│
     │                              │─────────────────────────────>
     │                              │  8. Receive tokens          │
     │                              │<─────────────────────────────
     │                              │  9. Store in HttpOnly cookie│
     │  10. Redirect to /dashboard  │                             │
     │<─────────────────────────────│                             │
```

### 3.2 Environment Variables

```env
# Zoho OAuth
ZOHO_CLIENT_ID=1000.XXXXXXXXXX
ZOHO_CLIENT_SECRET=XXXXXXXXXX
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
ZOHO_AUTH_REDIRECT_URI=https://hub.hirecar.io/api/auth/callback
ZOHO_SCOPES=ZohoCRM.modules.ALL,ZohoCRM.users.READ

# Zoho CRM API
ZOHO_CRM_API_URL=https://www.zohoapis.com/crm/v2

# Session
SESSION_SECRET=<random-256-bit-hex>
SESSION_COOKIE_NAME=hc_session
SESSION_MAX_AGE=86400  # 24 hours

# App
NEXT_PUBLIC_APP_URL=https://hub.hirecar.io
NEXT_PUBLIC_SUPPORT_EMAIL=support@hirecar.la
```

### 3.3 Auth Library (lib/auth.ts)

```typescript
import crypto from 'crypto';

export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

export function buildAuthURL(challenge: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.ZOHO_CLIENT_ID!,
    scope: process.env.ZOHO_SCOPES!,
    redirect_uri: process.env.ZOHO_AUTH_REDIRECT_URI!,
    access_type: 'offline',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'consent',
  });
  return `${process.env.ZOHO_ACCOUNTS_URL}/oauth/v2/auth?${params}`;
}

export async function exchangeCode(code: string, verifier: string) {
  const res = await fetch(`${process.env.ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      redirect_uri: process.env.ZOHO_AUTH_REDIRECT_URI!,
      code,
      code_verifier: verifier,
    }),
  });
  return res.json();
}

export async function refreshToken(refresh_token: string) {
  const res = await fetch(`${process.env.ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      refresh_token,
    }),
  });
  return res.json();
}
```

---

## 4. Dashboard Pages

### 4.1 Score Overview (Default Dashboard View)

```
┌──────────────────────────────────────────────┐
│  HIRECAR BUSINESS INDEX                      │
│  ┌──────────────────────────────────────┐    │
│  │         HBI: 742 / 1000              │    │
│  │    [═══════════════════░░░░░]         │    │
│  │    ↑12 from last month               │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌────┐│
│  │ VDI │  │ BRE │  │ CRI │  │ FPI │  │MSI ││
│  │ 68  │  │ 74  │  │ 82  │  │ 56  │  │ 91 ││
│  │/100 │  │/100 │  │/100 │  │/100 │  │/100││
│  └─────┘  └─────┘  └─────┘  └─────┘  └────┘│
└──────────────────────────────────────────────┘
```

Layout: HBI hero card at top (large radial gauge), 5 sub-scores in a responsive grid below. Each card shows current value, trend arrow, and last updated date.

### 4.2 Pass Status

Displays wallet pass information:
- Pass status (ACTIVE, SUSPENDED, EXPIRED)
- Dispute ID and filing date
- Membership tier badge
- Advisor name
- QR code (links to playbook)
- "Add to Wallet" button (links to passUrl for users who haven't added yet)

### 4.3 Playbook Access

- Embedded link to Bit.ai playbook
- PIN display (masked by default, click to reveal)
- Playbook sections checklist (progress tracking)
- Direct "Open Playbook" button

### 4.4 Payment History

- Table: Date, Description, Amount, Status
- Filter by date range
- Export to CSV

---

## 5. API Routes

### 5.1 Member Data Proxy

```typescript
// app/api/member/[id]/route.ts
import { getSession } from '@/lib/session';
import { zohoFetch } from '@/lib/zoho';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const member = await zohoFetch(
    `/crm/v2/HC_Enrollment/${params.id}`,
    session.accessToken
  );

  return Response.json({
    id: member.id,
    name: member.Client_Name,
    email: member.Client_Email,
    phone: member.Client_Phone,
    disputeId: member.Dispute_ID,
    scoreRange: member.Score_Range,
    negativeItems: member.Negative_Items,
    membershipTier: member.Membership_Tier,
    enrollmentStatus: member.Enrollment_Status,
    advisorName: member.Advisor_Name,
    disputeDate: member.Dispute_Date,
    accessPin: member.Access_PIN,
    passUrl: member.Pass_URL,
    playbookUrl: member.Playbook_URL,
    scores: {
      hbi: member.HBI_Score,
      vdi: member.VDI_Score,
      bre: member.BRE_Score,
      cri: member.CRI_Score,
      fpi: member.FPI_Score,
      msi: member.MSI_Score,
    }
  });
}
```

---

## 6. Middleware (Route Protection)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/callback', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = request.cookies.get('hc_session');
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

---

## 7. Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hc: {
          bg: '#111820',
          card: '#1a2230',
          'card-alt': '#1e2a3a',
          gold: '#C9920A',
          'gold-light': '#e0ad2b',
          border: 'rgba(201, 146, 10, 0.12)',
        },
        score: {
          excellent: '#34d399',  // 80-100 / 800-1000
          good: '#60a5fa',      // 60-79 / 600-799
          fair: '#fbbf24',      // 40-59 / 400-599
          needswork: '#fb923c', // 20-39 / 200-399
          critical: '#f87171',  // 0-19 / 0-199
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Nunito Sans', '-apple-system', 'sans-serif'],
      },
    }
  },
  plugins: [],
};

export default config;
```

---

## 8. Cloudflare Pages Deployment

```toml
# wrangler.toml
name = "hirecar-member-portal"
compatibility_date = "2026-03-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"

[vars]
NEXT_PUBLIC_APP_URL = "https://hub.hirecar.io"
```

### Build Command
```bash
npx @cloudflare/next-on-pages
```

### Deploy Command
```bash
npx wrangler pages deploy .vercel/output/static --project-name=hirecar-member-portal
```

---

## 9. Type Definitions

```typescript
// types/member.ts
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  disputeId: string;
  scoreRange: string;
  negativeItems: string;
  membershipTier: 'Standard' | 'Operator' | 'First Class' | 'Elite';
  enrollmentStatus: 'PENDING' | 'ENROLLED' | 'ACTIVE' | 'SUSPENDED';
  advisorName: string;
  disputeDate: string;
  accessPin: string;
  passUrl: string;
  playbookUrl: string;
  scores: MemberScores;
}

// types/scores.ts
export interface MemberScores {
  hbi: number;  // 0-1000
  vdi: number;  // 0-100
  bre: number;  // 0-100
  cri: number;  // 0-100
  fpi: number;  // 0-100
  msi: number;  // 0-100
}

export interface ScoreHistory {
  score: string;
  date: string;
  value: number;
  delta: number;
}

// types/auth.ts
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  memberId: string;
  memberName: string;
}
```

---

## 10. Dependencies (package.json)

```json
{
  "name": "hirecar-member-portal",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:deploy": "npx wrangler pages deploy .vercel/output/static",
    "lint": "next lint",
    "test": "vitest"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "iron-session": "^8.0.0"
  },
  "devDependencies": {
    "@cloudflare/next-on-pages": "^1.13.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0",
    "vitest": "^1.0.0",
    "wrangler": "^3.0.0"
  }
}
```

---

## 11. Implementation Checklist

- [ ] Initialize Next.js project with `npx create-next-app@latest --typescript --tailwind --app`
- [ ] Configure Tailwind with HIRECAR theme (Section 7)
- [ ] Set up environment variables (Section 3.2)
- [ ] Implement OAuth 2.0 PKCE auth flow (Section 3)
- [ ] Create middleware for route protection (Section 6)
- [ ] Build Score Overview dashboard page
- [ ] Build Pass Status page
- [ ] Build Playbook Access page
- [ ] Build Payment History page
- [ ] Create API proxy routes for Zoho CRM (Section 5)
- [ ] Configure Cloudflare Pages deployment (Section 8)
- [ ] Run WCAG 2.1 AA accessibility audit
- [ ] Load test: 100 concurrent users
- [ ] DNS: Point hub.hirecar.io to Cloudflare Pages

---

*Document Control: HC-CFG-011-A | WS2-BOT-ENROLLMENT | 2026-03-04*
