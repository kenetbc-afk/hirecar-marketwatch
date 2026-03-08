---
name: passkit-enrollment-automation
description: PassKit digital wallet pass creation and management for HIRECAR client enrollment. Creates Access Passes, manages pass updates, handles push notifications, and integrates with Apple Wallet + Google Wallet via PassKit API.
triggers:
  - passkit
  - access pass
  - wallet pass
  - digital pass
  - enrollment pass
  - apple wallet
  - google wallet
  - pass creation
  - pass update
  - push notification
---

# PassKit Enrollment Automation — HIRECAR

Manages the creation, distribution, and real-time updating of HIRECAR Access Passes via the PassKit API. Each pass grants clients access to their personalized Credit Dispute Playbook through a QR code and PIN system.

## API Configuration

- **Endpoint:** `https://api.pub1.passkit.io`
- **Authentication:** Bearer token in Authorization header
- **Project:** ACCESS PASS (Membership program)
- **Webhook ID:** `2PlkkHry7o3xYlj1KDEV1w`
- **Webhook URL:** `https://www.hirecar.la/services`

## Core Operations

### 1. Create a New Pass (Enrollment)

```
POST https://api.pub1.passkit.io/members/member
Authorization: Bearer {{PASSKIT_API_KEY}}
Content-Type: application/json

{
  "tierId": "{{HIRECAR_TIER_ID}}",
  "memberId": "HC-DSP-{{dispute_id}}",
  "person": {
    "displayName": "{{client_name}}",
    "emailAddress": "{{client_email}}"
  },
  "metaData": {
    "dispute_id": "{{dispute_id}}",
    "playbook_url": "{{playbook_url}}",
    "access_pin": "{{access_pin}}",
    "score_range": "{{score_range}}",
    "dispute_status": "ACTIVE",
    "advisor_name": "{{advisor_name}}",
    "membership_tier": "{{membership_tier}}",
    "negative_items": "{{negative_items}}",
    "dispute_date": "{{dispute_date}}"
  }
}
```

**Response:** Returns `passUrl` — the download link for Apple/Google Wallet.

### 2. Update Pass Fields (Status Change, Score Update)

```
PUT https://api.pub1.passkit.io/members/member
Authorization: Bearer {{PASSKIT_API_KEY}}
Content-Type: application/json

{
  "memberId": "HC-DSP-{{dispute_id}}",
  "metaData": {
    "dispute_status": "{{new_status}}",
    "score_range": "{{new_score_range}}"
  }
}
```

Triggers push notification to client's device automatically.

### 3. Get Pass Details

```
GET https://api.pub1.passkit.io/members/member/HC-DSP-{{dispute_id}}
Authorization: Bearer {{PASSKIT_API_KEY}}
```

### 4. Delete/Void Pass

```
DELETE https://api.pub1.passkit.io/members/member/HC-DSP-{{dispute_id}}
Authorization: Bearer {{PASSKIT_API_KEY}}
```

## Pass Design Specification

### Colors (HIRECAR Brand)
- **Background:** #111820 (--ink)
- **Foreground:** #FFFFFF
- **Label:** #C9920A (--cta-gold)

### Field Layout (Apple Wallet)

| Position | Key | Label | Value | Updatable |
|----------|-----|-------|-------|-----------|
| Header | dispute_status | STATUS | ACTIVE/RESOLVED/PENDING | ✅ |
| Primary | client_name | MEMBER | Client full name | ❌ |
| Secondary | dispute_id | DISPUTE ID | DSP-2026-XXXX | ❌ |
| Secondary | membership_tier | TIER | Standard/Operator/FC/Elite | ✅ |
| Auxiliary | score_range | CREDIT RANGE | e.g. 580-669 | ✅ |
| Auxiliary | dispute_date | FILED | YYYY-MM-DD | ❌ |
| Auxiliary | advisor_name | ADVISOR | Advisor name | ❌ |
| Back | playbook_url | Playbook Link | Bit.ai URL | ❌ |
| Back | access_pin | Playbook PIN | 4-digit code | ❌ |
| Back | negative_items | Items Under Dispute | Description | ✅ |
| Back | next_steps | Next Steps | Current instructions | ✅ |
| Back | support_contact | Support | Contact info | ❌ |

### Barcode
- **Format:** QR Code (PKBarcodeFormatQR)
- **Content:** `{{playbook_url}}?pin={{access_pin}}`

## Webhook Events (Inbound)

PassKit sends webhooks to `https://www.hirecar.la/services` for:
- `pass.installed` — Client added pass to wallet
- `pass.updated` — Pass fields changed
- `pass.uninstalled` — Client removed pass from wallet

## Security
- API key stored as environment variable, never in code
- PIN is 4-digit random, unique per client
- Back fields require device authentication
- All API calls over HTTPS/TLS 1.3

## Integration Chain
1. Zoho CRM → Cloudflare Worker /api/enroll → Generate PIN → Create Bit.ai Playbook → Create PassKit Pass → Send Email → Send SMS
2. Status updates: Zoho CRM → Cloudflare Worker → Update PassKit metaData → Push notification via SLACK_WEBHOOK_URL

## Disclaimer
Store API keys in environment variables. Rotate keys after each development session. Move project from Draft to Live before production distribution.
