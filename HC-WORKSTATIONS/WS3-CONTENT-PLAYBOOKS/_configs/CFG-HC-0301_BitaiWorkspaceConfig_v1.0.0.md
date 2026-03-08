---
document_id: HC-CFG-021-A
title: Bit.ai Workspace Configuration
version: 1.0
date: 2026-03-04
status: READY FOR IMPLEMENTATION
classification: Internal — WS3 Content Playbooks
workstation: WS3-CONTENT-PLAYBOOKS
---

# Bit.ai Workspace Configuration

## 1. Workspace Structure

**Workspace Name:** HIRECAR Playbooks
**URL:** hirecar.bitdocs.ai

### 1.1 Collection Hierarchy

```
HIRECAR Playbooks (workspace)
├── Phase 1 — Intake
│   ├── Welcome Guide
│   └── Getting Started Checklist
├── Phase 2 — Recovery (Q1 Credit Playbook)
│   ├── Chapter 1: Understanding Your Credit
│   ├── Chapter 2: Dispute Strategy
│   ├── Chapter 3: Collections & Protection
│   └── Chapter 4: Building Positive Credit
├── Phase 3 — Rebuilding
│   ├── Business Credit Guide
│   └── Vendor Credit Playbook
├── Phase 4 — Operating
│   ├── Fleet Management Guide
│   └── Tax Optimization Playbook
├── Phase 5 — Scaling
│   ├── Scaling Playbook
│   └── Investment Strategy Guide
└── Templates
    ├── Disputes
    │   ├── Template 1: Inaccuracy Dispute (FCRA §611)
    │   ├── Template 2: Identity Theft Dispute (FCRA §605B)
    │   ├── Template 3: Debt Validation Letter (FDCPA §809)
    │   ├── Template 4: Cease & Desist (FDCPA §805c)
    │   └── Template 5: Goodwill Deletion Request
    └── Accounting
        ├── Invoice Template
        ├── Sales Order Template
        └── Purchase Order Template
```

### 1.2 Access Control

| Collection | Standard | Operator | First Class | Elite |
|---|---|---|---|---|
| Phase 1 — Intake | Read | Read | Read | Read |
| Phase 2 — Recovery | Read | Read | Read | Read |
| Phase 3 — Rebuilding | Locked | Read | Read | Read |
| Phase 4 — Operating | Locked | Locked | Read | Read |
| Phase 5 — Scaling | Locked | Locked | Locked | Read |
| Templates — Disputes | Read | Read | Read | Read |
| Templates — Accounting | Hidden | Hidden | Hidden | Admin |

---

## 2. API Integration

### 2.1 Playbook Creation via Cloudflare Worker

The enrollment chain (HC-CFG-014-A, Step 2) creates a personalized playbook instance for each new member via the Bit.ai API.

**Endpoint:** `https://api.bit.ai/v1/documents`
**Method:** POST
**Auth:** Bearer token (BITAI_API_KEY secret in Cloudflare Worker)

**API Call Flow:**
1. Worker receives enrollment webhook from Zoho CRM
2. Worker calls Bit.ai API to create a new document from the Phase 2 template
3. Merge fields populated: `{{member_name}}`, `{{pin}}`, `{{tier}}`, `{{score_range}}`, `{{enrollment_date}}`
4. Bit.ai returns the document URL (stored as `Playbook_URL` in Zoho CRM)
5. Document URL included in welcome email and welcome pass page

### 2.2 Merge Field Mapping

| Merge Field | Source | Example Value |
|---|---|---|
| `{{member_name}}` | webhook payload `client_name` | "Marcus Johnson" |
| `{{pin}}` | generated in Worker Step 1 | "847291" |
| `{{tier}}` | webhook payload `membership_tier` | "Standard" |
| `{{score_range}}` | webhook payload `score_range` | "580-669" |
| `{{enrollment_date}}` | webhook payload `dispute_date` | "2026-03-04" |
| `{{dispute_id}}` | webhook payload `dispute_id` | "DSP-2026-0042" |
| `{{advisor_name}}` | webhook payload `advisor_name` | "Sarah Chen" |

---

## 3. Template Standards

### 3.1 Document Formatting

| Element | Standard |
|---|---|
| Headings | H2 for sections, H3 for subsections |
| Body Font | System default (Bit.ai) |
| Key Terms | **Bold** |
| Legal References | *Italic* |
| Callout Boxes | Bit.ai callout block for "Next Steps" and "Important" |
| Links | Blue, underlined — open in new tab |

### 3.2 Brand Voice

| Attribute | Guideline |
|---|---|
| Tone | Authoritative but accessible — professional mentor, not salesperson |
| Language Level | 8th grade reading level (Flesch-Kincaid) |
| Disclaimers | Frame as education/tools, never legal or financial advice |
| Results Language | "may improve", "potential correction", "subject to response" |
| Prohibited | Guaranteed outcomes, specific product endorsements as advice |

---

## 4. Content Milestone Gates

Each chapter requires the member to complete an action before the next chapter becomes accessible.

| Chapter | Gate Requirement | Verification |
|---|---|---|
| Ch 1 → Ch 2 | Uploaded at least 1 credit report | Manual advisor check or self-report |
| Ch 2 → Ch 3 | Submitted at least 1 dispute letter | Dispute Tracking Table entry |
| Ch 3 → Ch 4 | Validated or resolved at least 1 collection | Collections log entry |
| Ch 4 → Complete | All 4 chapters marked complete | HIRECREDIT Certified badge awarded |

---

## 5. Implementation Checklist

- [ ] Create Bit.ai account and workspace "HIRECAR Playbooks"
- [ ] Create 5 phase collections with correct naming
- [ ] Create Templates collection with Disputes and Accounting sub-collections
- [ ] Build master template for Phase 2 playbook with merge fields
- [ ] Generate Bit.ai API key and add to Cloudflare Worker secrets (BITAI_API_KEY)
- [ ] Test API document creation with sample merge data
- [ ] Verify merge field population renders correctly
- [ ] Set up access controls per tier matrix
- [ ] Create 3 test playbooks and verify across tiers
- [ ] Configure Slack notification for new playbook creation (#hirecar-content-pipeline)

---

*Document Control: HC-CFG-021-A | WS3-CONTENT-PLAYBOOKS | 2026-03-04*
