# GOV-HC-0003: Release & Publishing Governance
## Version: v1.0.0 | Date: 2026-03-04 | Approval: P1 (Director)
## Context: CTX-HC-0001 (HIRECAR, LLC)

---

## 1. Purpose

Defines the release lifecycle for HIRECAR deliverables: how artifacts move from QA-approved status into the **protected GitHub library**, how wiki pages are generated for review, how semantic revision numbers are assigned, and how domain/subdomain naming conventions are applied for maximum visual impact and brevity.

---

## 2. Release Lifecycle

```
DRAFT → QA REVIEW → QA APPROVED → RELEASE CANDIDATE → PUBLISHED → PROTECTED LIBRARY
         ↑                              ↓
         └──── REVISION (if issues) ────┘
```

| Stage | Gate | Owner | Output |
|-------|------|-------|--------|
| DRAFT | File created in HC-WORKSTATIONS | Author | Working document |
| QA REVIEW | BOT-HC-0002 scan + QA-HC-0001 brand check | QA Lead | Scan report |
| QA APPROVED | All checks pass, sign-off obtained | QA Lead + Manager | Approval stamp |
| RELEASE CANDIDATE | QA-HC-0003 deployment checklist gates cleared | Deployer | RC tag |
| PUBLISHED | Deployed to production, stakeholders notified | Director/CEO | Live artifact |
| PROTECTED LIBRARY | Pushed to GitHub protected branch with wiki page | Release Manager | Immutable record |

---

## 3. Semantic Versioning for Releases

### 3.1 Version Format

```
rev_MAJOR.MINOR.PATCH
```

| Segment | When to Increment | Example |
|---------|-------------------|---------|
| **MAJOR** | Breaking changes, new workstation, architectural shift | rev_2.00.00 |
| **MINOR** | New features, new documents, new skills added | rev_1.02.00 |
| **PATCH** | Bug fixes, typo corrections, minor adjustments | rev_1.01.03 |

### 3.2 Revision Naming Rules

- Always use **two-digit** minor and patch: `rev_1.01.01` not `rev_1.1.1`
- First release of any document: `rev_1.00.00`
- Pre-release candidates: append `-rc.1`, `-rc.2` (e.g., `rev_1.02.00-rc.1`)
- Never reuse a version number once published
- The `v` prefix in HC Format filenames (`_v1.0.0`) maps to release tags as `rev_1.00.00`

### 3.3 Examples

| Document Version | Release Tag | Meaning |
|------------------|-------------|---------|
| `_v1.0.0` | `rev_1.00.00` | Initial release |
| `_v1.0.1` | `rev_1.00.01` | Patch fix (typo, formatting) |
| `_v1.1.0` | `rev_1.01.00` | Minor feature addition |
| `_v2.0.0` | `rev_2.00.00` | Major revision (restructure) |

---

## 4. GitHub Protected Library

### 4.1 Repository Structure

```
hirecar-protected-library/
  main (protected branch - requires PR + review)
  ├── releases/
  │   ├── rev_1.00.00/
  │   │   ├── WS1-INFRASTRUCTURE/
  │   │   ├── WS2-BOT-ENROLLMENT/
  │   │   ├── WS3-CONTENT-PLAYBOOKS/
  │   │   ├── WS4-EXECUTION-MONITOR/
  │   │   ├── _QUALITY/
  │   │   ├── _BOTS/
  │   │   ├── _HC-FORMAT-REGISTRY/
  │   │   └── RELEASE-NOTES.md
  │   └── rev_1.01.00/
  │       └── ...
  ├── wiki/  (auto-generated)
  └── CHANGELOG.md
```

### 4.2 Branch Protection Rules

