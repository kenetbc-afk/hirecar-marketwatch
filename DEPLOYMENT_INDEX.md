---
document_id: HC-CFG-003-A
title: HIRECAR Workspace Deployment Index
version: 1.0
date: 2026-03-04
status: READY FOR DEPLOYMENT
classification: Internal — Operations
---

# HIRECAR Workspace Deployment Index
**HC-CFG-003-A** | Rev A | 2026-03-04

---

## Deployment Readiness Summary

| Component | Status | Notes |
|-----------|--------|-------|
| WS1 Instruction Package | ✅ READY | WS1_Infrastructure_Payments_Package.docx |
| WS2 Instruction Package | ✅ READY | WS2_Bot_Building_Enrollment_Package.docx |
| WS3 Instruction Package | ✅ READY | WS3_Content_Playbooks_BitDocs_Package.docx |
| WS4 Instruction Package | ✅ READY | WS4_Execution_Monitor_Package.docx |
| Skills Repository | ✅ READY | 51 skills + 17 API refs organized by workspace |
| Brand Context & Tokens | ✅ READY | HC-CFG-002-A in shared/ |
| Design Documents | ✅ READY | 14 .docx files in root |
| Logo Assets | ⚠️ MISSING | No logo PNG/SVG files — upload required |

---

## Workspace → Document Map

### WS1 — Infrastructure & Payments
**Instruction Package:** `WS1_Infrastructure_Payments_Package.docx`
**Skills (13 total):**
- SkillsMP (8): stripe-integration, payment-integration, stripe-best-practices, cloudflare-pages-workers, vercel-deploy, deploying-to-production, sendgrid-automation, email-systems
- ClawHub (5): stripe-api, gmail, himalaya, outlook-api, api-gateway + 17 API reference docs

**Supporting Documents:**
- HIRECAR_Expanded_Architecture_v6.docx (HC-ARC)
- HIRECAR_Production_Readiness_Report.docx (HC-RPT-004-A)
- HIRECAR_Production_Gap_Analysis.docx (HC-RPT)

---

### WS2 — Bot Building & Enrollment
**Instruction Package:** `WS2_Bot_Building_Enrollment_Package.docx`
**Skills (14 total):**
- SkillsMP (8): react-nextjs-development, senior-frontend, nextjs-master, security-architect, auth-security-expert, authentication-flow-rules, zoho-crm-automation, credit-repair-strategist
- ClawHub (6): slack, notion, trello, browser-use, agent-browser, brave-search

**Supporting Documents:**
- HIRECAR_Expanded_Architecture_v6.docx (HC-ARC)
- HIRECAR_Production_Readiness_Report.docx (HC-RPT-004-A)

---

### WS3 — Content, Playbooks & BitDocs
**Instruction Package:** `WS3_Content_Playbooks_BitDocs_Package.docx`
**Skills (11 total):**
- SkillsMP (5): content-marketer, seo-content-writer, content-creator, frontend-landings, landing-page-builder
- ClawHub (6): humanizer, youtube-watcher, youtube-api-skill, blogwatcher, summarize, nano-pdf

**Supporting Documents:**
- HIRECAR_Executive_Publishing_Package.docx (HC-EAP-001-A)
- HIRECAR_Findings_Letter.docx (HC-RPT)

---

### WS4 — Execution & Monitoring
**Instruction Package:** `WS4_Execution_Monitor_Package.docx`
**Skills (8 total):**
- SkillsMP (4): ci-cd-pipelines, github-actions-cicd, stripe-billing, stripe-payments
- ClawHub (4): automation-workflows, self-improving-agent, proactive-agent, github

**Supporting Documents:**
- HIRECAR_Workspace_Execution_Plan.docx (HC-PLN)
- HIRECAR_Project_Plan_v5.docx (HC-PLN)
- HIRECAR_Plan_v4.docx (HC-PLN)

---

### Shared (Cross-Workspace)
**Skills (5 total):**
- SkillsMP (2): oauth2-authentication, cloudflare-nextjs-deployment
- ClawHub (3): skill-creator, frontend-design, stock-analysis

**Context Files:**
- HIRECAR_BRAND_CONTEXT.md (HC-CFG-002-A) — Design tokens, architecture, scoring, tiers
- SKILLS_MANIFEST.md (HC-CFG-001-A) — Full skill inventory

---

## All Documents Inventory

| # | Document | ID | Type |
|---|----------|-----|------|
| 1 | HIRECAR_Plan_v4.docx | HC-PLN-004 | Plan |
| 2 | HIRECAR_Project_Plan_v5.docx | HC-PLN-005 | Plan |
| 3 | plan-v3.docx | HC-PLN-003 | Plan |
| 4 | HIRECAR_Republish_Project_Plan_v3.docx | HC-PLN-003-R | Plan |
| 5 | HIRECAR_Gap_Analysis.docx | HC-RPT-001 | Report |
| 6 | HIRECAR_Production_Gap_Analysis.docx | HC-RPT-002 | Report |
| 7 | HIRECAR_Findings_Letter.docx | HC-RPT-003 | Report |
| 8 | HIRECAR_Production_Readiness_Report.docx | HC-RPT-004-A | Report |
| 9 | HIRECAR_Expanded_Architecture_v6.docx | HC-ARC-001-A | Architecture |
| 10 | HIRECAR_Workspace_Execution_Plan.docx | HC-PLN-006 | Plan |
| 11 | HIRECAR_Executive_Publishing_Package.docx | HC-EAP-001-A | Executive |
| 12 | WS1_Infrastructure_Payments_Package.docx | HC-WPK-001-A | Workspace |
| 13 | WS2_Bot_Building_Enrollment_Package.docx | HC-WPK-002-A | Workspace |
| 14 | WS3_Content_Playbooks_BitDocs_Package.docx | HC-WPK-003-A | Workspace |
| 15 | WS4_Execution_Monitor_Package.docx | HC-WPK-004-A | Workspace |
| 16 | HIRECAR-Design-UX-Roadmap-Figma-Brief.docx | HC-ARC-002 | Architecture |
| 17 | SKILLS_MANIFEST.md | HC-CFG-001-A | Configuration |
| 18 | HIRECAR_BRAND_CONTEXT.md | HC-CFG-002-A | Configuration |
| 19 | DEPLOYMENT_INDEX.md | HC-CFG-003-A | Configuration |

---

## Pre-Deployment Checklist

- [x] WS1-WS4 instruction packages generated and in user folder
- [x] 51 skills downloaded, converted, and organized by workspace
- [x] 17 API gateway reference docs extracted for HIRECAR services
- [x] Brand context with design tokens, scoring systems, and tier definitions
- [x] Document control IDs assigned to all documents
- [x] Skills manifest with full inventory
- [x] Credit repair skill customized for HIRECAR operators
- [ ] **Logo assets** — PNG/SVG files needed (upload to shared/assets/)
- [x] **Cloudflare Worker deployment** — Enrollment chain now runs at api.hirecar.la (replaces Make.com)
- [ ] **DNS verification** — Confirm hirecar.la and api.hirecar.la pointing to Cloudflare
- [ ] **Stripe keys** — Production keys configured (test mode for tonight)
- [ ] **API key rotation** — Rotate SkillsMP and ClawHub tokens post-session

---

*Document Control: HC-CFG-003-A | Classification: Internal — Operations | Generated: 2026-03-04*
