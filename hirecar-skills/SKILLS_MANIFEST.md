# HIRECAR Skills Repository Manifest
**Generated:** 2026-03-04 | **Total Skills:** 55 (26 SkillsMP + 24 ClawHub + 1 ClawHub Direct + 4 Custom Enrollment) | **Total Size:** 558.5 KB + 17 API References

---

## WS1 — Infrastructure & Payments (9 skills)

| Skill | Source | Size | Purpose |
|-------|--------|------|---------|
| stripe-integration | SkillsMP / sickn33 (18K★) | 13.5 KB | Stripe API integration patterns, webhooks, checkout |
| payment-integration | SkillsMP / sickn33 (18K★) | 3.7 KB | Multi-gateway payment processing |
| stripe-best-practices | SkillsMP / slurpyb | 5.5 KB | Stripe security, testing, error handling |
| cloudflare-pages-workers | Custom (HIRECAR) | 3.0 KB | Pages deploy, Workers, KV, R2, D1 for hirecar.la |
| vercel-deploy | SkillsMP / oimiragieo (16★) | 9.4 KB | Zero-auth Vercel deploy, 20+ framework detection |
| deploying-to-production | SkillsMP / slurpyb | 1.3 KB | GitHub + Vercel production pipeline |
| sendgrid-automation | SkillsMP / sickn33 (18K★) | 12.8 KB | SendGrid contacts, templates, analytics via Composio |
| email-systems | SkillsMP / travisjneuman (16★) | 17.5 KB | Resend/SendGrid/SES, React Email, SPF/DKIM/DMARC |
| twilio-sms-automation | Custom (HIRECAR) | 2.8 KB | Twilio SMS for client notifications, TCPA compliance, 5 templates |

## WS2 — Bot Building & Enrollment (11 skills)

| Skill | Source | Size | Purpose |
|-------|--------|------|---------|
| react-nextjs-development | SkillsMP / sickn33 (18K★) | 5.4 KB | Next.js 14+ App Router, Server Components, TypeScript |
| senior-frontend | SkillsMP / slurpyb | 4.5 KB | React/Next/TS/Tailwind component scaffolding |
| nextjs-master | SkillsMP / fratilanico | 3.7 KB | Next.js 14+ App Router, Supabase, performance |
| security-architect | SkillsMP / oimiragieo (16★) | 25.7 KB | OWASP Top 10, AI security, threat modeling |
| auth-security-expert | SkillsMP / oimiragieo (16★) | 28.3 KB | OAuth 2.1, JWT, encryption, 2026 standards |
| authentication-flow-rules | SkillsMP / oimiragieo (16★) | 12.9 KB | OAuth 2.1 PKCE flows, token security |
| zoho-crm-automation | SkillsMP / sickn33 (18K★) | 7.7 KB | Zoho CRM records, contacts, leads via Composio |
| credit-repair-strategist | ClawHub / yoavfael (Direct) | 7.3 KB | FICO mechanics, bureau disputes, credit building for vehicle financing |
| passkit-enrollment-automation | Custom (HIRECAR) | 4.2 KB | PassKit API pass creation, updates, webhooks for enrollment chain |
| bitai-playbook-generator | Custom (HIRECAR) | 3.8 KB | Bit.ai API playbook creation, password protection, 9-section template |
| client-enrollment-orchestrator | Custom (HIRECAR) | 6.8 KB | Master orchestration: Zoho → Cloudflare Worker → Bit.ai → PassKit → Brevo → Twilio |

## WS3 — Content & Playbooks (5 skills)

| Skill | Source | Size | Purpose |
|-------|--------|------|---------|
| content-marketer | SkillsMP / sickn33 (18K★) | 8.6 KB | AI content creation, omnichannel, SEO, performance |
| seo-content-writer | SkillsMP / sickn33 (18K★) | 2.6 KB | SEO-optimized content from keyword briefs |
| content-creator | SkillsMP / slurpyb | 7.5 KB | Blog, social, brand voice analyzer, content calendars |
| frontend-landings | SkillsMP / auwalmusa | 13.7 KB | Production HTML landing pages, Tailwind, animations |
| landing-page-builder | SkillsMP / SixtySecondsApp | 21.0 KB | 6-phase pipeline: brief → wireframe → style → code |

## WS4 — Execution & Monitor (4 skills)

| Skill | Source | Size | Purpose |
|-------|--------|------|---------|
| ci-cd-pipelines | SkillsMP / medy-gribkov | 13.3 KB | GitHub Actions, caching, matrix, Docker, deploy |
| github-actions-cicd | Custom (HIRECAR) | 3.9 KB | HIRECAR-specific CI/CD, Cloudflare + Vercel deploy |
| stripe-billing | SkillsMP / get-caio | 6.0 KB | Subscription billing, metered usage, invoicing |
| stripe-payments | SkillsMP / medy-gribkov | 9.5 KB | Payment intents, checkout sessions, refunds |

## Shared (2 skills)

| Skill | Source | Size | Purpose |
|-------|--------|------|---------|
| oauth2-authentication | SkillsMP / UndiFineD | 69.5 KB | Comprehensive OAuth2, PKCE, OpenID Connect |
| cloudflare-nextjs-deployment | Custom (HIRECAR) | 1.8 KB | OpenNext adapter for Next.js on Cloudflare Workers |

---

## Installation