- **main**: Protected; requires 1 approved review, no force push, no deletion
- **release/***: Created for each release candidate, merged to main via PR
- **hotfix/***: Emergency patches, fast-tracked review (Manager approval only)
- All commits must be signed
- Status checks required: BOT-HC-0002 scan must pass

### 4.3 Release Process

1. Create branch `release/rev_X.XX.XX` from latest main
2. Copy QA-approved artifacts into `releases/rev_X.XX.XX/`
3. Generate `RELEASE-NOTES.md` with changes since last release
4. Open PR to main with title: `Release rev_X.XX.XX`
5. BOT-HC-0002 runs automatically on PR (GitHub Action)
6. Reviewer approves PR (Manager for minor, Director for major)
7. Merge to main; tag commit as `rev_X.XX.XX`
8. Wiki pages auto-generated from release contents

---

## 5. Wiki Pages for Review

### 5.1 Auto-Generated Wiki Structure

Each release generates wiki pages:

```
Wiki Home
├── Release Index
│   ├── rev_1.00.00 (Release Notes + File Index)
│   ├── rev_1.01.00
│   └── ...
├── Workstation Guides
│   ├── WS1 Infrastructure
│   ├── WS2 Bot Enrollment
│   ├── WS3 Content Playbooks
│   └── WS4 Execution Monitor
├── QA Standards
│   ├── Brand Quality (QA-HC-0001)
│   ├── Test Plans (QA-HC-0002)
│   ├── Deploy Checklist (QA-HC-0003)
│   └── Maintenance (QA-HC-0004)
├── Bot Registry
│   ├── BOT-HC-0001 Doc Approval
│   └── BOT-HC-0002 QA Validation
└── HC Format Reference
    ├── Naming Convention
    ├── Document Classes
    └── Approval Levels
```

### 5.2 Wiki Page Template

```markdown
# {DOC-ID}: {Title}
**Version:** rev_X.XX.XX | **Status:** PUBLISHED | **Approved:** {Date}

## Summary
{Auto-extracted from document Section 1}

## File Location
`releases/rev_X.XX.XX/{path}/{filename}`

## Approval Chain
| Role | Approver | Date |
|------|----------|------|
| QA Lead | {name} | {date} |
| Manager | {name} | {date} |
| Director | {name} | {date} |

## Revision History
{Auto-extracted from document}

## Review Comments
{Linked from PR discussion}
```

---

## 6. Domain & Subdomain Naming Conventions

### 6.1 Core Principle

**Shortest possible. Visually clean. Instantly recognizable.**

### 6.2 Primary Domain

```
hirecar.io
```

### 6.3 Subdomain Map

| Subdomain | Purpose | Example URL |
|-----------|---------|-------------|
| `app` | Main web application | app.hirecar.io |
| `api` | REST API endpoints | api.hirecar.io |
| `go` | Short links / redirects | go.hirecar.io/join |
| `pass` | PassKit pass delivery | pass.hirecar.io |
| `docs` | Public documentation | docs.hirecar.io |
| `wiki` | Internal wiki (auth required) | wiki.hirecar.io |
| `qa` | QA dashboard (internal) | qa.hirecar.io |
| `ops` | Operations monitoring | ops.hirecar.io |
| `hub` | Member portal | hub.hirecar.io |
| `pay` | Payment / billing portal | pay.hirecar.io |
| `bot` | Bot interaction endpoints | bot.hirecar.io |
| `cdn` | Static assets / media | cdn.hirecar.io |

### 6.4 Naming Rules

- **Max 4 characters** for subdomains (prefer 2-3)
- **No hyphens** in subdomains (use single words)
- **Lowercase only**, no numbers unless versioned API (`v1.api.hirecar.io`)
- **Action-oriented** where possible: `go`, `pay`, `hub`
- **Consistent** with industry patterns: `api`, `cdn`, `docs`
- SSL wildcard cert: `*.hirecar.io`

### 6.5 URL Path Conventions

```
{subdomain}.hirecar.io/{resource}/{id}

Examples:
  app.hirecar.io/member/HC-2461
  api.hirecar.io/v1/enroll
  go.hirecar.io/join
  docs.hirecar.io/ws1/deploy
  hub.hirecar.io/pass/status
  pay.hirecar.io/invoice/INV-0042
```

- Paths: lowercase, hyphenated if multi-word (`/test-plans` not `/testPlans`)
- Max 3 path segments deep
- IDs use HC Format where applicable

---

## 7. Pre-Publish Alignment Confirmation

Before publishing this governance document:

- [ ] Semantic version format confirmed as `rev_MAJOR.MINOR.PATCH` with two-digit segments
- [ ] GitHub repository name and structure finalized
- [ ] Branch protection rules implementable on current GitHub plan
- [ ] Wiki auto-generation script written or template approved
- [ ] Domain `hirecar.io` registered / available (or substitute confirmed)
- [ ] All subdomains are 2-4 chars, no hyphens, lowercase
- [ ] SSL wildcard cert strategy confirmed
- [ ] Release process reviewable by all stakeholders
- [ ] This document follows HC Format brand standards (QA-HC-0001)
- [ ] Cross-referenced with BOT-HC-0001 (approval routing) and BOT-HC-0002 (QA validation)

---

## 8. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| v1.0.0 | 2026-03-04 | HIRECAR QA Team | Initial release and publishing governance |
