---
name: bitai-playbook-generator
description: Bit.ai document creation and management for HIRECAR client playbooks. Creates password-protected Credit Dispute Playbooks from templates with merge variables, manages document sharing, and integrates with PassKit and Make.com.
triggers:
  - bit.ai
  - bitai
  - playbook
  - playbook creation
  - document template
  - credit playbook
  - client playbook
  - dispute playbook
---

# Bit.ai Playbook Generator — HIRECAR

Creates personalized, password-protected Credit Dispute Playbooks for HIRECAR clients using the Bit.ai API. Each playbook is populated with client-specific data from Zoho CRM and linked to the client's PassKit Access Pass.

## API Configuration

- **Endpoint:** `https://api.bit.ai/v1`
- **Authentication:** Bearer token in Authorization header
- **Workspace:** HIRECAR Playbooks
- **Template:** Credit Dispute Playbook (HC-TMP-001-A)

## Core Operations

### 1. Create Playbook from Template

```
POST https://api.bit.ai/v1/documents
Authorization: Bearer {{BITAI_API_KEY}}
Content-Type: application/json

{
  "title": "Credit Dispute Playbook — {{client_name}} ({{dispute_id}})",
  "content": "{{TEMPLATE_HTML_WITH_MERGED_VARIABLES}}",
  "workspaceId": "{{BITAI_WORKSPACE_ID}}",
  "folderId": "{{BITAI_PLAYBOOKS_FOLDER_ID}}"
}
```

**Response:** Returns document `id` and `shareUrl`.

### 2. Set Document Password

```
PUT https://api.bit.ai/v1/documents/{{document_id}}/password
Authorization: Bearer {{BITAI_API_KEY}}
Content-Type: application/json

{
  "password": "{{access_pin}}"
}
```

### 3. Get Document Details

```
GET https://api.bit.ai/v1/documents/{{document_id}}
Authorization: Bearer {{BITAI_API_KEY}}
```

### 4. Update Document Content

```
PUT https://api.bit.ai/v1/documents/{{document_id}}
Authorization: Bearer {{BITAI_API_KEY}}
Content-Type: application/json

{
  "content": "{{UPDATED_HTML_CONTENT}}"
}
```

Use this to update playbook status, add bureau responses, or update score changes.

## Template: Credit Dispute Playbook (9 Sections)

### Section 1: Client Profile
Client info table — name, dispute ID, date, score range, items, tier, advisor, status badge.

### Section 2: Dispute Timeline
30-day FCRA timeline with milestones: Day 0 (filed) → Day 3 (acknowledgment) → Day 14 (midpoint) → Day 30 (results due) → Day 35 (follow-up).

### Section 3: Dispute Letters (Ready to Send)
Pre-formatted dispute letter template with bureau mailing addresses (Experian, Equifax, TransUnion). Client fills in specific items and mails via certified mail.

### Section 4: Score Optimization Strategy
Quick wins, AZEO (All Zero Except One) utilization strategy, Experian Boost setup.

### Section 5: Credit Utilization Tracker
Fillable table for tracking per-card utilization and targets.

### Section 6: Recovery Timeline
Impact and recovery time for each negative item type (late payments, collections, charge-offs, bankruptcies, inquiries).

### Section 7: HIRECAR Membership Impact
How credit improvement affects vehicle financing rates, insurance premiums, fleet eligibility, and membership tier advancement.

### Section 8: 30-Day Follow-Up Checklist
11-item checklist from mailing letters through pulling updated reports and notifying advisor.

### Section 9: Support & Legal
Advisor contact, support channels, CROA disclaimer, CREDITWITHKEN LLC standards notice.

## Merge Variables (12 total)

| Variable | Source | Example |
|----------|--------|---------|
| `{{client_name}}` | Zoho CRM | John Smith |
| `{{client_email}}` | Zoho CRM | john@example.com |
| `{{client_phone}}` | Zoho CRM | +12135551234 |
| `{{dispute_id}}` | Zoho CRM | DSP-2026-0042 |
| `{{dispute_date}}` | Zoho CRM | 2026-03-04 |
| `{{score_range}}` | Zoho CRM | 580-669 |
| `{{negative_items}}` | Zoho CRM | 3 collections, 1 late payment |
| `{{advisor_name}}` | Zoho CRM | Ken Eckman |
| `{{membership_tier}}` | Zoho CRM | Standard |
| `{{access_pin}}` | Cloudflare Worker (generated) | 4827 |
| `{{playbook_url}}` | Bit.ai (response) | https://bit.ai/doc/xxxxx |
| `{{pass_url}}` | PassKit (response) | https://pub1.pskt.io/c/xxxxx |

## Template File Location
- **HTML Template:** `/automation-configs/bitai/credit-dispute-playbook-template.html`
- **Document ID:** HC-TMP-001-A

## Integration with PassKit
After playbook creation:
1. Get `shareUrl` from Bit.ai response
2. Pass `shareUrl` as `playbook_url` to PassKit pass creation
3. QR code on pass encodes: `{{playbook_url}}?pin={{access_pin}}`

## Security
- Password protection via 4-digit PIN (unique per client)
- Non-guessable document URLs
- API keys in environment variables only
- Documents stored in HIRECAR workspace with access controls