### For Claude Code / Cowork
```bash
# Copy to project skills directory
cp -r hirecar-skills/ .claude/skills/

# Or copy individual workspace skills
cp hirecar-skills/ws1-infrastructure/* .claude/skills/
```

### For GitHub Repository
```
hirecar-la/
  .claude/
    skills/
      ws1-infrastructure/
      ws2-bot-building/
      ws3-content/
      ws4-execution/
      shared/
```

---

## ClawHub Skills (24 skills — converted from OpenClaw format)

### ClawHub WS1 — Infrastructure & Payments (5 skills)

| Skill | Source | Downloads | Size | Purpose |
|-------|--------|-----------|------|---------|
| stripe-api | ClawHub (17.5K DL) | 17,539 | 16.4 KB | Full Stripe API — customers, subscriptions, invoices, products, payments |
| gmail | ClawHub (19.8K DL) | 19,812 | 8.7 KB | Gmail API — read, send, manage emails, threads, labels, drafts |
| himalaya | ClawHub (21.9K DL) | 21,857 | 4.4 KB | CLI email via IMAP/SMTP — list, read, write, reply, search |
| outlook-api | ClawHub (17.8K DL) | 17,820 | 10.4 KB | Microsoft Outlook — emails, folders, calendar, contacts via Graph |
| api-gateway | ClawHub (32K DL) | 32,029 | 30.7 KB | 100+ API connectors with managed OAuth (includes 17 HIRECAR-relevant refs) |

### ClawHub WS2 — Bot Building & Enrollment (6 skills)

| Skill | Source | Downloads | Size | Purpose |
|-------|--------|-----------|------|---------|
| slack | ClawHub (20.8K DL) | 20,779 | 2.3 KB | Slack messaging, reactions, pins, member info |
| notion | ClawHub (37.7K DL) | 37,676 | 5.0 KB | Notion pages, databases, blocks management |
| trello | ClawHub (18.4K DL) | 18,434 | 2.7 KB | Trello boards, lists, cards via REST API |
| browser-use | ClawHub (17.8K DL) | 17,785 | 22.2 KB | Browser automation for testing, form filling, data extraction |
| agent-browser | ClawHub (63.9K DL) | 63,898 | 10.2 KB | Headless Rust browser — navigate, click, type, snapshot |
| brave-search | ClawHub (26.2K DL) | 26,242 | 1.3 KB | Web search via Brave API — docs, facts, content |

### ClawHub WS3 — Content & Playbooks (6 skills)

| Skill | Source | Downloads | Size | Purpose |
|-------|--------|-----------|------|---------|
| humanizer | ClawHub (30.3K DL) | 30,267 | 17.8 KB | Remove AI writing signals — make content natural/human |
| youtube-watcher | ClawHub (22.1K DL) | 22,114 | 1.5 KB | Fetch YouTube transcripts for summarization |
| youtube-api-skill | ClawHub (20.7K DL) | 20,696 | 14.8 KB | Full YouTube Data API — search, playlists, channels, comments |
| blogwatcher | ClawHub (19.3K DL) | 19,280 | 1.2 KB | Monitor RSS/Atom feeds for blog updates |
| summarize | ClawHub (70.2K DL) | 70,238 | 1.4 KB | Summarize URLs, PDFs, images, audio, YouTube |
| nano-pdf | ClawHub (34.5K DL) | 34,536 | 0.8 KB | Natural-language PDF editing |

### ClawHub WS4 — Execution & Monitor (4 skills)

| Skill | Source | Downloads | Size | Purpose |
|-------|--------|-----------|------|---------|
| automation-workflows | ClawHub (20.8K DL) | 20,760 | 10.4 KB | Automation design for solopreneurs — identify, build, scale |
| self-improving-agent | ClawHub (95.4K DL) | 95,371 | 19.7 KB | Continuous learning — captures errors, corrections, learnings |
| proactive-agent | ClawHub (52K DL) | 52,021 | 20.9 KB | Transforms agents into proactive partners — WAL Protocol, memory |
| github | ClawHub (64.5K DL) | 64,523 | 1.1 KB | GitHub CLI — issues, PRs, CI runs, API queries |

### ClawHub Shared (3 skills)

| Skill | Source | Downloads | Size | Purpose |
|-------|--------|-----------|------|---------|
| skill-creator | ClawHub (23K DL) | 22,952 | 17.8 KB | Create and extend custom skills |
| frontend-design | ClawHub (20.9K DL) | 20,871 | 4.3 KB | Production-grade frontend interfaces |
| stock-analysis | ClawHub (21.4K DL) | 21,359 | 8.2 KB | Stock/crypto analysis — portfolio, watchlist, dividends |

### API Gateway Reference Bundle (17 services)

Included with the `api-gateway` skill — individual API reference docs for:
Stripe, SendGrid, Slack, Google Mail, Google Calendar, Google Drive, Google Sheets, Zoho CRM, Zoho Mail, Zoho Books, Zoho Calendar, Zoho Inventory, HubSpot, Mailchimp, Trello, Twilio, WhatsApp Business

---

## API Key Notice
Skills were downloaded using the SkillsMP REST API and ClawHub API (v1). Neither API key has been committed to any files. Recommend rotating both keys after tonight's session.

## Document Control
- **Document ID:** HC-CFG-001-A
- **Status:** ACTIVE
- **Effective Date:** 2026-03-04
